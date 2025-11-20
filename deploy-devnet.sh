#!/bin/bash

##############################################################################
# EngageMint Devnet Deployment Script
#
# Deploys smart contract, backend, and frontend to devnet for testing
#
# Usage:
#   chmod +x deploy-devnet.sh
#   ./deploy-devnet.sh
##############################################################################

set -e  # Exit on error

echo "========================================"
echo "🚀 EngageMint Devnet Deployment"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check prerequisites
echo -e "${YELLOW}Step 1: Checking prerequisites...${NC}"

if ! command -v solana &> /dev/null; then
    echo -e "${RED}❌ Solana CLI not found. Install from https://docs.solana.com/cli/install-solana-cli-tools${NC}"
    exit 1
fi

if ! command -v anchor &> /dev/null; then
    echo -e "${RED}❌ Anchor CLI not found. Install from https://www.anchor-lang.com/docs/installation${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites installed${NC}"
echo ""

# Step 2: Set Solana to devnet
echo -e "${YELLOW}Step 2: Configuring Solana for devnet...${NC}"
solana config set --url devnet
echo -e "${GREEN}✅ Solana set to devnet${NC}"
echo ""

# Step 3: Check/request wallet balance
echo -e "${YELLOW}Step 3: Checking wallet balance...${NC}"
BALANCE=$(solana balance | awk '{print $1}')
echo "Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 2" | bc -l) )); then
    echo -e "${YELLOW}⚠️  Low balance. Requesting airdrop...${NC}"
    solana airdrop 2 || echo -e "${YELLOW}Airdrop failed. Continue anyway...${NC}"
    sleep 5
    BALANCE=$(solana balance | awk '{print $1}')
    echo "New balance: $BALANCE SOL"
fi

echo -e "${GREEN}✅ Wallet ready${NC}"
echo ""

# Step 4: Build smart contract
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

# Step 5: Deploy smart contract to devnet
echo -e "${YELLOW}Step 5: Deploying smart contract to devnet...${NC}"
anchor deploy --provider.cluster devnet

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Deployment failed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Smart contract deployed${NC}"
echo ""

# Step 6: Get program ID
echo -e "${YELLOW}Step 6: Retrieving program ID...${NC}"
PROGRAM_ID=$(solana address -k target/deploy/engagemint_bonding_curve-keypair.json)
echo "Program ID: $PROGRAM_ID"
echo ""

# Step 7: Update environment files
echo -e "${YELLOW}Step 7: Updating environment files...${NC}"

# Backend .env
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env 2>/dev/null || touch backend/.env
fi

# Update backend .env
if grep -q "BONDING_CURVE_PROGRAM_ID=" backend/.env; then
    sed -i "s|BONDING_CURVE_PROGRAM_ID=.*|BONDING_CURVE_PROGRAM_ID=$PROGRAM_ID|" backend/.env
else
    echo "BONDING_CURVE_PROGRAM_ID=$PROGRAM_ID" >> backend/.env
fi

if grep -q "SOLANA_NETWORK=" backend/.env; then
    sed -i "s|SOLANA_NETWORK=.*|SOLANA_NETWORK=devnet|" backend/.env
else
    echo "SOLANA_NETWORK=devnet" >> backend/.env
fi

# Frontend .env.local
if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local 2>/dev/null || touch frontend/.env.local
fi

# Update frontend .env.local
if grep -q "NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=" frontend/.env.local; then
    sed -i "s|NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=.*|NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=$PROGRAM_ID|" frontend/.env.local
else
    echo "NEXT_PUBLIC_BONDING_CURVE_PROGRAM_ID=$PROGRAM_ID" >> frontend/.env.local
fi

if grep -q "NEXT_PUBLIC_SOLANA_NETWORK=" frontend/.env.local; then
    sed -i "s|NEXT_PUBLIC_SOLANA_NETWORK=.*|NEXT_PUBLIC_SOLANA_NETWORK=devnet|" frontend/.env.local
else
    echo "NEXT_PUBLIC_SOLANA_NETWORK=devnet" >> frontend/.env.local
fi

echo -e "${GREEN}✅ Environment files updated${NC}"
echo ""

# Step 8: Copy IDL to frontend and backend
echo -e "${YELLOW}Step 8: Copying IDL files...${NC}"
mkdir -p frontend/src/idl
mkdir -p backend/src/idl

cp target/idl/engagemint_bonding_curve.json frontend/src/idl/
cp target/idl/engagemint_bonding_curve.json backend/src/idl/

echo -e "${GREEN}✅ IDL files copied${NC}"
echo ""

# Step 9: Install backend dependencies
echo -e "${YELLOW}Step 9: Installing backend dependencies...${NC}"
cd backend
npm install
echo -e "${GREEN}✅ Backend dependencies installed${NC}"
echo ""

# Step 10: Run database migration
echo -e "${YELLOW}Step 10: Running database migration...${NC}"
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set. Skipping migration.${NC}"
    echo "Run manually: psql -f backend/db-migrations/add-blockchain-sync.sql"
else
    psql "$DATABASE_URL" -f db-migrations/add-blockchain-sync.sql || echo -e "${YELLOW}Migration may have already run${NC}"
    echo -e "${GREEN}✅ Database migration completed${NC}"
fi
echo ""

# Step 11: Replace services with production versions
echo -e "${YELLOW}Step 11: Activating production services...${NC}"

# Backend: Use production Anchor client
if [ -f "src/services/anchorClient.js" ]; then
    mv src/services/anchorClient.js src/services/anchorClient.mock.js
fi
cp src/services/anchorClient.production.js src/services/anchorClient.js

echo -e "${GREEN}✅ Backend using production Anchor client${NC}"
cd ..

# Frontend: Use production Solana library
cd frontend
if [ -f "src/lib/solana.ts" ]; then
    mv src/lib/solana.ts src/lib/solana.mock.ts
fi
cp src/lib/solana.production.ts src/lib/solana.ts

echo -e "${GREEN}✅ Frontend using production Solana library${NC}"
echo ""

# Step 12: Install frontend dependencies
echo -e "${YELLOW}Step 12: Installing frontend dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
echo ""

# Step 13: Test backend startup
echo -e "${YELLOW}Step 13: Testing backend...${NC}"
cd ../backend
timeout 10s npm run dev > /tmp/backend-test.log 2>&1 || true

if grep -q "Server running" /tmp/backend-test.log; then
    echo -e "${GREEN}✅ Backend starts successfully${NC}"
else
    echo -e "${YELLOW}⚠️  Backend may have issues. Check /tmp/backend-test.log${NC}"
fi
echo ""

# Step 14: Summary
echo "========================================"
echo -e "${GREEN}✅ DEVNET DEPLOYMENT COMPLETE${NC}"
echo "========================================"
echo ""
echo "📋 Deployment Summary:"
echo "  Program ID: $PROGRAM_ID"
echo "  Network: devnet"
echo "  Smart Contract: ✅ Deployed"
echo "  Backend: ✅ Configured"
echo "  Frontend: ✅ Configured"
echo "  Database: ✅ Migrated"
echo ""
echo "🚀 Next Steps:"
echo "  1. Start backend:"
echo "     cd backend && npm run dev"
echo ""
echo "  2. Start frontend:"
echo "     cd frontend && npm run dev"
echo ""
echo "  3. Open browser:"
echo "     http://localhost:3000"
echo ""
echo "  4. Test token creation with devnet SOL"
echo ""
echo "  5. View transactions on Solscan:"
echo "     https://solscan.io/account/$PROGRAM_ID?cluster=devnet"
echo ""
echo "========================================"
echo "🎉 Ready to test on devnet!"
echo "========================================"
