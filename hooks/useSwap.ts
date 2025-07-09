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
import { NATIVE_MINT, getMint } from '@solana/spl-token';
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
  const [isConfirming, setIsConfirming] = useState(false);

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
    let txId: TransactionSignature | null = null;

    try {
      const signer = await primaryWallet.getSigner();
      const connection = await primaryWallet.getConnection();
      
      // Check wallet balance first
      if (!signer.publicKey) {
        throw new Error('Wallet public key not available');
      }
      const publicKey = new PublicKey(signer.publicKey.toBytes());
      const balance = await connection.getBalance(publicKey);
      console.log('💰 Wallet SOL balance:', balance / LAMPORTS_PER_SOL, 'SOL');
      
      // Get real SOL price
      const solPrice = await getSolPrice();
      if (solPrice === 0) {
        throw new Error('Failed to fetch SOL price');
      }
      
      // Calculate SOL amount from USD
      const solAmount = usdAmount / solPrice;
      const amountInLamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

      console.log('🔄 Getting swap quote...');
      console.log('USD Amount:', usdAmount);
      console.log('SOL Amount:', solAmount);
      console.log('Amount in lamports:', amountInLamports);
      console.log('Wallet balance in lamports:', balance);
      
      // Increased minimum amount to avoid "Program failed to complete" error
      const minSolAmount = 0.05; // Increased from 0.01 to 0.05 SOL
      if (solAmount < minSolAmount) {
        throw new Error(`Amount too small. Minimum is ${minSolAmount} SOL (≈ $${(minSolAmount * solPrice).toFixed(2)}). Try with at least $${(minSolAmount * solPrice).toFixed(2)} USD.`);
      }
      
      // Check if user has enough SOL (including fees)
      const estimatedFee = 0.02 * LAMPORTS_PER_SOL; // Increased fee estimation
      const totalRequired = amountInLamports + estimatedFee;
      
      // Leave some buffer for rent and other fees
      const bufferAmount = 0.01 * LAMPORTS_PER_SOL; // Increased buffer
      const totalWithBuffer = totalRequired + bufferAmount;
      
      if (totalWithBuffer > balance) {
        throw new Error(`Insufficient SOL balance. Need ${solAmount.toFixed(4)} SOL + fees + buffer, have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL. Please ensure you have at least ${((solAmount + 0.03) * solPrice).toFixed(2)} USD worth of SOL.`);
      }
      
      // Step 1: Get quote using v6 API for better optimization
      const quoteResponse = await axios.get('https://quote-api.jup.ag/v6/quote', {
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

      if (!quoteResponse.data) {
        throw new Error('Failed to get quote');
      }

      console.log('✅ Quote received:', quoteResponse.data);

      // Step 2: Create swap transaction with optimized parameters
      console.log('🔄 Creating swap transaction...');
      
      let swapResponse;
      let useLegacyTransaction = false;
      let simulationError = null;
      
      // Try multiple transaction configurations
      const transactionConfigs = [
        {
          name: 'Versioned with high priority',
          config: {
            userPublicKey: signer.publicKey?.toString() || '',
            quoteResponse: quoteResponse.data,
            feeAccount: SWAP_FEES.FEE_ACCOUNT,
            asLegacyTransaction: false,
            computeUnitPriceMicroLamports: 10000, // Increased priority
            priorityFeeLamports: 10000, // Increased priority fee
            useTokenLedger: false,
            destinationTokenAccount: undefined,
            dynamicComputeUnitLimit: true
          }
        },
        {
          name: 'Legacy with high priority',
          config: {
            userPublicKey: signer.publicKey?.toString() || '',
            quoteResponse: quoteResponse.data,
            feeAccount: SWAP_FEES.FEE_ACCOUNT,
            asLegacyTransaction: true,
            computeUnitPriceMicroLamports: 10000,
            priorityFeeLamports: 10000,
            useTokenLedger: false,
            destinationTokenAccount: undefined,
            dynamicComputeUnitLimit: true
          }
        },
        {
          name: 'Versioned with standard priority',
          config: {
            userPublicKey: signer.publicKey?.toString() || '',
            quoteResponse: quoteResponse.data,
            feeAccount: SWAP_FEES.FEE_ACCOUNT,
            asLegacyTransaction: false,
            computeUnitPriceMicroLamports: 5000,
            priorityFeeLamports: 5000,
            useTokenLedger: false,
            destinationTokenAccount: undefined,
            dynamicComputeUnitLimit: true
          }
        },
        {
          name: 'Legacy with standard priority',
          config: {
            userPublicKey: signer.publicKey?.toString() || '',
            quoteResponse: quoteResponse.data,
            feeAccount: SWAP_FEES.FEE_ACCOUNT,
            asLegacyTransaction: true,
            computeUnitPriceMicroLamports: 5000,
            priorityFeeLamports: 5000,
            useTokenLedger: false,
            destinationTokenAccount: undefined,
            dynamicComputeUnitLimit: true
          }
        }
      ];

      // Try each configuration until one works
      for (const config of transactionConfigs) {
        try {
          console.log(`🔄 Trying ${config.name}...`);
          
          swapResponse = await axios.post(
            'https://quote-api.jup.ag/v6/swap',
            config.config
          );
          
          if (swapResponse.data?.swapTransaction) {
            useLegacyTransaction = config.config.asLegacyTransaction;
            console.log(`✅ ${config.name} successful`);
            break;
          }
        } catch (error) {
          console.log(`❌ ${config.name} failed:`, error);
          simulationError = error;
          continue;
        }
      }

      if (!swapResponse?.data?.swapTransaction) {
        throw new Error(`Failed to create swap transaction after trying all configurations. Last error: ${simulationError?.message || 'Unknown error'}`);
      }

      // Step 3: Deserialize and sign transaction
      console.log('🔄 Preparing transaction for wallet approval...');
      
      const swapTransaction = swapResponse.data.swapTransaction;
      const txBuf = Buffer.from(swapTransaction, 'base64');
      
      let transaction;
      if (useLegacyTransaction) {
        // Import Transaction for legacy transactions
        const { Transaction } = await import('@solana/web3.js');
        transaction = Transaction.from(txBuf);
      } else {
        transaction = VersionedTransaction.deserialize(txBuf);
      }

      console.log('📏 Transaction size:', txBuf.length, 'bytes');
      console.log('🔧 Transaction type:', useLegacyTransaction ? 'Legacy' : 'Versioned');

      // Step 4: Simulate transaction first
      console.log('🔄 Simulating transaction...');
      try {
        let simulation;
        if (useLegacyTransaction) {
          simulation = await connection.simulateTransaction(transaction as any);
        } else {
          simulation = await connection.simulateTransaction(transaction as VersionedTransaction);
        }
        console.log('📊 Simulation result:', simulation);
        
        if (simulation.value.err) {
          const error = simulation.value.err;
          console.error('❌ Simulation error details:', error);
          
          // Provide more specific error messages
          if (typeof error === 'object' && error !== null) {
            if ('InstructionError' in error) {
              const [index, instructionError] = error.InstructionError as [number, any];
              if (instructionError === 'ProgramFailedToComplete') {
                throw new Error(`Swap failed: Program execution failed. This usually means insufficient SOL for fees or the swap amount is too small. Try with at least $10-20 USD worth of SOL and ensure you have enough SOL for transaction fees. Current amount: $${usdAmount.toFixed(2)} USD (${solAmount.toFixed(4)} SOL).`);
              }
            }
          }
          
          throw new Error(`Transaction simulation failed: ${JSON.stringify(error)}`);
        }
        
        console.log('✅ Transaction simulation successful');
      } catch (simError: any) {
        console.error('❌ Transaction simulation failed:', simError);
        
        // If simulation fails, try to provide helpful error message
        if (simError.message.includes('ProgramFailedToComplete')) {
          throw new Error(`Transaction will fail: Program execution error. Try with a larger amount (at least $10-20 USD) or ensure you have sufficient SOL balance for fees. Current amount: $${usdAmount.toFixed(2)} USD.`);
        }
        
        throw new Error(`Transaction will fail: ${simError.message || 'Unknown error'}`);
      }

      // Step 5: Request wallet signature
      console.log('🔄 Requesting wallet signature...');
      setIsConfirming(true);
      
      let signedTx;
      if (useLegacyTransaction) {
        signedTx = await signer.signTransaction(transaction as any);
      } else {
        signedTx = await signer.signTransaction(transaction as VersionedTransaction);
      }
      console.log('✅ Transaction signed by wallet');

      // Step 6: Send transaction
      console.log('🔄 Sending transaction to network...');
      
      txId = await connection.sendTransaction(signedTx, {
        skipPreflight: false, // Enable preflight to catch errors
        maxRetries: 3,
        preflightCommitment: 'confirmed' as Commitment
      });

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

    } catch (error) {
      console.error('❌ Swap failed:', error);
      
      // If transaction was sent but failed, we still have the txId
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
      throw new Error('Connect wallet first');
    }

    setIsLoading(true);
    let txId: TransactionSignature | null = null;

    try {
      const signer = await primaryWallet.getSigner();
      const connection = await primaryWallet.getConnection();

      // Check wallet public key
      if (!signer.publicKey) {
        throw new Error('Wallet public key not available');
      }
      const publicKey = new PublicKey(signer.publicKey.toBytes());

      // Get token decimals
      const tokenMint = new PublicKey(mintAddress);
      const mintInfo = await getMint(connection, tokenMint);
      const tokenAmountWithDecimals = Math.floor(tokenAmount * Math.pow(10, mintInfo.decimals));

      console.log('🔄 Getting sell quote...');
      console.log('Token amount:', tokenAmount);
      console.log('Token decimals:', mintInfo.decimals);
      console.log('Token amount with decimals:', tokenAmountWithDecimals);

      // Get quote
      const quoteResponse = await axios.get('https://quote-api.jup.ag/v6/quote', {
        params: {
          inputMint: mintAddress,
          outputMint: NATIVE_MINT.toBase58(),
          amount: tokenAmountWithDecimals.toString(),
          slippageBps: 100,
          swapMode: 'ExactIn',
          onlyDirectRoutes: false,
          platformFeeBps: SWAP_FEES.FEE_BPS
        }
      });

      if (!quoteResponse.data) {
        throw new Error('Failed to get quote');
      }

      console.log('✅ Sell quote received');

      // Create swap transaction
      console.log('🔄 Creating sell transaction...');
      
      const swapRequestData = {
        userPublicKey: signer.publicKey?.toString() || '',
        quoteResponse: quoteResponse.data,
        feeAccount: SWAP_FEES.FEE_ACCOUNT,
        asLegacyTransaction: true,
        computeUnitPriceMicroLamports: 5000,
        priorityFeeLamports: SWAP_FEES.PRIORITY_FEE_LAMPORTS
      };

      const swapResponse = await axios.post(
        'https://quote-api.jup.ag/v6/swap',
        swapRequestData
      );

      if (!swapResponse.data?.swapTransaction) {
        throw new Error('Failed to create sell transaction');
      }

      console.log('✅ Sell transaction created');

      // Deserialize and sign
      console.log('🔄 Preparing sell transaction for wallet approval...');
      
      const swapTransaction = swapResponse.data.swapTransaction;
      const txBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(txBuf);

      // Request wallet signature
      console.log('🔄 Requesting wallet signature for sell...');
      setIsConfirming(true);
      
      const signedTx = await signer.signTransaction(transaction);
      console.log('✅ Sell transaction signed');

      // Send transaction
      console.log('🔄 Sending sell transaction...');
      
      txId = await connection.sendTransaction(signedTx, {
        skipPreflight: true,
        maxRetries: 3,
        preflightCommitment: 'confirmed' as Commitment
      });

      console.log('📤 Sell transaction sent:', txId);

      // Wait for confirmation
      console.log('🔄 Waiting for sell confirmation...');
      
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

      // Calculate fee from quote
      const outAmount = parseFloat(quoteResponse.data.outAmount) / LAMPORTS_PER_SOL;
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

  const getQuote = async (inputMint: string, outputMint: string, amount: string) => {
    try {
      // Ensure amount is an integer string
      const amountInt = Math.floor(parseFloat(amount)).toString();
      
      const response = await axios.get('https://quote-api.jup.ag/v6/quote', {
        params: {
          inputMint,
          outputMint,
          amount: amountInt,
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

  return { buyToken, sellToken, getQuote, isLoading, isConfirming };
} 