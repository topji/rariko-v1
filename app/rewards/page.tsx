'use client'

import React, { useState } from 'react'
import { Gift, Star, Info, ArrowRight, Activity, CheckCircle } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { Card } from '../../components/ui/Card'
// import { Button } from '../../components/ui/Button'
import { Navigation } from '../../components/Navigation'

const mockData = {
  rikoBalance: 156.75,
  apy: 20.1,
  multiplier: 1.5,
  maxMultiplier: 6.0,
  multiplierPercent: 25,
  quests: [
    {
      id: 1,
      title: 'Complete 100 trades',
      progress: 45,
      total: 100,
      reward: '+1.5x',
      completed: false,
    },
    {
      id: 2,
      title: 'Refer 3 friends',
      progress: 3,
      total: 3,
      reward: '+1.0x',
      completed: true,
    },
    {
      id: 3,
      title: 'Hold 100 RIKO for 7 days',
      progress: 7,
      total: 7,
      reward: '+0.5x',
      completed: true,
    },
  ],
}

export default function RewardsPage() {
  const [tab, setTab] = useState<'active' | 'history'>('active')

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
        <PageHeader showProfile={true} />
      </div>

      <div className="px-4 space-y-6 relative z-10">
        {/* RIKO Balance Card */}
        <Card className="bg-gray-800 border border-gray-700/60 backdrop-blur-xl rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-gray-300 text-sm mb-1">$RIKO BALANCE</div>
            <div className="text-3xl font-bold mb-1 text-usdt">{mockData.rikoBalance} <span className="text-base font-medium text-white">$RIKO</span></div>
            <div className="text-usdt text-xs flex items-center gap-1">
              <Star className="w-4 h-4 inline-block mr-1" />
              Earning {mockData.apy}% APY
            </div>
          </div>
          <div className="w-14 h-14 bg-usdt/80 rounded-full flex items-center justify-center">
            <Gift className="w-7 h-7 text-white" />
          </div>
        </Card>

        {/* Multiplier Card */}
        <Card className="bg-gray-800 border border-gray-700/60 backdrop-blur-xl rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-usdt" />
              <span className="font-semibold text-white">MULTIPLIER</span>
              <span title="Your rewards multiplier increases as you complete quests.">
                <Info className="w-4 h-4 text-usdt/80 cursor-pointer" />
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-usdt">{mockData.multiplier}x</span>
              <span className="text-gray-400">/ {mockData.maxMultiplier}x</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-full">
              <div className="h-2 rounded-full bg-gray-700">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-usdt to-primary-600"
                  style={{ width: `${(mockData.multiplier / mockData.maxMultiplier) * 100}%` }}
                />
              </div>
            </div>
            <div className="flex flex-col items-center ml-2">
              <svg width="40" height="40">
                <circle cx="20" cy="20" r="16" stroke="#1DBF73" strokeWidth="4" fill="none" opacity="0.2" />
                <circle
                  cx="20" cy="20" r="16"
                  stroke="#1DBF73"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={100}
                  strokeDashoffset={100 - mockData.multiplierPercent}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.5s' }}
                />
              </svg>
              <span className="absolute text-xs text-usdt mt-1">{mockData.multiplierPercent}%</span>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-700/60 mb-2">
          <button
            className={`pb-2 font-semibold text-sm transition-all ${tab === 'active' ? 'text-usdt border-b-2 border-usdt' : 'text-gray-400'}`}
            onClick={() => setTab('active')}
          >
            Active Quests
          </button>
          <button
            className={`pb-2 font-semibold text-sm transition-all ${tab === 'history' ? 'text-usdt border-b-2 border-usdt' : 'text-gray-400'}`}
            onClick={() => setTab('history')}
          >
            Reward History
          </button>
        </div>

        {/* Quests */}
        {tab === 'active' ? (
          <div className="space-y-4">
            {mockData.quests.filter(q => !q.completed).map((quest) => (
              <Card key={quest.id} className="bg-gray-800 border border-gray-700/40 backdrop-blur-xl rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-usdt/80 rounded-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-white">{quest.title}</div>
                    <div className="text-xs text-gray-400 mt-1">{quest.progress} / {quest.total} <span className="ml-2">{Math.round((quest.progress/quest.total)*100)}%</span></div>
                    <div className="w-32 h-2 bg-gray-700 rounded-full mt-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-usdt to-primary-600"
                        style={{ width: `${(quest.progress/quest.total)*100}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-usdt/10 text-usdt px-3 py-1 rounded-full text-xs font-semibold">{quest.reward}</span>
                </div>
              </Card>
            ))}
            {mockData.quests.filter(q => !q.completed).length === 0 && (
              <div className="text-center text-gray-400 py-8">No active quests. Check back soon!</div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {mockData.quests.filter(q => q.completed).map((quest) => (
              <Card key={quest.id} className="bg-gray-800 border border-gray-700/40 backdrop-blur-xl rounded-2xl p-5 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-usdt/80 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <div className="font-semibold text-white line-through">{quest.title}</div>
                    <div className="text-xs text-gray-400 mt-1">Completed</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-usdt/10 text-usdt px-3 py-1 rounded-full text-xs font-semibold">{quest.reward}</span>
                </div>
              </Card>
            ))}
            {mockData.quests.filter(q => q.completed).length === 0 && (
              <div className="text-center text-gray-400 py-8">No completed quests yet.</div>
            )}
          </div>
        )}
      </div>

      <Navigation />
    </div>
  )
} 