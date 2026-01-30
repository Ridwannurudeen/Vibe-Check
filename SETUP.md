# Vibe Check - Wallet Integration Setup

## Files to Update

Copy these files to your project:

1. `app/page.tsx` → Replace your existing `app/page.tsx`
2. `app/layout.tsx` → Replace your existing `app/layout.tsx`
3. `providers/Web3Provider.tsx` → Create new folder `providers/` and add this file
4. `package.json` → Replace your existing `package.json`
5. `.env.example` → Update your `.env.example`

## Installation Steps

```bash
cd C:\Users\GUDMAN\Downloads\vibe-check

# 1. Install new dependencies
npm install

# 2. Get a FREE WalletConnect Project ID
#    Go to: https://cloud.walletconnect.com
#    Sign up and create a new project
#    Copy the Project ID

# 3. Add to your .env.local
echo NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here >> .env.local

# 4. Clear cache and run
rmdir /s /q .next
npm run dev
```

## What Was Added

✅ **RainbowKit** - Beautiful wallet connection modal
✅ **wagmi** - React hooks for Ethereum
✅ **Multiple Wallets** - MetaMask, Coinbase Wallet, WalletConnect, Rainbow, etc.
✅ **"Check My Vibe" Button** - Appears when wallet is connected
✅ **Chain Switcher** - Easy switch between Base and Mainnet

## Features

- Connect Wallet button in the header
- When connected: "Check My Vibe" button appears below search
- Clicking it auto-fills your address and checks your reputation
- All existing functionality preserved (manual input, contracts, etc.)
