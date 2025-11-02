const { Connection, Keypair } = require('@solana/web3.js');
const { createMint, getOrCreateAssociatedTokenAccount, mintTo } = require('@solana/spl-token');
const fs = require('fs');

async function testTokenCreation() {
  console.log('🧪 Testing Token Creation on Devnet\n');

  // Load devnet wallet
  const keypairData = JSON.parse(fs.readFileSync('/root/.config/solana/devnet-wallet.json'));
  const payer = Keypair.fromSecretKey(new Uint8Array(keypairData));

  console.log('Wallet:', payer.publicKey.toString());

  // Connect to devnet
  const connection = new Connection('https://api.devnet.solana.com', 'confirmed');

  // Check balance
  const balance = await connection.getBalance(payer.publicKey);
  console.log('Balance:', balance / 1e9, 'SOL\n');

  if (balance < 0.1e9) {
    console.error('❌ Not enough SOL! Run: solana airdrop 2');
    return;
  }

  console.log('Creating token mint...');
  const startBalance = balance;

  // Create mint (same as viralMonitor.js does)
  const mint = await createMint(
    connection,
    payer,              // Payer
    payer.publicKey,    // Mint authority
    payer.publicKey,    // Freeze authority
    9                   // Decimals
  );

  console.log('✅ Mint created:', mint.toString());

  // Create token account
  console.log('Creating token account...');
  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    payer.publicKey
  );

  console.log('✅ Token account:', tokenAccount.address.toString());

  // Mint 1M tokens
  console.log('Minting 1,000,000 tokens...');
  const signature = await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    1_000_000 * 1e9  // 1M tokens with 9 decimals
  );

  console.log('✅ Minted! Signature:', signature);

  // Check cost
  const endBalance = await connection.getBalance(payer.publicKey);
  const cost = (startBalance - endBalance) / 1e9;

  console.log('\n📊 Cost Analysis:');
  console.log('SOL Spent:', cost.toFixed(4), 'SOL');
  console.log('USD Cost (at $200/SOL):', (cost * 200).toFixed(2), 'USD');
  console.log('\n✅ Token creation works! Ready for integration.');
  console.log('\nView on Solana Explorer:');
  console.log('https://explorer.solana.com/address/' + mint.toString() + '?cluster=devnet');
}

testTokenCreation().catch(console.error);
