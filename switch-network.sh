#!/bin/bash

# ============================================
# ENGAGEMINT NETWORK SWITCHER
# ============================================
# Easily switch between devnet, testnet, and mainnet
# Usage: ./switch-network.sh [devnet|testnet|mainnet]
# ============================================

set -e

NETWORK=$1

if [ -z "$NETWORK" ]; then
  echo "❌ Error: Network not specified"
  echo ""
  echo "Usage: ./switch-network.sh [devnet|testnet|mainnet]"
  echo ""
  echo "Examples:"
  echo "  ./switch-network.sh devnet    # Development (free SOL)"
  echo "  ./switch-network.sh testnet   # Final testing (free SOL)"
  echo "  ./switch-network.sh mainnet   # Production (real SOL)"
  exit 1
fi

if [ "$NETWORK" != "devnet" ] && [ "$NETWORK" != "testnet" ] && [ "$NETWORK" != "mainnet" ]; then
  echo "❌ Error: Invalid network '$NETWORK'"
  echo "Must be: devnet, testnet, or mainnet"
  exit 1
fi

echo "🔄 Switching to $NETWORK..."
echo ""

# Switch backend
if [ -f "backend/.env.$NETWORK" ]; then
  cp "backend/.env.$NETWORK" "backend/.env"
  echo "✅ Backend configured for $NETWORK"
else
  echo "⚠️  Warning: backend/.env.$NETWORK not found"
fi

# Switch frontend
if [ -f "frontend/.env.$NETWORK" ]; then
  cp "frontend/.env.$NETWORK" "frontend/.env.local"
  echo "✅ Frontend configured for $NETWORK"
else
  echo "⚠️  Warning: frontend/.env.$NETWORK not found"
fi

echo ""
echo "📋 Current Configuration:"
echo ""

# Show backend config
if [ -f "backend/.env" ]; then
  echo "Backend:"
  echo "  Network: $(grep SOLANA_NETWORK backend/.env | cut -d '=' -f2)"
  echo "  RPC: $(grep SOLANA_RPC_URL backend/.env | cut -d '=' -f2)"
  echo "  Viral Threshold: $(grep VIRAL_THRESHOLD backend/.env | cut -d '=' -f2)"
  echo "  Check Interval: $(grep VIRAL_CHECK_INTERVAL_MS backend/.env | cut -d '=' -f2)ms"
fi

echo ""

# Show frontend config
if [ -f "frontend/.env.local" ]; then
  echo "Frontend:"
  echo "  Network: $(grep NEXT_PUBLIC_SOLANA_NETWORK frontend/.env.local | cut -d '=' -f2)"
  echo "  RPC: $(grep NEXT_PUBLIC_SOLANA_RPC_URL frontend/.env.local | cut -d '=' -f2)"
  echo "  Instant Mint Cost: $(grep NEXT_PUBLIC_INSTANT_MINT_COST_SOL frontend/.env.local | cut -d '=' -f2) SOL"
  echo "  Viral Threshold: $(grep NEXT_PUBLIC_VIRAL_THRESHOLD frontend/.env.local | cut -d '=' -f2) likes"
fi

echo ""

# Network-specific reminders
case $NETWORK in
  devnet)
    echo "💡 Next Steps for Devnet:"
    echo "  1. Airdrop SOL: solana airdrop 2 --url devnet"
    echo "  2. Start backend: cd backend && npm run dev"
    echo "  3. Start frontend: cd frontend && npm run dev"
    echo "  4. Test with FREE devnet SOL!"
    ;;
  testnet)
    echo "💡 Next Steps for Testnet:"
    echo "  1. Airdrop SOL: solana airdrop 2 --url testnet"
    echo "  2. Start backend: cd backend && npm run dev"
    echo "  3. Start frontend: cd frontend && npm run dev"
    echo "  4. Test production-like conditions"
    ;;
  mainnet)
    echo "⚠️  MAINNET - REAL MONEY WARNING ⚠️"
    echo ""
    echo "  Before starting:"
    echo "  1. ✅ Fund backend wallet with 10+ SOL"
    echo "  2. ✅ Verify DATABASE_URL is production"
    echo "  3. ✅ Test everything on testnet first"
    echo "  4. ✅ Set up monitoring/alerts"
    echo ""
    echo "  Backend wallet: $(grep SOLANA_BACKEND_WALLET_PRIVATE_KEY backend/.env | cut -d '=' -f2 | cut -c1-20)..."
    echo ""
    echo "  Deploy to production:"
    echo "    - Backend: Railway"
    echo "    - Frontend: Vercel"
    ;;
esac

echo ""
echo "✅ Network switch complete!"
