"use client";
import { useDynamicContext, useEmbeddedReveal } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion } from 'framer-motion';
import { Logo } from './Logo';
import DisclaimerModal from './DisclaimerModal';
import { useUserApi } from '../hooks/useUserApi';
import NeonIsometricMaze from './neonGraphic';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function WalletCheck({ children }: { children: React.ReactNode }) {
  const { primaryWallet } = useDynamicContext();
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checking, setChecking] = useState(false);
  const [userExists, setUserExists] = useState(false);
  
  // New state for dynamic username checking
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameCheckTimeout, setUsernameCheckTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // New state for private key export popup
  const [showPrivateKeyPopup, setShowPrivateKeyPopup] = useState(false);
  const [isExportingKey, setIsExportingKey] = useState(false);
  
  const { checkUser, createUser, checkUsername, loading, error } = useUserApi();
  const { initExportProcess } = useEmbeddedReveal();

  const isConnectedSolanaWallet = primaryWallet && isSolanaWallet(primaryWallet);

  // Debounced username availability check
  const debouncedUsernameCheck = useCallback((username: string) => {
    // Clear existing timeout
    if (usernameCheckTimeout) {
      clearTimeout(usernameCheckTimeout);
    }

    // Reset status if username is empty
    if (!username.trim()) {
      setUsernameStatus('idle');
      return;
    }

    // Validate username format
    if (username.length < 3 || username.length > 30) {
      setUsernameStatus('invalid');
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameStatus('invalid');
      return;
    }

    // Set checking status
    setUsernameStatus('checking');

    // Debounce the API call
    const timeout = setTimeout(async () => {
      try {
        const isUnique = await checkUsername(username);
        setUsernameStatus(isUnique ? 'available' : 'taken');
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameStatus('idle');
      }
    }, 500); // 500ms delay

    setUsernameCheckTimeout(timeout);
  }, [checkUsername, usernameCheckTimeout]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (usernameCheckTimeout) {
        clearTimeout(usernameCheckTimeout);
      }
    };
  }, [usernameCheckTimeout]);

  // Reset username status when user exists (user completes signup)
  useEffect(() => {
    if (userExists) {
      setUsernameStatus('idle');
      setUsername('');
      setReferralCode('');
      setUsernameError('');
    }
  }, [userExists]);

  // Check user existence when wallet connects
  useEffect(() => {
    if (isConnectedSolanaWallet && primaryWallet?.address) {
      console.log('🔄 Wallet connected, checking user existence for:', primaryWallet.address);
      setChecking(true);
      checkUser(primaryWallet.address).then((exists) => {
        console.log('✅ User exists check result:', exists);
        setChecking(false);
        setUserExists(exists);
        
        if (exists) {
          // User exists - allow access to dashboard
          console.log('🚀 User exists, allowing access to dashboard');
        } else {
          // User doesn't exist - show disclaimer first, then username prompt
          console.log('📝 User does not exist, showing disclaimer and username prompt');
          setShowDisclaimer(true);
          setShowUsernamePrompt(true);
        }
      }).catch((err) => {
        console.error('❌ Error checking user:', err);
        setChecking(false);
        // On error, assume user doesn't exist and show both disclaimer and username prompt
        console.log('⚠️ Error occurred, assuming new user and showing prompts');
        setShowDisclaimer(true);
        setShowUsernamePrompt(true);
      });
    } else {
      console.log('🔌 No wallet connected yet');
    }
  }, [isConnectedSolanaWallet, primaryWallet?.address, checkUser]);

  const handleDisclaimerAccept = () => {
    console.log('📋 Disclaimer accepted, closing disclaimer modal');
    setShowDisclaimer(false);
    // Username prompt will be visible now that disclaimer is closed
    console.log('📝 Username prompt should now be visible');
  };

  const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError('');
    
    if (!username) {
      setUsernameError('Username is required');
      return;
    }
    
    // Use the current username status instead of checking again
    if (usernameStatus === 'taken') {
      setUsernameError('Username is taken');
      return;
    }
    
    if (usernameStatus === 'invalid') {
      setUsernameError('Username must be 3-30 characters, letters, numbers, and underscores only');
      return;
    }
    
    if (usernameStatus === 'checking') {
      setUsernameError('Please wait while we check username availability');
      return;
    }
    
    if (usernameStatus !== 'available') {
      setUsernameError('Please enter a valid username');
      return;
    }
    
    setChecking(true);
    
    try {
      if (!primaryWallet?.address) {
        setUsernameError('Wallet not connected');
        setChecking(false);
        return;
      }
      
      // Prepare user data with optional referral code
      const userData: any = { 
        username, 
        walletAddress: primaryWallet.address 
      };
      
      // Add referral code if provided
      if (referralCode.trim()) {
        userData.referralCode = referralCode.trim();
      }
      
      await createUser(userData);
      setShowUsernamePrompt(false);
      setShowPrivateKeyPopup(true); // Show private key export popup instead of setting userExists
      console.log('✅ User created successfully, showing private key export popup');
    } catch (err) {
      setUsernameError(error || 'Failed to create user');
    } finally {
      setChecking(false);
    }
  };

  // If no wallet connected, show onboarding
  if (!isConnectedSolanaWallet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Neon Graphic Background */}
        <div className="absolute inset-0 opacity-30">
          <NeonIsometricMaze />
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-usdt to-primary-600 rounded-2xl mb-4 shadow-lg">
                <Logo size="md" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">rizz.money</h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-300 mb-8 leading-relaxed"
            >
              Enter the world of Tokenized Assets
            </motion.p>

            {/* Wallet Connection Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-xl"
            >
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-2">
                  Connect Your Wallet
                </h2>
                <p className="text-gray-400 text-sm">
                  Securely connect your Solana wallet to start trading tokenized stocks
                </p>
              </div>

              <DynamicWidget />

              {/* Security Note */}
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Your wallet connection is secure and encrypted
                </p>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 grid grid-cols-3 gap-4 text-center"
            >
              <div className="text-gray-400">
                <div className="text-2xl font-bold text-usdt mb-1">24/7</div>
                <div className="text-xs">Trading</div>
              </div>
              <div className="text-gray-400">
                <div className="text-2xl font-bold text-usdt mb-1">0%</div>
                <div className="text-xs">Fees</div>
              </div>
              <div className="text-gray-400">
                <div className="text-2xl font-bold text-usdt mb-1">100%</div>
                <div className="text-xs">Secure</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    );
  }

  // If checking user existence, show loading
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center relative overflow-hidden">
        {/* Neon Graphic Background */}
        <div className="absolute inset-0 opacity-20">
          <NeonIsometricMaze />
        </div>
        
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-usdt mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking your account...</p>
        </div>
      </div>
    );
  }

  // If user doesn't exist and needs to complete registration
  if (!userExists && (showDisclaimer || showUsernamePrompt)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4 relative overflow-hidden">
        {/* Neon Graphic Background */}
        <div className="absolute inset-0 opacity-30">
          <NeonIsometricMaze />
        </div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-usdt to-primary-600 rounded-2xl mb-4 shadow-lg">
                <Logo size="md" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">rizz.money</h1>
            </motion.div>

            {/* Username Prompt - Only show for new users after disclaimer */}
            {showUsernamePrompt && !showDisclaimer && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 shadow-xl"
              >
                <h2 className="text-xl font-bold text-white mb-4">Create Your Account</h2>
                <form onSubmit={handleUsernameSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                      Username *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        className={`w-full px-4 py-3 rounded-xl border bg-gray-900 text-white pr-12 ${
                          usernameStatus === 'available' ? 'border-green-500' :
                          usernameStatus === 'taken' ? 'border-red-500' :
                          usernameStatus === 'invalid' ? 'border-red-500' :
                          usernameStatus === 'checking' ? 'border-yellow-500' :
                          'border-gray-600'
                        }`}
                        placeholder="Enter username"
                        value={username}
                        onChange={e => {
                          setUsername(e.target.value);
                          debouncedUsernameCheck(e.target.value);
                        }}
                        disabled={checking || loading}
                      />
                      {/* Status indicator */}
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {usernameStatus === 'checking' && (
                          <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                        )}
                        {usernameStatus === 'available' && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {usernameStatus === 'taken' && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        {usernameStatus === 'invalid' && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                    </div>
                    {/* Status message */}
                    {usernameStatus === 'available' && (
                      <p className="text-sm text-green-400 mt-1 text-left">✓ Available</p>
                    )}
                    {usernameStatus === 'taken' && (
                      <p className="text-sm text-red-400 mt-1 text-left">✗Already taken</p>
                    )}
                    {usernameStatus === 'invalid' && (
                      <p className="text-sm text-red-400 mt-1 text-left">✗ Must be 3-30 characters, letters, numbers</p>
                    )}
                    {usernameStatus === 'checking' && (
                      <p className="text-sm text-yellow-400 mt-1 text-left">Checking availability...</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2 text-left">
                      Referral Code(Optional)
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white"
                      placeholder="Enter referral code"
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value)}
                      disabled={checking || loading}
                    />
                  </div>
                  
                  {usernameError && <div className="text-red-400 text-sm">{usernameError}</div>}
                  
                  <button
                    type="submit"
                    className="w-full bg-usdt hover:bg-primary-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={checking || loading || usernameStatus !== 'available'}
                  >
                    {checking || loading ? 'Creating Account...' : 'Create Account'}
                  </button>
                </form>
              </motion.div>
            )}

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 grid grid-cols-3 gap-4 text-center"
            >
              <div className="text-gray-400">
                <div className="text-2xl font-bold text-usdt mb-1">24/7</div>
                <div className="text-xs">Trading</div>
              </div>
              <div className="text-gray-400">
                <div className="text-2xl font-bold text-usdt mb-1">0%</div>
                <div className="text-xs">Fees</div>
              </div>
              <div className="text-gray-400">
                <div className="text-2xl font-bold text-usdt mb-1">100%</div>
                <div className="text-xs">Secure</div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Disclaimer Modal */}
        <DisclaimerModal
          isOpen={showDisclaimer}
          onAccept={handleDisclaimerAccept}
        />

        {/* Private Key Export Popup */}
        {showPrivateKeyPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Secure Your Assets</h2>
                    <p className="text-gray-400 text-sm">Export your private key for safekeeping</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Warning Disclaimer */}
                <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <div>
                      <h3 className="text-red-400 font-semibold mb-2">Security Warning</h3>
                      <ul className="text-red-300 text-sm space-y-1">
                        <li>• Never share your private key with anyone</li>
                        <li>• Never store it online or in cloud storage</li>
                        <li>• Keep it in a secure, offline location</li>
                        <li>• Anyone with your private key can access your funds</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Benefits */}
                <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
                  <h3 className="text-white font-semibold mb-3">Why Export Your Private Key?</h3>
                  <ul className="text-gray-300 text-sm space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-usdt rounded-full"></div>
                      Full control over your assets
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-usdt rounded-full"></div>
                      Access from any Solana wallet
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-usdt rounded-full"></div>
                      Backup in case of device loss
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (!primaryWallet?.address) return;
                      
                      setIsExportingKey(true);
                      try {
                        // Use Dynamic Labs embedded reveal to export private key
                        await initExportProcess();
                        setShowPrivateKeyPopup(false);
                        setUserExists(true); // Allow access to dashboard after export
                      } catch (error) {
                        console.error('Error exporting private key:', error);
                        alert('Failed to export private key. Please try again.');
                      } finally {
                        setIsExportingKey(false);
                      }
                    }}
                    disabled={isExportingKey}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isExportingKey ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Exporting...
                      </div>
                    ) : (
                      'Export Private Key'
                    )}
                  </button>
                  
                  <button
                    onClick={() => {
                      setShowPrivateKeyPopup(false);
                      setUserExists(true); // Allow access to dashboard even if they skip
                    }}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded-xl transition-colors"
                  >
                    Skip for Now
                  </button>
                </div>

                {/* Skip Warning */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  You can always export your private key later from your profile settings
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // If user exists, show the dashboard content
  return <>{children}</>;
} 