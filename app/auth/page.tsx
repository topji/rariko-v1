'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, Shield, Zap, ArrowRight, Mail, Lock } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { useAuth } from '../../contexts/AuthContext'
import { useWallet } from '../../contexts/WalletContext'
import { generateUsername, generateWalletAddress } from '../../lib/utils'
import { toast } from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [showOtp, setShowOtp] = useState(false)
  const { login } = useAuth()
  const { initializeWallet } = useWallet()
  const router = useRouter()

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-usdt rounded-2xl mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">RariKo</h1>
          <p className="text-gray-300">Your stablecoin wallet, simplified</p>
        </div>

        {/* Auth Card */}
        <Card variant="elevated">
          <CardHeader>
            <h2 className="text-xl font-semibold text-center text-white">
              {showOtp ? 'Enter OTP' : 'Sign in to RariKo'}
            </h2>
            <p className="text-sm text-gray-400 text-center">
              {showOtp 
                ? 'We sent a 6-digit code to your email'
                : 'Send and receive USDT instantly'
              }
            </p>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {!showOtp ? (
              <>
                {/* Email Input */}
                <Input
                  label="Email address"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<Mail className="w-4 h-4" />}
                />
                
                {/* Email Sign In Button */}
                <Button
                  onClick={handleEmailSignIn}
                  loading={isLoading}
                  className="w-full"
                  icon={<Mail className="w-4 h-4" />}
                >
                  Continue with Email
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-800 text-gray-400">or</span>
                  </div>
                </div>
                
                {/* Google Sign In Button */}
                <Button
                  variant="secondary"
                  onClick={handleGoogleSignIn}
                  loading={isLoading}
                  className="w-full"
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
              </>
            ) : (
              <>
                {/* OTP Input */}
                <Input
                  label="6-digit code"
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  icon={<Lock className="w-4 h-4" />}
                  maxLength={6}
                />
                
                {/* Verify OTP Button */}
                <Button
                  onClick={handleOtpVerification}
                  loading={isLoading}
                  className="w-full"
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Verify & Continue
                </Button>
                
                {/* Back to Email */}
                <Button
                  variant="ghost"
                  onClick={() => setShowOtp(false)}
                  className="w-full"
                >
                  ← Back to email
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="w-8 h-8 bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Shield className="w-4 h-4 text-green-400" />
            </div>
            <p className="text-xs text-gray-400">Secure</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <p className="text-xs text-gray-400">Fast</p>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Wallet className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-xs text-gray-400">Simple</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 