use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, MintTo, Transfer};
use anchor_spl::associated_token::AssociatedToken;

declare_id!("EGMTxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx");

/// EngageMint Bonding Curve Program
///
/// Implements Pump.fun-style bonding curve for fair token launches:
/// - Constant product AMM (x * y = k)
/// - Automatic price discovery
/// - Graduation to Raydium at market cap threshold
#[program]
pub mod engagemint_bonding_curve {
    use super::*;

    /// Initialize a new bonding curve for a token
    ///
    /// Sets up:
    /// - Token mint
    /// - Bonding curve state
    /// - Virtual reserves (SOL and token)
    /// - Creator fee account
    pub fn initialize_curve(
        ctx: Context<InitializeCurve>,
        token_name: String,
        token_symbol: String,
        token_uri: String,
        video_id: String,
    ) -> Result<()> {
        let curve = &mut ctx.accounts.bonding_curve;
        let clock = Clock::get()?;

        // Validate inputs
        require!(token_name.len() <= 32, ErrorCode::NameTooLong);
        require!(token_symbol.len() <= 10, ErrorCode::SymbolTooLong);
        require!(token_uri.len() <= 200, ErrorCode::UriTooLong);

        // Initialize bonding curve state
        curve.creator = ctx.accounts.creator.key();
        curve.token_mint = ctx.accounts.token_mint.key();
        curve.curve_authority = ctx.accounts.curve_authority.key();
        curve.token_name = token_name;
        curve.token_symbol = token_symbol;
        curve.token_uri = token_uri;
        curve.video_id = video_id;

        // Bonding curve parameters (Pump.fun style)
        curve.virtual_token_reserves = 1_073_000_000_000_000; // 1.073B tokens (virtual)
        curve.virtual_sol_reserves = 30_000_000_000; // 30 SOL (virtual)
        curve.real_token_reserves = 793_100_000_000; // 793.1M tokens (real, sellable)
        curve.real_sol_reserves = 0; // Starts at 0

        // Thresholds
        curve.target_sol_amount = 85_000_000_000; // 85 SOL to graduate (~$17k at $200/SOL)
        curve.raydium_migration_threshold = 85_000_000_000;

        // State
        curve.is_graduated = false;
        curve.total_supply = 1_000_000_000_000; // 1 billion total
        curve.created_at = clock.unix_timestamp;
        curve.trade_count = 0;

        // Fee configuration (1% platform fee)
        curve.fee_basis_points = 100; // 1%
        curve.accumulated_fees = 0;

        msg!("Bonding curve initialized for {}", curve.token_symbol);
        msg!("Target: {} SOL for Raydium migration", curve.target_sol_amount / 1_000_000_000);

        Ok(())
    }

    /// Buy tokens from the bonding curve
    ///
    /// Uses constant product formula: (x + Δx)(y - Δy) = k
    /// Where: x = SOL reserves, y = token reserves
    pub fn buy(
        ctx: Context<Buy>,
        sol_amount: u64,
        min_tokens_out: u64,
    ) -> Result<()> {
        let curve = &mut ctx.accounts.bonding_curve;

        require!(!curve.is_graduated, ErrorCode::CurveGraduated);
        require!(sol_amount > 0, ErrorCode::InvalidAmount);

        // Calculate tokens to receive using bonding curve formula
        let tokens_out = calculate_tokens_out(
            sol_amount,
            curve.virtual_sol_reserves,
            curve.virtual_token_reserves,
        )?;

        // Check slippage protection
        require!(tokens_out >= min_tokens_out, ErrorCode::SlippageExceeded);

        // Calculate platform fee (1%)
        let fee = sol_amount
            .checked_mul(curve.fee_basis_points as u64)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::MathOverflow)?;

        let sol_after_fee = sol_amount
            .checked_sub(fee)
            .ok_or(ErrorCode::MathOverflow)?;

        // Transfer SOL from buyer to curve vault
        let transfer_instruction = anchor_lang::solana_program::system_instruction::transfer(
            &ctx.accounts.buyer.key(),
            &ctx.accounts.curve_sol_vault.key(),
            sol_after_fee,
        );

        anchor_lang::solana_program::program::invoke(
            &transfer_instruction,
            &[
                ctx.accounts.buyer.to_account_info(),
                ctx.accounts.curve_sol_vault.to_account_info(),
                ctx.accounts.system_program.to_account_info(),
            ],
        )?;

        // Transfer fee to platform
        if fee > 0 {
            let fee_transfer = anchor_lang::solana_program::system_instruction::transfer(
                &ctx.accounts.buyer.key(),
                &ctx.accounts.platform_fee_account.key(),
                fee,
            );

            anchor_lang::solana_program::program::invoke(
                &fee_transfer,
                &[
                    ctx.accounts.buyer.to_account_info(),
                    ctx.accounts.platform_fee_account.to_account_info(),
                    ctx.accounts.system_program.to_account_info(),
                ],
            )?;
        }

        // Transfer tokens from curve to buyer
        let authority_seeds = &[
            b"curve_authority",
            curve.token_mint.as_ref(),
            &[ctx.bumps.curve_authority],
        ];
        let signer_seeds = &[&authority_seeds[..]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.curve_token_vault.to_account_info(),
                to: ctx.accounts.buyer_token_account.to_account_info(),
                authority: ctx.accounts.curve_authority.to_account_info(),
            },
            signer_seeds,
        );

        token::transfer(transfer_ctx, tokens_out)?;

        // Update curve state
        curve.real_sol_reserves = curve.real_sol_reserves
            .checked_add(sol_after_fee)
            .ok_or(ErrorCode::MathOverflow)?;

        curve.real_token_reserves = curve.real_token_reserves
            .checked_sub(tokens_out)
            .ok_or(ErrorCode::MathOverflow)?;

        curve.virtual_sol_reserves = curve.virtual_sol_reserves
            .checked_add(sol_after_fee)
            .ok_or(ErrorCode::MathOverflow)?;

        curve.virtual_token_reserves = curve.virtual_token_reserves
            .checked_sub(tokens_out)
            .ok_or(ErrorCode::MathOverflow)?;

        curve.trade_count = curve.trade_count.checked_add(1).unwrap();
        curve.accumulated_fees = curve.accumulated_fees
            .checked_add(fee)
            .ok_or(ErrorCode::MathOverflow)?;

        msg!("Buy: {} SOL -> {} tokens", sol_amount, tokens_out);
        msg!("Real reserves: {} SOL, {} tokens", curve.real_sol_reserves, curve.real_token_reserves);

        // Check if ready for Raydium migration
        if curve.real_sol_reserves >= curve.raydium_migration_threshold {
            msg!("🎉 Bonding curve complete! Ready for Raydium migration");
            curve.is_graduated = true;
        }

        Ok(())
    }

    /// Sell tokens back to the bonding curve
    ///
    /// Uses constant product formula: (x - Δx)(y + Δy) = k
    pub fn sell(
        ctx: Context<Sell>,
        token_amount: u64,
        min_sol_out: u64,
    ) -> Result<()> {
        let curve = &mut ctx.accounts.bonding_curve;

        require!(!curve.is_graduated, ErrorCode::CurveGraduated);
        require!(token_amount > 0, ErrorCode::InvalidAmount);

        // Calculate SOL to receive
        let sol_out = calculate_sol_out(
            token_amount,
            curve.virtual_token_reserves,
            curve.virtual_sol_reserves,
        )?;

        // Check slippage protection
        require!(sol_out >= min_sol_out, ErrorCode::SlippageExceeded);

        // Calculate platform fee
        let fee = sol_out
            .checked_mul(curve.fee_basis_points as u64)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(10000)
            .ok_or(ErrorCode::MathOverflow)?;

        let sol_after_fee = sol_out
            .checked_sub(fee)
            .ok_or(ErrorCode::MathOverflow)?;

        // Transfer tokens from seller to curve
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.seller_token_account.to_account_info(),
                to: ctx.accounts.curve_token_vault.to_account_info(),
                authority: ctx.accounts.seller.to_account_info(),
            },
        );

        token::transfer(transfer_ctx, token_amount)?;

        // Transfer SOL from curve to seller (after fee)
        **ctx.accounts.curve_sol_vault.try_borrow_mut_lamports()? = ctx.accounts.curve_sol_vault.lamports()
            .checked_sub(sol_after_fee)
            .ok_or(ErrorCode::InsufficientFunds)?;

        **ctx.accounts.seller.try_borrow_mut_lamports()? = ctx.accounts.seller.lamports()
            .checked_add(sol_after_fee)
            .ok_or(ErrorCode::MathOverflow)?;

        // Transfer fee
        if fee > 0 {
            **ctx.accounts.curve_sol_vault.try_borrow_mut_lamports()? = ctx.accounts.curve_sol_vault.lamports()
                .checked_sub(fee)
                .ok_or(ErrorCode::InsufficientFunds)?;

            **ctx.accounts.platform_fee_account.try_borrow_mut_lamports()? = ctx.accounts.platform_fee_account.lamports()
                .checked_add(fee)
                .ok_or(ErrorCode::MathOverflow)?;
        }

        // Update curve state
        curve.real_sol_reserves = curve.real_sol_reserves
            .checked_sub(sol_out)
            .ok_or(ErrorCode::InsufficientFunds)?;

        curve.real_token_reserves = curve.real_token_reserves
            .checked_add(token_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        curve.virtual_sol_reserves = curve.virtual_sol_reserves
            .checked_sub(sol_out)
            .ok_or(ErrorCode::InsufficientFunds)?;

        curve.virtual_token_reserves = curve.virtual_token_reserves
            .checked_add(token_amount)
            .ok_or(ErrorCode::MathOverflow)?;

        curve.trade_count = curve.trade_count.checked_add(1).unwrap();
        curve.accumulated_fees = curve.accumulated_fees
            .checked_add(fee)
            .ok_or(ErrorCode::MathOverflow)?;

        msg!("Sell: {} tokens -> {} SOL", token_amount, sol_out);

        Ok(())
    }

    /// Migrate liquidity to Raydium when bonding curve is complete
    ///
    /// This locks liquidity permanently by:
    /// 1. Creating Raydium pool with curve reserves
    /// 2. Burning LP tokens
    /// 3. Marking curve as graduated
    pub fn migrate_to_raydium(
        ctx: Context<MigrateToRaydium>,
    ) -> Result<()> {
        let curve = &mut ctx.accounts.bonding_curve;

        require!(!curve.is_graduated, ErrorCode::AlreadyGraduated);
        require!(
            curve.real_sol_reserves >= curve.raydium_migration_threshold,
            ErrorCode::ThresholdNotMet
        );

        // Mark as graduated
        curve.is_graduated = true;

        msg!("🚀 Migrating to Raydium!");
        msg!("Liquidity: {} SOL + {} tokens",
            curve.real_sol_reserves / 1_000_000_000,
            curve.real_token_reserves / 1_000_000_000
        );

        // TODO: Implement Raydium pool creation
        // This requires:
        // 1. Call Raydium initialize instruction
        // 2. Deposit SOL + tokens
        // 3. Receive and burn LP tokens
        // 4. Emit migration event

        Ok(())
    }
}

// ============================================================================
// Account Structures
// ============================================================================

#[derive(Accounts)]
pub struct InitializeCurve<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 9,
        mint::authority = curve_authority,
    )]
    pub token_mint: Account<'info, Mint>,

    #[account(
        init,
        payer = creator,
        space = 8 + BondingCurve::INIT_SPACE,
        seeds = [b"bonding_curve", token_mint.key().as_ref()],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    /// CHECK: PDA authority for curve operations
    #[account(
        seeds = [b"curve_authority", token_mint.key().as_ref()],
        bump
    )]
    pub curve_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = creator,
        associated_token::mint = token_mint,
        associated_token::authority = curve_authority,
    )]
    pub curve_token_vault: Account<'info, TokenAccount>,

    /// CHECK: SOL vault for curve
    #[account(
        mut,
        seeds = [b"curve_sol_vault", token_mint.key().as_ref()],
        bump
    )]
    pub curve_sol_vault: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct Buy<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bonding_curve", bonding_curve.token_mint.as_ref()],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    /// CHECK: PDA authority
    #[account(
        seeds = [b"curve_authority", bonding_curve.token_mint.as_ref()],
        bump
    )]
    pub curve_authority: UncheckedAccount<'info>,

    #[account(mut)]
    pub curve_token_vault: Account<'info, TokenAccount>,

    /// CHECK: SOL vault
    #[account(
        mut,
        seeds = [b"curve_sol_vault", bonding_curve.token_mint.as_ref()],
        bump
    )]
    pub curve_sol_vault: UncheckedAccount<'info>,

    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = bonding_curve.token_mint,
        associated_token::authority = buyer,
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// CHECK: Platform fee collector
    #[account(mut)]
    pub platform_fee_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Sell<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bonding_curve", bonding_curve.token_mint.as_ref()],
        bump
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    #[account(mut)]
    pub curve_token_vault: Account<'info, TokenAccount>,

    /// CHECK: SOL vault
    #[account(
        mut,
        seeds = [b"curve_sol_vault", bonding_curve.token_mint.as_ref()],
        bump
    )]
    pub curve_sol_vault: UncheckedAccount<'info>,

    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,

    /// CHECK: Platform fee collector
    #[account(mut)]
    pub platform_fee_account: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MigrateToRaydium<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        mut,
        seeds = [b"bonding_curve", bonding_curve.token_mint.as_ref()],
        bump,
        has_one = creator
    )]
    pub bonding_curve: Account<'info, BondingCurve>,

    /// CHECK: Raydium program
    pub raydium_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

// ============================================================================
// State
// ============================================================================

#[account]
#[derive(InitSpace)]
pub struct BondingCurve {
    pub creator: Pubkey,
    pub token_mint: Pubkey,
    pub curve_authority: Pubkey,

    #[max_len(32)]
    pub token_name: String,

    #[max_len(10)]
    pub token_symbol: String,

    #[max_len(200)]
    pub token_uri: String,

    #[max_len(64)]
    pub video_id: String,

    // Bonding curve reserves
    pub virtual_token_reserves: u64,
    pub virtual_sol_reserves: u64,
    pub real_token_reserves: u64,
    pub real_sol_reserves: u64,

    // Configuration
    pub total_supply: u64,
    pub target_sol_amount: u64,
    pub raydium_migration_threshold: u64,
    pub fee_basis_points: u16,

    // State
    pub is_graduated: bool,
    pub trade_count: u64,
    pub accumulated_fees: u64,
    pub created_at: i64,
}

// ============================================================================
// Helper Functions
// ============================================================================

/// Calculate tokens out for a given SOL input
/// Formula: Δy = (y * Δx) / (x + Δx)
fn calculate_tokens_out(
    sol_in: u64,
    sol_reserves: u64,
    token_reserves: u64,
) -> Result<u64> {
    let numerator = (token_reserves as u128)
        .checked_mul(sol_in as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let denominator = (sol_reserves as u128)
        .checked_add(sol_in as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let tokens_out = numerator
        .checked_div(denominator)
        .ok_or(ErrorCode::MathOverflow)?;

    Ok(tokens_out as u64)
}

/// Calculate SOL out for a given token input
/// Formula: Δx = (x * Δy) / (y + Δy)
fn calculate_sol_out(
    tokens_in: u64,
    token_reserves: u64,
    sol_reserves: u64,
) -> Result<u64> {
    let numerator = (sol_reserves as u128)
        .checked_mul(tokens_in as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let denominator = (token_reserves as u128)
        .checked_add(tokens_in as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    let sol_out = numerator
        .checked_div(denominator)
        .ok_or(ErrorCode::MathOverflow)?;

    Ok(sol_out as u64)
}

// ============================================================================
// Errors
// ============================================================================

#[error_code]
pub enum ErrorCode {
    #[msg("Token name is too long")]
    NameTooLong,

    #[msg("Token symbol is too long")]
    SymbolTooLong,

    #[msg("Token URI is too long")]
    UriTooLong,

    #[msg("Invalid amount")]
    InvalidAmount,

    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,

    #[msg("Math overflow")]
    MathOverflow,

    #[msg("Insufficient funds")]
    InsufficientFunds,

    #[msg("Bonding curve has graduated to Raydium")]
    CurveGraduated,

    #[msg("Already graduated")]
    AlreadyGraduated,

    #[msg("Threshold not met for migration")]
    ThresholdNotMet,
}
