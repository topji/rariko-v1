import { Connection, PublicKey } from '@solana/web3.js';

export const debugTransaction = async (txId: string, connection: Connection) => {
  try {
    console.log('🔍 Debugging transaction:', txId);
    
    // Get transaction details
    const tx = await connection.getTransaction(txId, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      console.log('❌ Transaction not found');
      return;
    }

    console.log('📋 Transaction details:', {
      slot: tx.slot,
      blockTime: tx.blockTime,
      fee: tx.meta?.fee,
      err: tx.meta?.err,
      logMessages: tx.meta?.logMessages
    });

    // Check if transaction failed
    if (tx.meta?.err) {
      console.error('❌ Transaction failed:', tx.meta.err);
    } else {
      console.log('✅ Transaction successful');
    }

    return tx;
  } catch (error) {
    console.error('❌ Error debugging transaction:', error);
  }
};

export const waitForConfirmation = async (
  connection: Connection,
  txId: string,
  maxRetries: number = 30
) => {
  console.log('⏳ Waiting for confirmation...');
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const status = await connection.getSignatureStatus(txId);
      
      if (status.value?.confirmationStatus === 'confirmed' || 
          status.value?.confirmationStatus === 'finalized') {
        console.log('✅ Transaction confirmed!');
        return true;
      }
      
      if (status.value?.err) {
        console.error('❌ Transaction failed:', status.value.err);
        return false;
      }
      
      console.log(`⏳ Still waiting... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
    } catch (error) {
      console.error('❌ Error checking status:', error);
    }
  }
  
  console.log('⏰ Timeout waiting for confirmation');
  return false;
}; 