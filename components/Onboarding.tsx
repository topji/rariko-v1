"use client";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from 'framer-motion'
import { Logo } from './Logo';
import DisclaimerModal from './DisclaimerModal';
import { useUserApi } from '../hooks/useUserApi';

export default function Onboarding() {
  const { primaryWallet } = useDynamicContext();
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [checking, setChecking] = useState(false);
  const { checkUser, createUser, checkUsername, loading, error, user } = useUserApi();

  // Show disclaimer every time user logs in
  useEffect(() => {
    if (primaryWallet?.address) {
      setShowDisclaimer(true);
      setChecking(true);
      checkUser(primaryWallet.address).then((exists) => {
        setChecking(false);
        if (!exists) {
          setShowUsernamePrompt(true);
        } else {
          router.push('/');
        }
      });
    }
  }, [primaryWallet?.address]);

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    if (!showUsernamePrompt) router.push('/');
  };

  const handleUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUsernameError('');
    if (!username) {
      setUsernameError('Username is required');
      return;
    }
    if (username.length < 3 || username.length > 30) {
      setUsernameError('Username must be 3-30 characters');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setUsernameError('Only letters, numbers, and underscores allowed');
      return;
    }
    setChecking(true);
    const isUnique = await checkUsername(username);
    if (!isUnique) {
      setUsernameError('Username is taken');
      setChecking(false);
      return;
    }
    try {
      if (!primaryWallet?.address) {
        setUsernameError('Wallet not connected');
        setChecking(false);
        return;
      }
      await createUser({ username, walletAddress: primaryWallet.address });
      setShowUsernamePrompt(false);
      router.push('/');
    } catch (err) {
      setUsernameError(error || 'Failed to create user');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
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
            <h1 className="text-3xl font-bold text-white mb-2">RariKo</h1>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-300 mb-8 leading-relaxed"
          >
            Enter the world of Tokenized Investments
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

            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4">
              <DynamicWidget />
            </div>

            {/* Security Note */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Your wallet connection is secure and encrypted
              </p>
            </div>
          </motion.div>

          {/* Username Prompt */}
          {showUsernamePrompt && (
            <div className="mt-8 bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Choose a Username</h2>
              <form onSubmit={handleUsernameSubmit}>
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-gray-600 bg-gray-900 text-white mb-2"
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={checking || loading}
                />
                {usernameError && <div className="text-red-400 text-sm mb-2">{usernameError}</div>}
                <button
                  type="submit"
                  className="w-full bg-usdt hover:bg-primary-600 text-white font-semibold py-3 rounded-xl mt-2 disabled:opacity-50"
                  disabled={checking || loading}
                >
                  {checking || loading ? 'Checking...' : 'Create Account'}
                </button>
              </form>
            </div>
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
    </div>
  );
} 