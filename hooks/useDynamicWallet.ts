import { 
  useDynamicContext, 
  useTokenBalances, 
  useEmbeddedReveal, 
  useOnramp,
  useWalletConnectorEvent 
} from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { ChainEnum, OnrampProviders } from "@dynamic-labs/sdk-api";

export function useDynamicWallet() {
  // Core wallet context
  const { 
    primaryWallet, 
    handleLogOut, 
    setShowDynamicUserProfile 
  } = useDynamicContext();

  // Token balances hook
  const { tokenBalances, isLoading: isLoadingTokens } = useTokenBalances({
    chainName: ChainEnum.Sol,
    accountAddress: primaryWallet?.address,
    includeFiat: true,
    includeNativeBalance: true,
  });

  // Private key export hook
  const { initExportProcess } = useEmbeddedReveal();

  // Onramp (fiat to crypto) hook
  const { enabled: onrampEnabled, open: openOnramp } = useOnramp();

  // Check if connected to Solana wallet
  const isConnectedSolanaWallet = primaryWallet && isSolanaWallet(primaryWallet);
  const walletAddress = primaryWallet?.address || '';

  // Wallet event listener
  useWalletConnectorEvent(
    primaryWallet?.connector,
    'disconnect',
    () => {
      console.log('Wallet disconnected');
    }
  );

  return {
    // Wallet state
    wallet: primaryWallet,
    isConnected: isConnectedSolanaWallet,
    walletAddress,
    displayName: walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : '',
    
    // Token data
    tokenBalances,
    isLoadingTokens,
    
    // Actions
    logout: handleLogOut,
    exportPrivateKey: initExportProcess,
    openUserProfile: setShowDynamicUserProfile,
    
    // Onramp
    onrampEnabled,
    buyWithFiat: (address: string) => openOnramp({
      onrampProvider: OnrampProviders.Banxa,
      token: 'SOL',
      address: address,
    }),
  };
} 