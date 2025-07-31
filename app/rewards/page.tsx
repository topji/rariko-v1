'use client'

import React, { useState, useEffect } from 'react'
import { 
  Gift, 
  Star, 
  Info, 
  ArrowRight, 
  Activity, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Ticket, 
  Trophy,
  DollarSign,
  Target,
  Zap,
  Award,
  Calendar,
  Clock
} from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Navigation } from '../../components/Navigation'
import { useDynamicWallet } from '../../hooks/useDynamicWallet'
import { useUserApi } from '../../hooks/useUserApi'
import { orderApi } from '../../lib/api'

// Mock data for development - replace with real API calls
const mockData = {
  rizzBalance: 1250.75,
  currentMultiplier: 1.25,
  maxMultiplier: 3.0,
  totalVolume: 3500,
  referralCount: 2,
  raffleTickets: 3,
  completedQuests: ['refer_3_friends', 'trade_100'],
  quests: [
    {
      id: 'refer_5_friends',
      title: 'Refer 5 Frens',
      description: 'Invite 5 friends to join rizz.money',
      progress: 2,
      total: 5,
      reward: '1000 $RIZZ + 1x Multiplier',
      rewardType: 'rizz_multiplier',
      rizzAmount: 1000,
      multiplierBoost: 1.0,
      completed: false,
      icon: Users
    },
    {
      id: 'trade_100',
      title: 'Trade $100 worth of stocks',
      description: 'Complete trades worth $100 or more',
      progress: 100,
      total: 100,
      reward: '50 $RIZZ',
      rewardType: 'rizz',
      rizzAmount: 50,
      multiplierBoost: 0,
      completed: true,
      icon: TrendingUp
    },
    {
      id: 'trade_1000',
      title: 'Trade $1000 worth of stocks',
      description: 'Complete trades worth $1000 or more',
      progress: 3500,
      total: 1000,
      reward: '1000 $RIZZ + 1.25x Multiplier',
      rewardType: 'rizz_multiplier',
      rizzAmount: 1000,
      multiplierBoost: 1.25,
      completed: true,
      icon: Target
    },
    {
      id: 'trade_5000',
      title: 'Trade $5000 worth of stocks',
      description: 'Complete trades worth $5000 or more',
      progress: 3500,
      total: 5000,
      reward: '7500 $RIZZ + 2x Multiplier',
      rewardType: 'rizz_multiplier',
      rizzAmount: 7500,
      multiplierBoost: 2.0,
      completed: false,
      icon: Trophy
    }
  ],
  raffleInfo: {
    poolAmount: 10000,
    currency: 'USDC',
    totalTickets: 45,
    userTickets: 3,
    endDate: '2024-02-15T23:59:59Z',
    description: 'Win a share of $10,000 USDC! Earn 1 raffle ticket for every $1000 in trading volume.'
  }
}

export default function RewardsPage() {
  const [tab, setTab] = useState<'quests' | 'raffle'>('quests')
  const { walletAddress } = useDynamicWallet()
  const { getProfile } = useUserApi()
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (walletAddress) {
        try {
          const profile = await getProfile(walletAddress)
          setUserData(profile)
        } catch (error) {
          console.error('Error loading user data:', error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    loadUserData()
  }, [walletAddress, getProfile])

  // Calculate constant rewards rate
  const constantRewardsRate = 25 // Base rate per $100
  const effectiveRate = constantRewardsRate * mockData.currentMultiplier

  // Calculate progress percentage
  const getProgressPercentage = (progress: number, total: number) => {
    return Math.min((progress / total) * 100, 100)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date()
    const end = new Date(mockData.raffleInfo.endDate)
    const diff = end.getTime() - now.getTime()
    
    if (diff <= 0) return 'Ended'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    return `${days}d ${hours}h`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pb-20">
        <PageHeader showProfile={true} />
        <div className="px-4 py-6 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 border-2 border-usdt border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-400">Loading rewards...</span>
          </div>
        </div>
        <Navigation />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black pb-20 relative overflow-hidden">
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
        <PageHeader showProfile={true} />
      </div>

      <div className="px-4 space-y-6 relative z-10">
        {/* RIZZ Balance & Multiplier Cards */}
        <div className="grid grid-cols-2 gap-4">
          {/* RIZZ Balance Card */}
          <Card className="bg-gradient-to-br from-usdt/20 to-green-600/20 border border-usdt/30 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-usdt rounded-lg flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-300">$RIZZ Balance</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {mockData.rizzBalance.toLocaleString()}
            </div>
            <div className="text-xs text-usdt">
              +{effectiveRate.toFixed(1)} per $100 traded
            </div>
          </Card>

          {/* Multiplier Card */}
          <Card className="bg-gradient-to-br from-purple-500/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-xl rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-300">Multiplier</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              {mockData.currentMultiplier}x
            </div>
            <div className="text-xs text-purple-400">
              Max: {mockData.maxMultiplier}x
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-xl rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">${mockData.totalVolume.toLocaleString()}</div>
            <div className="text-xs text-gray-400">Total Volume</div>
          </Card>
          <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-xl rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">{mockData.referralCount}</div>
            <div className="text-xs text-gray-400">Referrals</div>
          </Card>
          <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-xl rounded-xl p-3 text-center">
            <div className="text-lg font-bold text-white">{mockData.raffleTickets}</div>
            <div className="text-xs text-gray-400">Raffle Tickets</div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-700/60 mb-4">
          <button
            className={`pb-2 font-semibold text-sm transition-all flex items-center gap-2 ${
              tab === 'quests' ? 'text-usdt border-b-2 border-usdt' : 'text-gray-400'
            }`}
            onClick={() => setTab('quests')}
          >
            <Target className="w-4 h-4" />
            Quests
          </button>
          <button
            className={`pb-2 font-semibold text-sm transition-all flex items-center gap-2 ${
              tab === 'raffle' ? 'text-usdt border-b-2 border-usdt' : 'text-gray-400'
            }`}
            onClick={() => setTab('raffle')}
          >
            <Ticket className="w-4 h-4" />
            Raffle Giveaway
          </button>
        </div>

        {/* Quests Tab */}
        {tab === 'quests' && (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2">Complete Quests, Earn Rewards</h2>
              <p className="text-gray-400 text-sm">Complete quests to earn $RIZZ tokens and boost your multiplier</p>
            </div>

            {mockData.quests.map((quest) => {
              const Icon = quest.icon
              const progressPercentage = getProgressPercentage(quest.progress, quest.total)
              const isCompleted = quest.completed || quest.progress >= quest.total

              return (
                <Card key={quest.id} className={`bg-gray-800/50 border backdrop-blur-xl rounded-2xl p-5 transition-all ${
                  isCompleted ? 'border-green-500/30 bg-green-500/5' : 'border-gray-700/50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isCompleted ? 'bg-green-500/20 border border-green-500/30' : 'bg-usdt/20 border border-usdt/30'
                      }`}>
                        {isCompleted ? (
                          <CheckCircle className="w-6 h-6 text-green-400" />
                        ) : (
                          <Icon className="w-6 h-6 text-usdt" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{quest.title}</h3>
                          {isCompleted && (
                            <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 mb-3">{quest.description}</p>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-xs text-gray-400">
                            {quest.progress.toLocaleString()} / {quest.total.toLocaleString()}
                          </span>
                          <span className="text-xs text-usdt">
                            {Math.round(progressPercentage)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isCompleted 
                                ? 'bg-gradient-to-r from-green-500 to-green-400' 
                                : 'bg-gradient-to-r from-usdt to-green-500'
                            }`}
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold text-usdt">{quest.reward}</div>
                        {quest.multiplierBoost > 0 && (
                          <div className="text-xs text-purple-400">+{quest.multiplierBoost}x Multiplier</div>
                        )}
                      </div>
                      {isCompleted && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                          Claimed
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {/* Raffle Tab */}
        {tab === 'raffle' && (
          <div className="space-y-6">
            {/* Raffle Hero Section */}
            <Card className="bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 border border-purple-500/30 backdrop-blur-xl rounded-2xl p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">$10,000 USDC Giveaway</h2>
              <p className="text-gray-300 mb-4">
                Trade to earn raffle tickets and win a share of the prize pool!
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="text-lg font-bold text-white">${mockData.raffleInfo.poolAmount.toLocaleString()}</div>
                  <div className="text-xs text-gray-400">Prize Pool</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3">
                  <div className="text-lg font-bold text-white">{getTimeRemaining()}</div>
                  <div className="text-xs text-gray-400">Time Left</div>
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-xl p-3">
                <div className="text-sm text-gray-300 mb-2">Your Raffle Tickets</div>
                <div className="text-2xl font-bold text-purple-400">{mockData.raffleInfo.userTickets}</div>
                <div className="text-xs text-gray-400">
                  Earn 1 ticket per $1,000 traded
                </div>
              </div>
            </Card>

            {/* How It Works */}
            <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-usdt" />
                How It Works
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-usdt rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                  <span className="text-gray-300">Trade stocks to earn raffle tickets</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-usdt rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                  <span className="text-gray-300">1 ticket for every $1,000 in trading volume</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-usdt rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                  <span className="text-gray-300">More tickets = higher chance to win</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-usdt rounded-full flex items-center justify-center text-xs font-bold text-white">4</div>
                  <span className="text-gray-300">Winners announced on {formatDate(mockData.raffleInfo.endDate)}</span>
                </div>
              </div>
            </Card>

            {/* Current Stats */}
            <Card className="bg-gray-800/50 border border-gray-700/50 backdrop-blur-xl rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Current Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{mockData.raffleInfo.totalTickets}</div>
                  <div className="text-sm text-gray-400">Total Tickets</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">{mockData.raffleInfo.userTickets}</div>
                  <div className="text-sm text-gray-400">Your Tickets</div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-gray-700/50 rounded-xl">
                <div className="text-sm text-gray-300 mb-1">Your Win Probability</div>
                <div className="text-lg font-bold text-purple-400">
                  {((mockData.raffleInfo.userTickets / mockData.raffleInfo.totalTickets) * 100).toFixed(2)}%
                </div>
              </div>
            </Card>

            {/* Action Button */}
            <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 rounded-xl">
              <TrendingUp className="w-5 h-5 mr-2" />
              Start Trading to Earn Tickets
            </Button>
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
} 