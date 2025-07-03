# Dynamic SDK Setup Guide

## Environment Configuration

Create a `.env.local` file in the root directory with your Dynamic environment ID:

```env
NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID=your_environment_id_here
```

## Getting Your Environment ID

1. Go to [Dynamic Labs Dashboard](https://app.dynamic.xyz/)
2. Create a new project or select an existing one
3. Copy your Environment ID from the project settings
4. Replace `your_environment_id_here` in the `.env.local` file

## Features Implemented

✅ **Wallet Connection** - Dynamic Widget with Solana support  
✅ **Real SOL Balance** - Shows actual SOL balance from connected wallet  
✅ **Token Balances** - All SPL tokens with USD values  
✅ **Beautiful Onboarding** - Glass morphism design with blurred background  
✅ **Wallet Check** - Automatic redirection when wallet connects  
✅ **Copy Address** - Easy wallet address copying  
✅ **Mobile Experience** - Redirect mode for mobile wallets  

## Usage

The app now uses Dynamic SDK for:
- Google OAuth authentication
- Wallet connection (Phantom, Solflare, etc.)
- Real-time SOL balance display
- Token balance tracking
- Secure wallet management

## Next Steps

1. Add your Dynamic environment ID to `.env.local`
2. Test wallet connection
3. Verify SOL balance display
4. Implement additional features as needed 