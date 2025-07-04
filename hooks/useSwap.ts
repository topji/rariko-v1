import { useState } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import axios from 'axios';
import { NATIVE_MINT } from '@solana/spl-token';
import { SWAP_FEES, calculateFee } from '../constants/fees';

interface SwapResult {
  txId: string;
  feeCollected: number;
  feeInSol: number;
  feeInUSD: number;
}

export function useSwap() {
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);

  const getSolPrice = async () => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      return response.data.solana.usd;
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      return 0;
    }
  };

  const buyToken = async (outputTokenAddress: string, solAmount: number = 0.01): Promise<SwapResult> => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Connect wallet first');
    }

    setIsLoading(true);
    try {
      const signer = await primaryWallet.getSigner();
      const amountInLamports = solAmount * 1e9; // LAMPORTS_PER_SOL = 1e9

      // Calculate fee
      const feeAmount = calculateFee(solAmount, SWAP_FEES.FEE_BPS);
      const totalAmount = solAmount + feeAmount;

      // Get quote with fee
      const quoteResponse = await axios.get('https://lite-api.jup.ag/swap/v1/quote', {
        params: {
          inputMint: NATIVE_MINT.toBase58(),
          outputMint: outputTokenAddress,
          amount: (totalAmount * 1e9).toString(),
          slippageBps: 100,
          swapMode: 'ExactIn',
          onlyDirectRoutes: false,
          platformFeeBps: SWAP_FEES.FEE_BPS
        }
      });

      // Execute swap with fee collection
      const swapResponse = await axios.post('https://lite-api.jup.ag/swap/v1/swap', {
        userPublicKey: signer.publicKey?.toString() || '',
        quoteResponse: quoteResponse.data,
        feeAccount: SWAP_FEES.FEE_ACCOUNT,
        prioritizationFeeLamports: {
          priorityLevelWithMaxLamports: {
            maxLamports: SWAP_FEES.PRIORITY_FEE_LAMPORTS,
            priorityLevel: "veryHigh"
          }
        },
        asLegacyTransaction: true,
        dynamicComputeUnitLimit: true
      });

      // For now, return a mock transaction ID since we need to handle the transaction properly
      console.log('Swap transaction prepared with fee:', swapResponse.data);
      const txId = 'mock-transaction-id-' + Date.now();

      // Calculate fee in USD
      const solPrice = await getSolPrice();
      const feeInUSD = feeAmount * solPrice;

      // Store fee record in your backend (optional)
      try {
        await axios.post('https://your-backend.com/api/fees/record', {
          txId,
          userAddress: signer.publicKey?.toString(),
          feeAmount,
          feeInUSD,
          swapType: 'buy',
          tokenAddress: outputTokenAddress,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('Fee recording failed (backend not available):', error);
      }
      
      return {
        txId,
        feeCollected: feeAmount,
        feeInSol: feeAmount,
        feeInUSD
      };
      
    } finally {
      setIsLoading(false);
    }
  };

  const sellToken = async (mintAddress: string, tokenAmount: number): Promise<SwapResult> => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Connect wallet first');
    }

    setIsLoading(true);
    try {
      const signer = await primaryWallet.getSigner();

      // Get quote with fee
      const quoteResponse = await axios.get('https://quote-api.jup.ag/v6/quote', {
        params: {
          inputMint: mintAddress,
          outputMint: NATIVE_MINT.toBase58(),
          amount: tokenAmount.toString(),
          slippageBps: 100,
          swapMode: 'ExactIn',
          onlyDirectRoutes: false,
          platformFeeBps: SWAP_FEES.FEE_BPS
        }
      });

      // Execute swap with fee collection
      const swapResponse = await axios.post('https://quote-api.jup.ag/v6/swap', {
        userPublicKey: signer.publicKey?.toString() || '',
        quoteResponse: quoteResponse.data,
        feeAccount: SWAP_FEES.FEE_ACCOUNT,
        asLegacyTransaction: true,
        computeUnitPriceMicroLamports: 5000,
        priorityFeeLamports: SWAP_FEES.PRIORITY_FEE_LAMPORTS
      });

      // For now, return a mock transaction ID since we need to handle the transaction properly
      console.log('Swap transaction prepared with fee:', swapResponse.data);
      const txId = 'mock-transaction-id-' + Date.now();

      // Calculate fee from quote
      const outAmount = parseFloat(quoteResponse.data.outAmount) / 1e9;
      const feeAmount = calculateFee(outAmount, SWAP_FEES.FEE_BPS);
      const solPrice = await getSolPrice();
      const feeInUSD = feeAmount * solPrice;

      // Store fee record (optional)
      try {
        await axios.post('https://your-backend.com/api/fees/record', {
          txId,
          userAddress: signer.publicKey?.toString(),
          feeAmount,
          feeInUSD,
          swapType: 'sell',
          tokenAddress: mintAddress,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        console.log('Fee recording failed (backend not available):', error);
      }
      
      return {
        txId,
        feeCollected: feeAmount,
        feeInSol: feeAmount,
        feeInUSD
      };
      
    } finally {
      setIsLoading(false);
    }
  };

  const getQuote = async (inputMint: string, outputMint: string, amount: string) => {
    try {
      const response = await axios.get('https://lite-api.jup.ag/swap/v1/quote', {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageBps: 100,
          swapMode: 'ExactIn',
          onlyDirectRoutes: false,
          platformFeeBps: SWAP_FEES.FEE_BPS
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting quote:', error);
      return null;
    }
  };

  return { buyToken, sellToken, getQuote, isLoading };
} 