"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

interface TransactionStatusProps {
  txId: string | null;
  isConfirming: boolean;
  onClose: () => void;
}

export default function TransactionStatus({ txId, isConfirming, onClose }: TransactionStatusProps) {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (txId && !isConfirming) {
      setStatus('confirmed');
    }
  }, [txId, isConfirming]);

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />;
      case 'confirmed':
        return <CheckCircle className="h-8 w-8 text-green-400" />;
      case 'failed':
        return <XCircle className="h-8 w-8 text-red-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return isConfirming ? 'Waiting for wallet approval...' : 'Processing transaction...';
      case 'confirmed':
        return 'Transaction confirmed!';
      case 'failed':
        return 'Transaction failed';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'confirmed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
    }
  };

  return (
    <Card className="bg-black/90 backdrop-blur-xl border-purple-500/20">
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {getStatusIcon()}
          
          <div>
            <h3 className={`text-lg font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </h3>
            
            {txId && (
              <p className="text-sm text-gray-400 mt-2">
                Transaction ID: {txId.slice(0, 8)}...{txId.slice(-8)}
              </p>
            )}
            
            {error && (
              <p className="text-sm text-red-400 mt-2">{error}</p>
            )}
          </div>

          <div className="flex gap-2">
            {txId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(`https://solscan.io/tx/${txId}`, '_blank')}
                className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View on Solscan
              </Button>
            )}
            
            {status !== 'pending' && (
              <Button
                onClick={onClose}
                className="bg-purple-500 hover:bg-purple-600"
              >
                Close
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 