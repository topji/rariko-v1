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

  const buyToken = async (outputTokenAddress: string, usdAmount: number): Promise<SwapResult> => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Connect wallet first');
    }

    setIsLoading(true);
    try {
      const signer = await primaryWallet.getSigner();
      const connection = await primaryWallet.getConnection();
      
      // Get real SOL price
      const solPrice = await getSolPrice();
      if (solPrice === 0) {
        throw new Error('Failed to fetch SOL price');
      }
      
      // Calculate SOL amount from USD
      const solAmount = usdAmount / solPrice;
      const amountInLamports = solAmount * 1e9;

      // Get quote with fee
      const quoteResponse = await axios.get('https://lite-api.jup.ag/swap/v1/quote', {
        params: {
          inputMint: NATIVE_MINT.toBase58(),
          outputMint: outputTokenAddress,
          amount: amountInLamports.toString(),
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

      // Sign and send transaction using Dynamic Labs method
      const txBuf = Buffer.from(swapResponse.data.swapTransaction, 'base64');
      const txId = await signer.sendTransaction(txBuf);

      // Calculate fee in USD
      const feeAmount = calculateFee(solAmount, SWAP_FEES.FEE_BPS);
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
      const connection = await primaryWallet.getConnection();

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

      // Sign and send transaction using Dynamic Labs method
      const txBuf = Buffer.from(swapResponse.data.swapTransaction, 'base64');
      const txId = await signer.sendTransaction(txBuf);

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