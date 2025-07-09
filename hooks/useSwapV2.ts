import { useState } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import axios from 'axios';
import { 
  PublicKey, 
  VersionedTransaction, 
  LAMPORTS_PER_SOL,
  TransactionSignature,
  Commitment
} from '@solana/web3.js';
import { NATIVE_MINT } from '@solana/spl-token';

interface SwapResult {
  txId: string;
  feeCollected: number;
  feeInSol: number;
  feeInUSD: number;
}

interface QuoteResponse {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  otherAmountThreshold: string;
  swapMode: string;
  slippageBps: number;
  platformFee?: {
    feeBps: number;
    feeAccounts: {
      [key: string]: string;
    };
  };
  priceImpactPct: string;
  routePlan: any[];
  contextSlot: number;
  timeTaken: number;
}

export function useSwapV2() {
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const getSolPrice = async (): Promise<number> => {
    try {
      const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
      return response.data.solana.usd;
    } catch (error) {
      console.error('Error fetching SOL price:', error);
      return 0;
    }
  };

  const getQuote = async (inputMint: string, outputMint: string, amount: string): Promise<QuoteResponse | null> => {
    try {
      // Ensure amount is a proper integer string for Jupiter API
      const cleanAmount = Math.floor(parseFloat(amount)).toString();
      
      console.log('🔄 Getting quote for:', { inputMint, outputMint, amount: cleanAmount });
      
      const response = await axios.get('https://quote-api.jup.ag/v6/quote', {
        params: {
          inputMint,
          outputMint,
          amount: cleanAmount,
          slippageBps: 100, // 1% slippage
          swapMode: 'ExactIn',
          onlyDirectRoutes: false,
          asLegacyTransaction: false
        }
      });

      if (response.data) {
        console.log('✅ Quote received:', response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting quote:', error);
      return null;
    }
  };

  const createSwapTransaction = async (quoteResponse: QuoteResponse, userPublicKey: string): Promise<string | null> => {
    try {
      console.log('🔄 Creating swap transaction...');
      
      const swapRequest = {
        userPublicKey,
        quoteResponse,
        asLegacyTransaction: false,
        computeUnitPriceMicroLamports: 5000,
        priorityFeeLamports: 5000,
        useTokenLedger: false,
        destinationTokenAccount: undefined,
        dynamicComputeUnitLimit: true
      };

      const response = await axios.post(
        'https://quote-api.jup.ag/v6/swap',
        swapRequest
      );

      if (response.data?.swapTransaction) {
        console.log('✅ Swap transaction created');
        return response.data.swapTransaction;
      }

      return null;
    } catch (error) {
      console.error('❌ Error creating swap transaction:', error);
      return null;
    }
  };

  const buyToken = async (outputTokenAddress: string, usdAmount: number): Promise<SwapResult> => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Please connect your wallet first');
    }

    setIsLoading(true);
    let txId: TransactionSignature | null = null;

    try {
      const signer = await primaryWallet.getSigner();
      const connection = await primaryWallet.getConnection();
      
      // Validate wallet
      if (!signer.publicKey) {
        throw new Error('Wallet public key not available');
      }
      
      const publicKey = new PublicKey(signer.publicKey.toBytes());
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      
      console.log('💰 Wallet SOL balance:', solBalance, 'SOL');
      
      // Get SOL price
      const solPrice = await getSolPrice();
      if (solPrice === 0) {
        throw new Error('Failed to fetch SOL price. Please try again.');
      }
      
      // Calculate SOL amount
      const solAmount = usdAmount / solPrice;
      const amountInLamports = Math.floor(solAmount * LAMPORTS_PER_SOL);
      
      console.log('📊 Swap details:', {
        usdAmount,
        solAmount,
        amountInLamports,
        solPrice
      });
      
      // Validate minimum amount
      const minSolAmount = 0.01; // 0.01 SOL minimum
      if (solAmount < minSolAmount) {
        throw new Error(`Amount too small. Minimum is ${minSolAmount} SOL (≈ $${(minSolAmount * solPrice).toFixed(2)}). Please try with at least $${(minSolAmount * solPrice).toFixed(2)} USD.`);
      }
      
      // Check balance (including fees)
      const estimatedFee = 0.005 * LAMPORTS_PER_SOL; // 0.005 SOL fee
      const totalRequired = amountInLamports + estimatedFee;
      
      if (totalRequired > balance) {
        throw new Error(`Insufficient SOL balance. You need ${solAmount.toFixed(4)} SOL + fees, but you have ${solBalance.toFixed(4)} SOL. Please ensure you have at least $${((solAmount + 0.005) * solPrice).toFixed(2)} USD worth of SOL.`);
      }
      
      // Step 1: Get quote
      const quote = await getQuote(
        NATIVE_MINT.toBase58(),
        outputTokenAddress,
        amountInLamports.toString()
      );
      
      if (!quote) {
        throw new Error('Failed to get swap quote. Please try again.');
      }
      
      // Step 2: Create swap transaction
      const swapTransaction = await createSwapTransaction(
        quote,
        signer.publicKey.toString()
      );
      
      if (!swapTransaction) {
        throw new Error('Failed to create swap transaction. Please try again.');
      }
      
      // Step 3: Deserialize transaction
      console.log('🔄 Deserializing transaction...');
      const txBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(txBuf);
      
      // Step 4: Simulate transaction
      console.log('🔄 Simulating transaction...');
      try {
        const simulation = await connection.simulateTransaction(transaction);
        
        if (simulation.value.err) {
          console.error('❌ Simulation failed:', simulation.value.err);
          throw new Error('Transaction simulation failed. Please try with a different amount.');
        }
        
        console.log('✅ Simulation successful');
      } catch (simError: any) {
        console.error('❌ Simulation error:', simError);
        throw new Error('Transaction will fail. Please try with a different amount or ensure you have sufficient SOL for fees.');
      }
      
      // Step 5: Use Dynamic Labs signAndSendTransaction
      console.log('🔄 Requesting wallet signature and sending transaction...');
      setIsConfirming(true);
      
      const result = await signer.signAndSendTransaction(transaction);
      txId = result.signature;
      console.log('✅ Transaction signed and sent by wallet');
      console.log('📤 Transaction sent:', txId);
      
      // Step 7: Wait for confirmation
      console.log('🔄 Waiting for confirmation...');
      
      const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash();
      
      const confirmation = await connection.confirmTransaction({
        signature: txId,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      }, 'confirmed' as Commitment);
      
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      
      console.log('✅ Transaction confirmed!');
      
      // Calculate fee
      const feeAmount = 0.005; // Fixed fee for now
      const feeInUSD = feeAmount * solPrice;
      
      return {
        txId,
        feeCollected: feeAmount,
        feeInSol: feeAmount,
        feeInUSD
      };
      
    } catch (error) {
      console.error('❌ Swap failed:', error);
      
      if (txId) {
        console.log('Transaction ID for debugging:', txId);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  const sellToken = async (mintAddress: string, tokenAmount: number): Promise<SwapResult> => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Please connect your wallet first');
    }

    setIsLoading(true);
    let txId: TransactionSignature | null = null;

    try {
      const signer = await primaryWallet.getSigner();
      const connection = await primaryWallet.getConnection();
      
      if (!signer.publicKey) {
        throw new Error('Wallet public key not available');
      }
      
      const publicKey = new PublicKey(signer.publicKey.toBytes());
      
      // For selling, we need to get the token balance first
      // This is a simplified version - you might need to enhance this
      console.log('🔄 Getting sell quote for token:', mintAddress);
      
      // Get quote for selling token to SOL
      const quote = await getQuote(
        mintAddress,
        NATIVE_MINT.toBase58(),
        Math.floor(tokenAmount).toString()
      );
      
      if (!quote) {
        throw new Error('Failed to get sell quote. Please try again.');
      }
      
      // Create swap transaction
      const swapTransaction = await createSwapTransaction(
        quote,
        signer.publicKey.toString()
      );
      
      if (!swapTransaction) {
        throw new Error('Failed to create sell transaction. Please try again.');
      }
      
      // Deserialize and sign
      const txBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(txBuf);
      
      // Simulate
      const simulation = await connection.simulateTransaction(transaction);
      if (simulation.value.err) {
        throw new Error('Sell transaction simulation failed. Please try again.');
      }
      
      // Use Dynamic Labs signAndSendTransaction
      setIsConfirming(true);
      const result = await signer.signAndSendTransaction(transaction);
      txId = result.signature;
      
      // Wait for confirmation
      const { lastValidBlockHeight, blockhash } = await connection.getLatestBlockhash();
      
      const confirmation = await connection.confirmTransaction({
        signature: txId,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      }, 'confirmed' as Commitment);
      
      if (confirmation.value.err) {
        throw new Error(`Sell transaction failed: ${confirmation.value.err}`);
      }
      
      console.log('✅ Sell transaction confirmed!');
      
      // Get SOL price for fee calculation
      const solPrice = await getSolPrice();
      const feeAmount = 0.005;
      const feeInUSD = feeAmount * solPrice;
      
      return {
        txId,
        feeCollected: feeAmount,
        feeInSol: feeAmount,
        feeInUSD
      };
      
    } catch (error) {
      console.error('❌ Sell failed:', error);
      
      if (txId) {
        console.log('Sell Transaction ID for debugging:', txId);
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  return {
    buyToken,
    sellToken,
    getQuote,
    isLoading,
    isConfirming
  };
} 