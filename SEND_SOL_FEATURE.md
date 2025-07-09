# Send SOL Feature

## Overview
Added a new "Send SOL" functionality to the profile page that allows users to send SOL to other wallet addresses.

## Features

### 1. Send Button in SOL Balance Card
- Added a "Send" button next to the "Load" button in the SOL balance card
- Also added a "Send SOL" button in the main action area for better visibility

### 2. Send Modal
- **Recipient Address Input**: Validates Solana wallet addresses (44 characters, base58 format)
- **Amount Input**: Numeric input for SOL amount with validation
- **Quick Amount Buttons**: Predefined amounts (0.1, 0.5, 1, 2, 5, 10 SOL) for convenience
- **Real-time Validation**: Visual feedback for valid/invalid addresses
- **Balance Check**: Prevents sending more than available balance

### 3. SOL Transfer Hook (`useSolTransfer`)
- Handles actual SOL transfers using Solana web3.js
- Includes proper error handling and transaction simulation
- Validates wallet connection and balance
- Returns transaction ID and fee information

### 4. Success Modal
- Shows transaction confirmation with transaction ID
- Copy button for transaction ID
- Clean success message with amount sent

## Technical Implementation

### Files Modified/Created:
1. **`hooks/useSolTransfer.ts`** - New hook for SOL transfer functionality
2. **`app/profile/page.tsx`** - Updated with send button and modals

### Key Features:
- **Address Validation**: Real-time validation of Solana addresses
- **Balance Validation**: Prevents overspending
- **Transaction Simulation**: Simulates transactions before sending
- **Error Handling**: Comprehensive error messages
- **Loading States**: Shows loading and confirming states
- **Success Feedback**: Clear success confirmation

### Security Features:
- Validates recipient address format
- Checks sufficient balance before transaction
- Simulates transaction to catch potential errors
- Uses proper Solana transaction signing

## Usage

1. Navigate to the Profile page
2. Click "Send" or "Send SOL" button in the SOL balance card
3. Enter recipient's Solana wallet address
4. Enter amount to send
5. Click "Send SOL" to execute the transaction
6. Confirm transaction in wallet
7. View success confirmation with transaction details

## Error Handling

- Invalid address format
- Insufficient balance
- Network errors
- Transaction failures
- Wallet connection issues

## UI/UX Features

- Consistent with app's dark theme
- Real-time validation feedback
- Loading states with spinners
- Success confirmation modal
- Copy functionality for transaction IDs
- Quick amount selection buttons 