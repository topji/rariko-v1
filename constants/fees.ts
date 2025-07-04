export const SWAP_FEES = {
  FEE_ACCOUNT: '2nYKJqfPoycBjAh3AhVyRKYhmhxRv7jQMBHmgoQX8LX7', // Your fee wallet
  FEE_BPS: 100, // 1% fee (100 basis points = 1%)
  PRIORITY_FEE_LAMPORTS: 1000000, // 0.001 SOL priority fee
  MIN_FEE_SOL: 0.001, // Minimum fee in SOL
  MAX_FEE_SOL: 0.1, // Maximum fee in SOL
};

// Fee calculation helper
export const calculateFee = (amount: number, feeBps: number = SWAP_FEES.FEE_BPS) => {
  return (amount * feeBps) / 10000; // Convert basis points to percentage
}; 