"use client";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Sparkles } from 'lucide-react';

// Animated background particles
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-30 particle`}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          transition={{
            duration: Math.random() * 15 + 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
      {/* Larger floating elements */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`large-${i}`}
          className={`absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-20 particle animate-sparkle`}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1200),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          transition={{
            duration: Math.random() * 20 + 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}

// Animated chart line
const AnimatedChart = () => {
  return (
    <div className="absolute top-20 right-10 w-32 h-16 opacity-30">
      <svg width="128" height="64" viewBox="0 0 128 64" className="w-full h-full">
        <motion.path
          d="M0,32 L20,20 L40,35 L60,15 L80,25 L100,10 L120,5 L128,0"
          stroke="url(#chartGradient)"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

export default function Onboarding() {
  const { primaryWallet } = useDynamicContext();
  const router = useRouter();
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    setShowParticles(true);
  }, []);

  // Redirect when wallet connects
  useEffect(() => {
    if (primaryWallet?.address) {
      router.push('/');
    }
  }, [primaryWallet?.address, router]);

  return (
    <div className="min-h-screen relative bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/5 to-purple-500/10 animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_50%)]" />
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(139,92,246,0.1),transparent_50%)]" />
        <AnimatedChart />
        <FloatingParticles />
        
        {/* Floating geometric shapes */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-32 h-32 border border-green-500/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-24 h-24 border border-blue-500/20 rounded-lg"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Hero Section */}
          <motion.div 
            className="text-center mb-8"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Animated Logo */}
            <motion.div 
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl mb-6 shadow-2xl neon-glow animate-float"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <TrendingUp className="w-10 h-10 text-white" />
              </motion.div>
            </motion.div>

            {/* Main Title */}
            <motion.h1 
              className="text-5xl font-bold gradient-text-animated mb-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Do you like Stonks?
            </motion.h1>

            {/* Subtitle */}
            <motion.p 
              className="text-xl text-gray-300 mb-2"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Connect your wallet to start trading
            </motion.p>

            {/* Sparkles */}
            <motion.div 
              className="flex justify-center space-x-2 mt-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  animate={{ 
                    rotate: [0, 360],
                    scale: [1, 1.2, 1]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Wallet Connection Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="glass-morphism border-gray-700/50 shadow-2xl animate-glow rounded-2xl p-6">
              <motion.h2 
                className="text-2xl font-bold text-white mb-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                Connect Your Wallet
              </motion.h2>
              
              <motion.p 
                className="text-gray-400 text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
              >
                Choose your preferred wallet to start your trading journey
              </motion.p>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-xl p-4">
                <DynamicWidget />
              </div>
            </div>
          </motion.div>


        </motion.div>
      </div>
    </div>
  );
} 