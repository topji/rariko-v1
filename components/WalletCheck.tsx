"use client";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import Onboarding from './Onboarding';

export default function WalletCheck({ children }: { children: React.ReactNode }) {
  const { primaryWallet } = useDynamicContext();
  const isConnectedSolanaWallet = primaryWallet && isSolanaWallet(primaryWallet);

  if (!isConnectedSolanaWallet) {
    return <Onboarding />;
  }

  return <>{children}</>;
} 