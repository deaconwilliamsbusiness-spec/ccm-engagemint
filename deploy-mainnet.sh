#!/bin/bash

##############################################################################
# EngageMint Mainnet-Beta Deployment Script
#
# PRODUCTION DEPLOYMENT - USE WITH CAUTION
#
# This script deploys to Solana mainnet-beta with real SOL and real money.
# Ensure you have:
# - Tested thoroughly on devnet
# - Audited smart contract code
# - Funded wallet with enough SOL (minimum 5 SOL recommended)
# - Backup of all keypairs
#
# Usage:
#   chmod +x deploy-mainnet.sh
#   ./deploy-mainnet.sh
##############################################################################

set -e  # Exit on error

echo "========================================"
echo "🚨 EngageMint MAINNET Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Safety check
echo -e "${RED}⚠️  WARNING: This will deploy to MAINNET-BETA with REAL SOL${NC}"
echo ""
echo "Before proceeding, confirm you have:"
echo "  ✓ Tested on devnet thoroughly"
echo "  ✓ Audited smart contract code"
echo "  ✓ Backed up all keypairs"
echo "  ✓ Minimum 5 SOL in wallet for deployment"
echo "  ✓ Production environment variables configured"
echo ""
read -p "Type 'DEPLOY TO MAINNET' to continue: " confirmation

if [ "$confirmation" != "DEPLOY TO MAINNET" ]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

echo ""
echo -e "${GREEN}Proceeding with mainnet deployment...${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found${NC}"
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# Step 2: Set Solana to mainnet-beta
echo -e "${YELLOW}Step 2: Configuring Solana for mainnet-beta...${NC}"
solana config set --url mainnet-beta
echo -e "${GREEN}✅ Solana set to mainnet-beta${NC}"
echo ""

# Step 3: Check wallet balance
echo -e "${YELLOW}Step 3: Checking wallet balance...${NC}"
WALLET=$(solana address)
BALANCE=$(solana balance | awk '{print $1}')
echo "Wallet: $WALLET"
echo "Balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 5" | bc -l) )); then
    echo -e "${RED}❌ Insufficient balance. Minimum 5 SOL required for deployment.${NC}"
    echo "Please fund your wallet and try again."
    exit 1
fi

echo -e "${GREEN}✅ Wallet balance sufficient${NC}"
echo ""

# Step 4: Final confirmation
echo -e "${RED}🚨 FINAL CONFIRMATION${NC}"
echo "  Network: mainnet-beta"
echo "  Wallet: $WALLET"
echo "  Balance: $BALANCE SOL"
echo "  Estimated cost: 3-5 SOL"
echo ""
read -p "Proceed with deployment? (yes/no): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

echo ""

# Step 5: Build smart contract
echo -e "${YELLOW}Step 4: Building smart contract...${NC}"
cd "$(dirname "$0")"

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf target/deploy/*.so
rm -rf target/idl/*.json
find . -name "Cargo.lock" -type f -delete

# Build with Anchor
echo "Running anchor build..."
anchor build

if [ ! -f "target/deploy/engagemint_bonding_curve.so" ]; then
    echo -e "${RED}❌ Build failed - .so file not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Smart contract built successfully${NC}"
echo ""

# Step 6: Deploy smart contract to mainnet
echo -e "${YELLOW}Step 5: Deploying smart contract to mainnet-beta...${NC}"
echo -e "${RED}⏳ This will use real SOL. Do not interrupt...${NC}"

anchor deploy --provider.cluster mainnet

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Smart contract deployed to mainnet${NC}"
echo ""

# Step 7: Get program ID
echo -e "${YELLOW}Step 6: Retrieving program ID...${NC}"
PROGRAM_ID=$(solana address -k target/deploy/engagemint_bonding_curve-keypair.json)
echo "Program ID: $PROGRAM_ID"
echo ""

# Step 8: Verify deployment
echo -e "${YELLOW}Step 7: Verifying deployment...${NC}"
sleep 5
solana program show "$PROGRAM_ID"
echo -e "${GREEN}✅ Deployment verified on-chain${NC}"
echo ""

# Step 9: Update environment files
echo -e "${YELLOW}Step 8: Updating environment files...${NC}"

# Backend .env.production
if [ ! -f "backend/.env.production" ]; then
    touch backend/.env.production
fi

cat > backend/.env.production << EOF
# PRODUCTION ENVIRONMENT - MAINNET
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
BONDING_CURVE_PROGRAM_ID=$PROGRAM_ID

# CRITICAL: Set these in your production environment
# DATABASE_URL=postgresql://...
# PLATFORM_WALLET_PRIVATE_KEY=...
# JWT_SECRET=...

# Blockchain sync
BLOCKCHAIN_SYNC_INTERVAL_MS=10000

# Viral launch settings
VIRAL_THRESHOLD_LIKES=10000
PLATFORM_MINT_BUDGET_SOL=0.5
EOF

# Frontend .env.production
if [ ! -f "frontend/.env.production" ]; then
    touch frontend/.env.production
fi

cat > frontend/.env.production << EOF
# PRODUCTION ENVIRONMENT - MAINNET
NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=$PROGRAM_ID
NEXT_PUBLIC_INSTANT_MINT_COST_SOL=0.01

# CRITICAL: Set these in your production environment
# NEXT_PUBLIC_API_URL=https://your-backend.com
# NEXT_PUBLIC_PLATFORM_WALLET=...
EOF

echo -e "${GREEN}✅ Production environment files created${NC}"
echo ""

# Step 10: Copy IDL to frontend and backend
echo -e "${YELLOW}Step 9: Copying IDL files...${NC}"
mkdir -p frontend/src/idl
mkdir -p backend/src/idl

cp target/idl/engagemint_bonding_curve.json frontend/src/idl/
cp target/idl/engagemint_bonding_curve.json backend/src/idl/

echo -e "${GREEN}✅ IDL files copied${NC}"
echo ""

# Step 11: Run database migration on production
echo -e "${YELLOW}Step 10: Database migration...${NC}"
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set.${NC}"
    echo "Run manually on production database:"
    echo "  psql \$DATABASE_URL -f backend/db-migrations/add-blockchain-sync.sql"
else
    read -p "Run migration on production database now? (yes/no): " run_migration
    if [ "$run_migration" = "yes" ]; then
        psql "$DATABASE_URL" -f backend/db-migrations/add-blockchain-sync.sql
        echo -e "${GREEN}✅ Database migration completed${NC}"
    fi
fi
echo ""

# Step 12: Create deployment record
echo -e "${YELLOW}Step 11: Creating deployment record...${NC}"

DEPLOYMENT_LOG="MAINNET_DEPLOYMENT_$(date +%Y%m%d_%H%M%S).txt"

cat > "$DEPLOYMENT_LOG" << EOF
======================================
EngageMint Mainnet Deployment Record
======================================

Deployment Date: $(date)
Network: mainnet-beta
Deployer Wallet: $WALLET
Remaining Balance: $(solana balance)

Smart Contract:
  Program ID: $PROGRAM_ID
  Build: target/deploy/engagemint_bonding_curve.so
  IDL: target/idl/engagemint_bonding_curve.json

Verification:
  Solscan: https://solscan.io/account/$PROGRAM_ID
  Solana Explorer: https://explorer.solana.com/address/$PROGRAM_ID

Configuration Files:
  Backend: backend/.env.production
  Frontend: frontend/.env.production

CRITICAL: Backup Files
  Program Keypair: target/deploy/engagemint_bonding_curve-keypair.json
  Platform Wallet: [BACKUP SECURELY]

Next Steps:
  1. Verify contract on Solscan
  2. Test token creation with small amount
  3. Configure production secrets
  4. Deploy backend to production server
  5. Deploy frontend to Vercel/production
  6. Start blockchain sync service
  7. Monitor logs and transactions

Emergency Contacts:
  [Add your contact information]

======================================
EOF

echo -e "${GREEN}✅ Deployment record saved: $DEPLOYMENT_LOG${NC}"
echo ""

# Step 13: Summary
echo "========================================"
echo -e "${GREEN}✅ MAINNET DEPLOYMENT COMPLETE${NC}"
echo "========================================"
echo ""
echo "📋 Deployment Summary:"
echo "  Program ID: $PROGRAM_ID"
echo "  Network: mainnet-beta"
echo "  Deployer: $WALLET"
echo "  Remaining Balance: $(solana balance)"
echo ""
echo "🔗 Verification Links:"
echo "  Solscan: https://solscan.io/account/$PROGRAM_ID"
echo "  Solana Explorer: https://explorer.solana.com/address/$PROGRAM_ID"
echo ""
echo "⚠️  CRITICAL NEXT STEPS:"
echo "  1. BACKUP keypairs immediately:"
echo "     target/deploy/engagemint_bonding_curve-keypair.json"
echo ""
echo "  2. Verify deployment on Solscan"
echo ""
echo "  3. Test with small SOL amount first"
echo ""
echo "  4. Configure production secrets:"
echo "     - DATABASE_URL"
echo "     - PLATFORM_WALLET_PRIVATE_KEY"
echo "     - JWT_SECRET"
echo "     - NEXT_PUBLIC_API_URL"
echo ""
echo "  5. Deploy backend to production:"
echo "     - Railway / Heroku / AWS"
echo "     - Use .env.production"
echo "     - Start blockchain sync service"
echo ""
echo "  6. Deploy frontend to Vercel:"
echo "     - vercel --prod"
echo "     - Use .env.production variables"
echo ""
echo "  7. Monitor first transactions carefully"
echo ""
echo "📄 Deployment record saved: $DEPLOYMENT_LOG"
echo ""
echo "========================================"
echo "🎉 Live on Solana mainnet!"
echo "========================================"
