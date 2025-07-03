'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, Rocket, Sparkles, ArrowRight, Mail, Lock, Zap, Shield, Star } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useAuth } from '../../contexts/AuthContext'
import { useWallet } from '../../contexts/WalletContext'
import { generateUsername, generateWalletAddress } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

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

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const [showParticles, setShowParticles] = useState(false)
  const { login } = useAuth()
  const { initializeWallet } = useWallet()
  const router = useRouter()

  useEffect(() => {
    setShowParticles(true)
  }, [])

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    try {
      // Simulate Google OAuth
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockUser = {
        id: Date.now().toString(),
        email: 'user@gmail.com',
        username: generateUsername(),
        displayName: 'John Doe',
        avatar: 'https://lh3.googleusercontent.com/a/default-user',
        walletAddress: generateWalletAddress(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      login(mockUser)
      initializeWallet(mockUser.walletAddress)
      toast.success('Welcome to RariKo! 🚀')
      router.push('/')
    } catch (error) {
      toast.error('Sign in failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEmailSignIn = async () => {
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    
    setIsLoading(true)
    try {
      // Simulate sending OTP
      await new Promise(resolve => setTimeout(resolve, 1500))
      setShowOtp(true)
      toast.success('OTP sent to your email!')
    } catch (error) {
      toast.error('Failed to send OTP')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOtpVerification = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP')
      return
    }
    
    setIsLoading(true)
    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockUser = {
        id: Date.now().toString(),
        email: email,
        username: generateUsername(),
        displayName: email.split('@')[0],
        avatar: undefined,
        walletAddress: generateWalletAddress(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      login(mockUser)
      initializeWallet(mockUser.walletAddress)
      toast.success('Welcome to RariKo! 🚀')
      router.push('/')
    } catch (error) {
      toast.error('Invalid OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

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
              Join the future of trading
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

          {/* Auth Card */}
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="glass-morphism border-gray-700/50 shadow-2xl animate-glow">
              <CardHeader className="text-center pb-6">
                <motion.h2 
                  className="text-2xl font-bold text-white mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  {showOtp ? 'Enter OTP' : 'Register / Login'}
                </motion.h2>
                <motion.p 
                  className="text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.1 }}
                >
                  {showOtp 
                    ? 'We sent a 6-digit code to your email'
                    : 'Start your trading journey today'
                  }
                </motion.p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <AnimatePresence mode="wait">
                  {!showOtp ? (
                    <motion.div
                      key="email-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* Email Input */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                      >
                        <Input
                          label="Email address"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          icon={<Mail className="w-4 h-4" />}
                        />
                      </motion.div>
                      
                      {/* Email Sign In Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.3 }}
                      >
                        <Button
                          onClick={handleEmailSignIn}
                          loading={isLoading}
                          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 neon-glow"
                          icon={<Mail className="w-4 h-4" />}
                        >
                          Continue with Email
                        </Button>
                      </motion.div>
                      
                      <motion.div 
                        className="relative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.4 }}
                      >
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-4 bg-gray-900 text-gray-400">or</span>
                        </div>
                      </motion.div>
                      
                      {/* Google Sign In Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5 }}
                      >
                        <Button
                          variant="secondary"
                          onClick={handleGoogleSignIn}
                          loading={isLoading}
                          className="w-full bg-white/10 backdrop-blur-sm border border-gray-600/50 hover:bg-white/20 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                          icon={
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                              <path
                                fill="currentColor"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                              />
                              <path
                                fill="currentColor"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                              />
                              <path
                                fill="currentColor"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                              />
                            </svg>
                          }
                        >
                          Continue with Google
                        </Button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="otp-form"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      {/* OTP Input */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Input
                          label="6-digit code"
                          type="text"
                          placeholder="000000"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          icon={<Lock className="w-4 h-4" />}
                          maxLength={6}
                        />
                      </motion.div>
                      
                      {/* Verify OTP Button */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <Button
                          onClick={handleOtpVerification}
                          loading={isLoading}
                          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 neon-glow"
                          icon={<ArrowRight className="w-4 h-4" />}
                        >
                          Verify & Continue
                        </Button>
                      </motion.div>
                      
                      {/* Back to Email */}
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <Button
                          variant="ghost"
                          onClick={() => setShowOtp(false)}
                          className="w-full text-gray-400 hover:text-white transition-colors duration-300"
                        >
                          ← Back to email
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="mt-8 grid grid-cols-3 gap-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.6 }}
          >
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-green-500/30 group-hover:border-green-400/50 transition-all duration-300">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
              <p className="text-sm text-gray-300 font-medium">Secure</p>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-blue-500/30 group-hover:border-blue-400/50 transition-all duration-300">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-sm text-gray-300 font-medium">Fast</p>
            </motion.div>
            
            <motion.div 
              className="text-center group"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-purple-500/30 group-hover:border-purple-400/50 transition-all duration-300">
                <Star className="w-6 h-6 text-purple-400" />
              </div>
              <p className="text-sm text-gray-300 font-medium">Premium</p>
            </motion.div>
          </motion.div>

          {/* Bottom CTA */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <p className="text-gray-500 text-sm">
              Ready to make your first million? 🚀
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 