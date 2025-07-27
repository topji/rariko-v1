'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Navigation } from '../../components/Navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useDynamicWallet } from '../../hooks/useDynamicWallet'
import { useSolTransfer } from '../../hooks/useSolTransfer'
import { useRouter } from 'next/navigation'
import { useDynamicContext, useEmbeddedReveal, useOnramp } from "@dynamic-labs/sdk-react-core"
import { OnrampProviders } from "@dynamic-labs/sdk-api"
import {
  User,
  Wallet,
  Copy,
  ChevronRight,
  MoreVertical,
  Globe,
  Share2,
  X,
  Check,
  LogOut,
  Key,
  Download,
  Send,
  Loader2,
} from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import QRCode from 'qrcode'
import { useUserApi } from '../../hooks/useUserApi'
// import { orderApi } from '../../lib/api'
// import SellTokenModal from '../../components/SellTokenModal'
// import TransactionSuccessModal from '../../components/TransactionSuccessModal'

// Type definitions
// interface UserData {
//   id: string;
//   username: string;
//   displayName: string;
//   walletAddress: string;
//   referralCode: string;
//   referralCount: number;
//   totalVolume: number;
//   lastLogin: string;
//   createdAt: string;
// }

interface ReferralData {
  referralCode: string;
  referralCount: number;
  totalVolume: number;
  referredUsers: Array<{
    username: string;
    displayName: string;
    createdAt: string;
    totalVolume: number;
  }>;
}

export default function ProfilePage() {
  const {
    isConnected,
    walletAddress,
    displayName,
    tokenBalances,
    isLoadingTokens,
    logout,
  } = useDynamicWallet()

  // User API hook for backend integration
  const { getProfile, getReferrals, user, loading: userLoading } = useUserApi()

  // Direct Dynamic Labs hooks
  const { primaryWallet } = useDynamicContext()
  const { initExportProcess } = useEmbeddedReveal()
  const { open: openOnramp } = useOnramp()

  const router = useRouter()
  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [showSendModal, setShowSendModal] = useState(false)
  const [isInviteCopied, setIsInviteCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [sendAmount, setSendAmount] = useState('')
  const [sendRecipient, setSendRecipient] = useState('')
  const [lastTxId, setLastTxId] = useState('')
  const [lastAmount, setLastAmount] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [loadModalStep, setLoadModalStep] = useState<'options' | 'fiat' | 'crypto-disclaimer' | 'crypto-qr'>('options')
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')
  const [referralData, setReferralData] = useState<ReferralData | null>(null)

  // Ref for menu click outside handling
  const menuRef = useRef<HTMLDivElement>(null)

  // Avatar mock (replace with real avatar if available)
  const avatarUrl = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (displayName || 'user')

  // SOL balance and USD value
  const solBalance = tokenBalances?.find(token => token.symbol === 'SOL')?.balance || 0
  const solBalanceUSD = tokenBalances?.find(token => token.symbol === 'SOL')?.marketValue || 0
  
  // SOL transfer hook
  const { sendSol, isLoading: isSendingSol } = useSolTransfer()

  // Handle click outside menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Load user data when wallet is connected
  useEffect(() => {
    const loadUserData = async () => {
    if (walletAddress) {
        try {
          // Load user profile
          const profile = await getProfile(walletAddress);
          if (profile) {
            // Update display name to use username from backend
            // This will be used in the UI
          }
          
          // Load referral data
          const referrals = await getReferrals(walletAddress);
          if (referrals) {
            setReferralData(referrals);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [walletAddress, getProfile, getReferrals]);

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setIsAddressCopied(true)
      setTimeout(() => setIsAddressCopied(false), 2000)
    }
  }

  const handleCopyInvite = async () => {
    const referralCode = user?.referralCode || referralData?.referralCode;
    if (referralCode) {
      await navigator.clipboard.writeText(referralCode)
    setIsInviteCopied(true)
    setTimeout(() => setIsInviteCopied(false), 2000)
    }
  }

  const handleBuySol = () => {
    if (walletAddress) {
      openOnramp({
        onrampProvider: OnrampProviders.Banxa,
        token: 'SOL',
        address: walletAddress,
      }).then(() => {
        // Optionally refresh the balance after success
        // You can add a function to refresh SOL balance here
        console.log('Onramp completed successfully')
      })
      setShowLoadModal(false)
    }
  }

  const handleExportPrivateKey = () => {
    if (primaryWallet) {
      initExportProcess()
    }
    setShowMenu(false)
  }

  const handleLogout = () => {
    logout()
    setShowMenu(false)
  }

  // Generate QR code for wallet address
  const generateQRCode = async (address: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(address, {
        width: 128,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      console.error('Error generating QR code:', error)
    }
  }

  // Generate QR code when crypto QR step is reached
  useEffect(() => {
    if (loadModalStep === 'crypto-qr' && walletAddress) {
      generateQRCode(walletAddress)
    }
  }, [loadModalStep, walletAddress])

  const handleSendSol = async () => {
    if (!sendRecipient || !sendAmount) {
      alert('Please enter recipient and amount')
      return
    }

    const amount = parseFloat(sendAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (amount > solBalance) {
      alert('Insufficient SOL balance')
      return
    }

    // Basic Solana address validation
    if (sendRecipient.length !== 44 || !sendRecipient.match(/^[1-9A-HJ-NP-Za-km-z]+$/)) {
      alert('Please enter a valid Solana wallet address')
      return
    }

    try {
      const result = await sendSol(sendRecipient, amount)
      setLastTxId(result.txId)
      setLastAmount(sendAmount)
      setShowSuccessModal(true)
      setShowSendModal(false)
      setSendAmount('')
      setSendRecipient('')
    } catch (error: any) {
      console.error('Send failed:', error)
      alert(`Transaction failed: ${error.message}`)
    }
  }

  React.useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden>
        <svg width="100%" height="100%" className="opacity-5">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#fff" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10">
        <PageHeader />
      </div>
      
      {/* Profile Info */}
      <div className="px-4 pt-8 pb-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-20 h-20 rounded-2xl border-4 border-usdt bg-gray-800 object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold truncate">
                {user?.username || displayName}
              </span>
              {/* 3-dot menu */}
              <div className="relative" ref={menuRef}>
                <button 
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-[9999]">
                    <div className="py-2">
                      <button
                        onClick={handleExportPrivateKey}
                        className="w-full px-4 py-3 text-left text-gray-300 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <Key className="w-4 h-4" />
                        <span>Export Private Key</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-base font-mono text-gray-400 truncate">{walletAddress?.slice(0, 4)}...{walletAddress?.slice(-4)}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAddress}
                className="text-gray-400 hover:text-usdt"
              >
                {isAddressCopied ? <Check className="w-4 h-4 text-usdt" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 space-y-6 relative z-10 pb-32">
        {/* SOL Balance Card */}
        <Card className="bg-gray-800 border border-gray-700/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">SOL Balance</span>
          </div>
          <div className="mb-4">
            <div className="text-3xl font-bold text-white">
              {isLoadingTokens ? '...' : `$${solBalanceUSD.toFixed(2)}`}
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {isLoadingTokens ? '...' : `${solBalance.toFixed(4)} SOL`}
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-usdt border-usdt hover:bg-usdt/10"
              onClick={() => setShowSendModal(true)}
            >
              <Send className="w-4 h-4 mr-1" /> Withdraw
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-usdt border-usdt hover:bg-usdt/10"
              onClick={() => setShowLoadModal(true)}
            >
              <Globe className="w-4 h-4 mr-1" /> Load Funds
            </Button>
          </div>
        </Card>

        {/* Refer & Earn Section */}
        <Card className="bg-gray-800 border border-gray-700/60 backdrop-blur-xl rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-usdt" />
              <span className="font-semibold text-white">Refer & Earn</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-usdt border-usdt hover:bg-usdt/10"
              onClick={handleCopyInvite}
              disabled={userLoading || !user?.referralCode}
            >
              {isInviteCopied ? <Check className="w-4 h-4 text-usdt" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 font-mono">
                {userLoading ? 'Loading...' : user?.referralCode || 'No code'}
              </span>
            </Button>
          </div>
          <div className="mb-4">
            <span className="text-gray-400 text-sm">Volume traded by referees:</span>
            <span className="ml-2 text-lg font-bold text-usdt">
              ${referralData?.totalVolume?.toLocaleString() || 0}
            </span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Referred Users</h4>
            <div className="space-y-2">
              {userLoading ? (
                <div className="text-gray-500 text-sm">Loading...</div>
              ) : referralData?.referredUsers?.map((ref, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-900/60 rounded-lg px-4 py-2">
                  <div className="flex flex-col">
                    <span className="font-mono text-white">{ref.username}</span>
                    <span className="text-xs text-gray-400">
                      ${ref.totalVolume?.toLocaleString() || 0} traded
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(ref.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
              {!userLoading && (!referralData?.referredUsers || referralData.referredUsers.length === 0) && (
                <div className="text-gray-500 text-sm">No referred users yet.</div>
              )}
            </div>
          </div>
        </Card>

        {/* Logout Button */}
        <Card className="bg-gray-800 border border-gray-700/60 backdrop-blur-xl rounded-2xl p-6">
          <Button
            variant="outline"
            onClick={handleLogout}
            className="w-full text-red-400 border-red-400 hover:bg-red-400/10 flex items-center justify-center gap-3"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </Button>
        </Card>
      </div>

      <Navigation />

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => {
                setShowLoadModal(false)
                setLoadModalStep('options')
                setHasAcceptedDisclaimer(false)
              }}
            >
              <X className="w-5 h-5" />
            </button>
            
            {loadModalStep === 'options' && (
              <>
                <h2 className="text-lg font-bold mb-4 text-white">Load Funds</h2>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-usdt hover:bg-primary-600 text-white font-semibold py-3 rounded-xl"
                    // onClick={() => setLoadModalStep('fiat')}
                  >
                    <Globe className="w-4 h-4 mr-2" /> Load with Fiat(Coming Soon)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full text-usdt border-usdt hover:bg-usdt/10 font-semibold py-3 rounded-xl"
                    onClick={() => setLoadModalStep('crypto-disclaimer')}
                  >
                    <Wallet className="w-4 h-4 mr-2" /> Load with Crypto
                  </Button>
                </div>
              </>
            )}

            {loadModalStep === 'fiat' && (
              <>
                <h2 className="text-lg font-bold mb-4 text-white">Load with Fiat</h2>
            <div className="mb-4">
              <div className="text-gray-400 text-sm mb-1">Wallet Address</div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-white">{walletAddress}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAddress}
                  className="text-gray-400 hover:text-usdt"
                >
                  {isAddressCopied ? <Check className="w-4 h-4 text-usdt" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button
                  className="w-full bg-usdt hover:bg-primary-600 text-white font-semibold py-3 rounded-xl"
              onClick={handleBuySol}
                >
                  <Globe className="w-4 h-4 mr-2" /> Buy SOL with Fiat
                </Button>
              </>
            )}

            {loadModalStep === 'crypto-disclaimer' && (
              <>
                <h2 className="text-lg font-bold mb-4 text-white">Important Notice</h2>
                <div className="mb-6">
                  <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-yellow-900 text-sm font-bold">!</span>
                      </div>
                      <div>
                        <h3 className="text-yellow-400 font-semibold mb-2">Blockchain Restriction</h3>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          I am aware that I can only send SOL tokens on the Solana blockchain to add funds to my wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="disclaimer"
                      checked={hasAcceptedDisclaimer}
                      onChange={(e) => setHasAcceptedDisclaimer(e.target.checked)}
                      className="w-4 h-4 text-usdt bg-gray-800 border-gray-600 rounded focus:ring-usdt focus:ring-2"
                    />
                    <label htmlFor="disclaimer" className="text-gray-300 text-sm">
                      I understand and accept this restriction
                    </label>
                  </div>
                </div>
                <Button
                  className="w-full bg-usdt hover:bg-primary-600 text-white font-semibold py-3 rounded-xl"
                  disabled={!hasAcceptedDisclaimer}
                  onClick={() => setLoadModalStep('crypto-qr')}
                >
                  Continue
                </Button>
              </>
            )}

            {loadModalStep === 'crypto-qr' && (
              <>
                <h2 className="text-lg font-bold mb-4 text-white">Receive SOL</h2>
                <div className="mb-6 text-center">
                  <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                    {qrCodeDataUrl ? (
                      <img 
                        src={qrCodeDataUrl} 
                        alt="QR Code" 
                        className="w-32 h-32 rounded"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gray-200 rounded flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <div className="text-gray-400 text-sm mb-2">Wallet Address</div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <span className="font-mono text-white text-sm break-all">{walletAddress}</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full text-usdt border-usdt hover:bg-usdt/10 font-semibold py-3 rounded-xl mb-3"
                    onClick={handleCopyAddress}
                  >
                    {isAddressCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    Copy Address
                  </Button>
                </div>
                <Button
                  className="w-full bg-usdt hover:bg-primary-600 text-white font-semibold py-3 rounded-xl"
                  onClick={() => {
                    setShowLoadModal(false)
                    setLoadModalStep('options')
                    setHasAcceptedDisclaimer(false)
                  }}
                >
                  I'm Done
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => {
                setShowSendModal(false)
                setSendAmount('')
                setSendRecipient('')
              }}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4 text-white">Send SOL</h2>
            
            <div className="space-y-4">
              {/* Recipient Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Recipient Address
                </label>
                <Input
                  type="text"
                  placeholder="Enter Solana wallet address"
                  value={sendRecipient}
                  onChange={(e) => setSendRecipient(e.target.value)}
                  className={`bg-gray-800 border-gray-700 text-white ${
                    sendRecipient && sendRecipient.length === 44 && sendRecipient.match(/^[1-9A-HJ-NP-Za-km-z]+$/)
                      ? 'border-green-500 focus:ring-green-500'
                      : sendRecipient && (sendRecipient.length !== 44 || !sendRecipient.match(/^[1-9A-HJ-NP-Za-km-z]+$/))
                      ? 'border-red-500 focus:ring-red-500'
                      : ''
                  }`}
                />
                <p className={`text-xs mt-1 ${
                  sendRecipient && sendRecipient.length === 44 && sendRecipient.match(/^[1-9A-HJ-NP-Za-km-z]+$/)
                    ? 'text-green-400'
                    : sendRecipient && (sendRecipient.length !== 44 || !sendRecipient.match(/^[1-9A-HJ-NP-Za-km-z]+$/))
                    ? 'text-red-400'
                    : 'text-gray-500'
                }`}>
                  {sendRecipient && sendRecipient.length === 44 && sendRecipient.match(/^[1-9A-HJ-NP-Za-km-z]+$/)
                    ? '✓ Valid Solana address'
                    : sendRecipient && (sendRecipient.length !== 44 || !sendRecipient.match(/^[1-9A-HJ-NP-Za-km-z]+$/))
                    ? '✗ Invalid address format'
                    : 'Enter a valid Solana wallet address (44 characters)'}
                </p>
              </div>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Amount (SOL)
                </label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">Available: {solBalance.toFixed(4)} SOL</p>
              </div>
              
              {/* Quick Amount Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Quick Amounts
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[0.1, 0.5, 1, 2, 5, 10].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setSendAmount(amount.toString())}
                      className="h-8 text-xs"
                      disabled={amount > solBalance}
                    >
                      {amount} SOL
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Transaction Info */}
              <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Network Fee</span>
                  <span className="text-white">~0.000005 SOL</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Your Balance</span>
                  <span className="text-white">{solBalance.toFixed(4)} SOL</span>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowSendModal(false)
                    setSendAmount('')
                    setSendRecipient('')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendSol}
                  disabled={
                    !sendRecipient || 
                    !sendAmount || 
                    parseFloat(sendAmount) <= 0 || 
                    parseFloat(sendAmount) > solBalance || 
                    isSendingSol ||
                    sendRecipient.length !== 44 || 
                    !sendRecipient.match(/^[1-9A-HJ-NP-Za-km-z]+$/)
                  }
                  className="flex-1 bg-usdt hover:bg-primary-600"
                >
                  {isSendingSol ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send SOL
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md relative">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Transaction Successful!</h2>
                <p className="text-gray-300">Your SOL has been sent successfully.</p>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Transaction ID</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white text-xs">{lastTxId.slice(0, 8)}...{lastTxId.slice(-8)}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(lastTxId)
                        alert('Transaction ID copied!')
                      }}
                      className="text-gray-400 hover:text-usdt"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Amount Sent</span>
                  <span className="text-white">{lastAmount} SOL</span>
                </div>
              </div>
              
              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-usdt hover:bg-primary-600"
              >
                Done
            </Button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}

      <Navigation />
    </div>
  )
} 