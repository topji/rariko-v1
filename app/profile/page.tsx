'use client'

import React, { useState } from 'react'
import { Navigation } from '../../components/Navigation'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { useDynamicWallet } from '../../hooks/useDynamicWallet'
import { useRouter } from 'next/navigation'
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
} from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'

const mockReferData = {
  inviteCode: 'GVV5KNL',
  volume: 12345.67,
  referred: [
    { username: 'alice', time: '2h ago' },
    { username: 'bob', time: '1d ago' },
    { username: 'charlie', time: '3d ago' },
  ],
}

export default function ProfilePage() {
  const {
    isConnected,
    walletAddress,
    displayName,
    tokenBalances,
    isLoadingTokens,
    logout,
    exportPrivateKey,
    onrampEnabled,
    buyWithFiat,
  } = useDynamicWallet()

  const router = useRouter()
  const [isAddressCopied, setIsAddressCopied] = useState(false)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [isInviteCopied, setIsInviteCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  // Avatar mock (replace with real avatar if available)
  const avatarUrl = 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + (displayName || 'user')

  // SOL balance
  const solBalance = tokenBalances?.find(token => token.symbol === 'SOL')?.balance || 0

  const handleCopyAddress = async () => {
    if (walletAddress) {
      await navigator.clipboard.writeText(walletAddress)
      setIsAddressCopied(true)
      setTimeout(() => setIsAddressCopied(false), 2000)
    }
  }

  const handleCopyInvite = async () => {
    await navigator.clipboard.writeText(mockReferData.inviteCode)
    setIsInviteCopied(true)
    setTimeout(() => setIsInviteCopied(false), 2000)
  }

  const handleBuySol = () => {
    if (walletAddress) {
      buyWithFiat(walletAddress)
      setShowLoadModal(false)
    }
  }

  const handleExportPrivateKey = () => {
    exportPrivateKey()
    setShowMenu(false)
  }

  const handleLogout = () => {
    logout()
    setShowMenu(false)
  }

  React.useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  if (!isConnected) return null

  return (
    <div className="min-h-screen bg-gray-900 text-white pb-20 relative overflow-hidden">
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
              <span className="text-2xl font-bold truncate">{displayName}</span>
              {/* 3-dot menu */}
              <div className="relative">
                <button 
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {/* Dropdown menu */}
                {showMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50">
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

      <div className="px-4 space-y-6 relative z-10">
        {/* SOL Balance Card */}
        <Card className="bg-gray-800 border border-gray-700/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">SOL Balance</span>
            <Button
              variant="outline"
              size="sm"
              className="text-usdt border-usdt hover:bg-usdt/10"
              onClick={() => setShowLoadModal(true)}
            >
              Load
            </Button>
          </div>
          <div className="text-3xl font-bold text-white mb-2">{isLoadingTokens ? '...' : solBalance.toFixed(4)} <span className="text-base text-gray-400 font-normal">SOL</span></div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-usdt border-usdt hover:bg-usdt/10"
              onClick={() => setShowLoadModal(true)}
            >
              <Globe className="w-4 h-4 mr-1" /> With Fiat
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
            >
              {isInviteCopied ? <Check className="w-4 h-4 text-usdt" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 font-mono">{mockReferData.inviteCode}</span>
            </Button>
          </div>
          <div className="mb-4">
            <span className="text-gray-400 text-sm">Volume traded by referees:</span>
            <span className="ml-2 text-lg font-bold text-usdt">${mockReferData.volume.toLocaleString()}</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Referred Users</h4>
            <div className="space-y-2">
              {mockReferData.referred.map((ref, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-900/60 rounded-lg px-4 py-2">
                  <span className="font-mono text-white">{ref.username}</span>
                  <span className="text-xs text-gray-400">{ref.time}</span>
                </div>
              ))}
              {mockReferData.referred.length === 0 && (
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

      {/* Load Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm relative">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-white"
              onClick={() => setShowLoadModal(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4 text-white">Load SOL</h2>
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
              className="w-full bg-usdt hover:bg-primary-600 text-white font-semibold py-3 rounded-xl mt-2"
              onClick={handleBuySol}
            >
              <Globe className="w-4 h-4 mr-2" /> Buy with Fiat
            </Button>
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