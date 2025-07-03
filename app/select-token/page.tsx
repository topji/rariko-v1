'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  Star,
  TrendingUp,
  CheckCircle
} from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent } from '../../components/ui/Card'
import { useWallet } from '../../contexts/WalletContext'
import { useSearchParams, useRouter } from 'next/navigation'
import { PageHeader } from '../../components/PageHeader'

interface Token {
  id: string
  symbol: string
  name: string
  icon: string
  price: number
  balance: number
  decimals: number
  isPopular?: boolean
  isTrending?: boolean
}

export default function SelectTokenPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'popular' | 'trending' | 'my-tokens'>('all')
  const searchParams = useSearchParams()
  const router = useRouter()
  const { wallet } = useWallet()

  // Mock tokens data
  const allTokens: Token[] = [
    {
      id: 'usdt',
      symbol: 'USDT',
      name: 'Tether USD',
      icon: '💵',
      price: 1.00,
      balance: wallet?.balance || 0,
      decimals: 6,
      isPopular: true,
    },
    {
      id: 'usdc',
      symbol: 'USDC',
      name: 'USD Coin',
      icon: '🪙',
      price: 1.00,
      balance: 250.50,
      decimals: 6,
      isPopular: true,
    },
    {
      id: 'eth',
      symbol: 'ETH',
      name: 'Ethereum',
      icon: '🔷',
      price: 3200.00,
      balance: 0.5,
      decimals: 18,
      isPopular: true,
      isTrending: true,
    },
    {
      id: 'matic',
      symbol: 'MATIC',
      name: 'Polygon',
      icon: '🟣',
      price: 0.85,
      balance: 1000,
      decimals: 18,
      isTrending: true,
    },
    {
      id: 'dai',
      symbol: 'DAI',
      name: 'Dai Stablecoin',
      icon: '🟡',
      price: 1.00,
      balance: 75.25,
      decimals: 18,
      isPopular: true,
    },
    {
      id: 'link',
      symbol: 'LINK',
      name: 'Chainlink',
      icon: '🔗',
      price: 15.50,
      balance: 0,
      decimals: 18,
      isTrending: true,
    },
    {
      id: 'uni',
      symbol: 'UNI',
      name: 'Uniswap',
      icon: '🦄',
      price: 8.75,
      balance: 0,
      decimals: 18,
    },
    {
      id: 'aave',
      symbol: 'AAVE',
      name: 'Aave',
      icon: '🦈',
      price: 120.00,
      balance: 0,
      decimals: 18,
    },
  ]

  const [filteredTokens, setFilteredTokens] = useState<Token[]>(allTokens)

  useEffect(() => {
    let filtered = allTokens

    // Filter by category
    switch (selectedCategory) {
      case 'popular':
        filtered = filtered.filter(token => token.isPopular)
        break
      case 'trending':
        filtered = filtered.filter(token => token.isTrending)
        break
      case 'my-tokens':
        filtered = filtered.filter(token => token.balance > 0)
        break
      default:
        break
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(token =>
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTokens(filtered)
  }, [searchQuery, selectedCategory, allTokens])

  const handleTokenSelect = (token: Token) => {
    const type = searchParams.get('type')
    // In a real app, you would pass this back to the swap page
    // For now, we'll just go back
    router.back()
  }

  const handleBack = () => {
    router.back()
  }

  const categories = [
    { id: 'all', label: 'All Tokens', count: allTokens.length },
    { id: 'popular', label: 'Popular', count: allTokens.filter(t => t.isPopular).length },
    { id: 'trending', label: 'Trending', count: allTokens.filter(t => t.isTrending).length },
    { id: 'my-tokens', label: 'My Tokens', count: allTokens.filter(t => t.balance > 0).length },
  ]

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <PageHeader>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          icon={<ArrowLeft className="w-5 h-5" />}
        >
          Back
        </Button>
      </PageHeader>

      <div className="px-4 py-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Search */}
          <div className="space-y-4">
            <Input
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />

            {/* Categories */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id as any)}
                  className="whitespace-nowrap"
                >
                  {category.label}
                  <span className="ml-1 text-xs opacity-75">({category.count})</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Token List */}
          <div className="space-y-2">
            {filteredTokens.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No tokens found</h3>
                  <p className="text-gray-400">Try adjusting your search or category filter</p>
                </CardContent>
              </Card>
            ) : (
              filteredTokens.map((token) => (
                <Card
                  key={token.id}
                  className="cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => handleTokenSelect(token)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-600 rounded-xl flex items-center justify-center text-lg">
                          {token.icon}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">{token.symbol}</h3>
                            {token.isPopular && (
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            )}
                            {token.isTrending && (
                              <TrendingUp className="w-3 h-3 text-green-400" />
                            )}
                          </div>
                          <p className="text-sm text-gray-400">{token.name}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium text-white">
                          {token.balance > 0 ? `${token.balance.toFixed(2)} ${token.symbol}` : '0.00'}
                        </p>
                        <p className="text-sm text-gray-400">
                          ≈ ${(token.balance * token.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Import Token */}
          <Card className="border-dashed border-gray-600">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">Don't see a token?</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/import-token')}
                >
                  Import Token
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 