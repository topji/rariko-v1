import { useState } from 'react';
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { 
  PublicKey, 
  Transaction, 
  LAMPORTS_PER_SOL,
  TransactionSignature,
  Commitment,
  SystemProgram
} from '@solana/web3.js';

interface TransferResult {
  txId: string;
  amount: number;
  fee: number;
}

export function useSolTransfer() {
  const { primaryWallet } = useDynamicContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const sendSol = async (toAddress: string, solAmount: number): Promise<TransferResult> => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      throw new Error('Connect wallet first');
    }

    if (solAmount <= 0) {
      throw new Error('Amount must be greater than 0');
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
      
      // Validate recipient address
      let recipientPublicKey: PublicKey;
      try {
        recipientPublicKey = new PublicKey(toAddress);
      } catch (error) {
        throw new Error('Invalid recipient address');
      }
      
      // Calculate amount in lamports
      const amountInLamports = Math.floor(solAmount * LAMPORTS_PER_SOL);
      
      // Check if user has enough SOL (including fees)
      const estimatedFee = 0.005 * LAMPORTS_PER_SOL; // 0.005 SOL fee estimation
      const totalRequired = amountInLamports + estimatedFee;
      
      if (totalRequired > balance) {
        throw new Error(`Insufficient SOL balance. Need ${solAmount.toFixed(4)} SOL + fees, have ${(balance / LAMPORTS_PER_SOL).toFixed(4)} SOL.`);
      }
      
      // Create transfer transaction
      console.log('🔄 Creating transfer transaction...');
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPublicKey,
          lamports: amountInLamports,
        })
      );
      
      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;
      
      // Simulate transaction first
      console.log('🔄 Simulating transaction...');
      try {
        const simulation = await connection.simulateTransaction(transaction);
        console.log('📊 Simulation result:', simulation);
        
        if (simulation.value.err) {
          throw new Error(`Transaction simulation failed: ${JSON.stringify(simulation.value.err)}`);
        }
        
        console.log('✅ Transaction simulation successful');
      } catch (simError: any) {
        console.error('❌ Transaction simulation failed:', simError);
        throw new Error(`Transaction will fail: ${simError.message || 'Unknown error'}`);
      }

      // Use Dynamic Labs signAndSendTransaction
      console.log('🔄 Requesting wallet signature and sending transaction...');
      setIsConfirming(true);
      const result = await signer.signAndSendTransaction(transaction);
      txId = result.signature;
      console.log('📤 Transaction sent:', txId);

      // Wait for confirmation
      console.log('🔄 Waiting for confirmation...');
      if (!txId) {
        throw new Error('Transaction failed to send');
      }
      const { lastValidBlockHeight } = await connection.getLatestBlockhash();
      const confirmation = await connection.confirmTransaction({
        signature: txId,
        blockhash: blockhash,
        lastValidBlockHeight: lastValidBlockHeight
      }, 'confirmed' as Commitment);
      if (confirmation.value.err) {
        throw new Error(`Transaction failed: ${confirmation.value.err}`);
      }
      console.log('✅ Transaction confirmed!');
      // Get actual fee from transaction
      const txDetails = await connection.getTransaction(txId, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });
      const actualFee = txDetails?.meta?.fee || estimatedFee;
      return {
        txId,
        amount: solAmount,
        fee: actualFee / LAMPORTS_PER_SOL
      };
    } catch (error) {
      console.error('❌ Transfer failed:', error);
      if (txId) {
        console.log('Transaction ID for debugging:', txId);
      }
      throw error;
    } finally {
      setIsLoading(false);
      setIsConfirming(false);
    }
  };

  return {
    sendSol,
    isLoading,
    isConfirming
  };
} 