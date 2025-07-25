import { useState, useEffect, useCallback, useRef } from 'react'
import { useDynamicWallet } from './useDynamicWallet'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import axios from 'axios'
import { orderApi } from '../lib/api'

interface TokenHolding {
  symbol: string
  name: string
  contractAddress: string
  balance: number
  balanceFormatted: string
  priceUsd: number
  totalValue: number
  decimals: number
  change24h?: number
  averageBuyPrice: number
  unrealizedPnL: number
  unrealizedPnLPercent: number
  totalBought: number
  totalBoughtValue: number
  totalRealizedPnL: number
}

interface PortfolioData {
  totalValue: number
  totalChange: number
  totalChangePercent: number
  totalInvested: number
  holdings: TokenHolding[]
  isLoading: boolean
  error?: string
}

export function usePortfolio() {
  const { tokenBalances, isLoadingTokens, isConnected, walletAddress } = useDynamicWallet()
  const { primaryWallet } = useDynamicContext()
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    totalInvested: 0,
    holdings: [],
    isLoading: true
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const hasLoadedRef = useRef(false)
  const currentWalletRef = useRef<string | null>(null)

  // Fetch current token prices from Jupiter
  const fetchTokenPrices = async (contractAddresses: string[]): Promise<{ [key: string]: number }> => {
    try {
      const response = await axios.get(`https://lite-api.jup.ag/price/v3?ids=${contractAddresses.join(',')}`)
      const data = response.data
      
      const prices: { [key: string]: number } = {}
      contractAddresses.forEach(address => {
        if (data && data[address]) {
          prices[address] = parseFloat(data[address].usdPrice)
        } else {
          prices[address] = 0
        }
      })
      
      return prices
    } catch (error) {
      console.error('Error fetching token prices:', error)
      return {}
    }
  }

  // Fetch token metadata from DexScreener
  const fetchTokenMetadata = async (contractAddress: string) => {
    try {
      const response = await axios.get(`https://api.dexscreener.com/tokens/v1/solana/${contractAddress}`)
      const data = response.data
      
      if (data && data.length > 0) {
        const tokenData = data[0]
        return {
          symbol: tokenData.baseToken?.symbol || 'TOKEN',
          name: tokenData.baseToken?.name || 'Token',
          change24h: tokenData.priceChange?.h24 || 0
        }
      }
      
      return {
        symbol: 'TOKEN',
        name: 'Token',
        change24h: 0
      }
    } catch (error) {
      console.error(`Error fetching metadata for ${contractAddress}:`, error)
      return {
        symbol: 'TOKEN',
        name: 'Token',
        change24h: 0
      }
    }
  }

  // Process holdings from backend and calculate unrealized PnL
  const processHoldings = async () => {
    if (!isConnected || !walletAddress || isProcessing) {
      if (!isConnected || !walletAddress) {
        setPortfolioData(prev => ({ ...prev, isLoading: false, holdings: [] }))
      }
      return
    }

    // Check if we've already loaded data for this wallet
    if (hasLoadedRef.current && currentWalletRef.current === walletAddress) {
      return
    }

    setIsProcessing(true)
    setPortfolioData(prev => ({ ...prev, isLoading: true }))

    try {
      // Fetch holdings from backend
      const holdingsResponse = await orderApi.getUserHoldings(walletAddress)
      const backendHoldings = holdingsResponse.holdings || []

      if (backendHoldings.length === 0) {
        setPortfolioData({
          totalValue: 0,
          totalChange: 0,
          totalChangePercent: 0,
          totalInvested: 0,
          holdings: [],
          isLoading: false
        })
        return
      }

      // Get current prices for all holdings
      const contractAddresses = backendHoldings.map((h: any) => h.tokenAddress)
      const currentPrices = await fetchTokenPrices(contractAddresses)

      // Process each holding
      const holdings: TokenHolding[] = []
      let totalValue = 0
      let totalInvested = 0
      let totalUnrealizedPnL = 0

      for (const holding of backendHoldings) {
        const currentPrice = currentPrices[holding.tokenAddress] || 0
        
        // Fetch metadata for display
        const metadata = await fetchTokenMetadata(holding.tokenAddress)
        
        // Calculate unrealized PnL
        const currentValue = holding.currentHoldings * currentPrice
        const unrealizedPnL = currentValue - (holding.currentHoldings * holding.averageBuyPrice)
        const unrealizedPnLPercent = holding.averageBuyPrice > 0 
          ? ((currentPrice - holding.averageBuyPrice) / holding.averageBuyPrice) * 100 
          : 0

        const tokenHolding: TokenHolding = {
          symbol: metadata.symbol,
          name: metadata.name,
          contractAddress: holding.tokenAddress,
          balance: holding.currentHoldings,
          balanceFormatted: holding.currentHoldings.toFixed(6),
          priceUsd: currentPrice,
          totalValue: currentValue,
          decimals: 9, // Default for most tokens
          change24h: metadata.change24h,
          averageBuyPrice: holding.averageBuyPrice,
          unrealizedPnL,
          unrealizedPnLPercent,
          totalBought: holding.totalBought,
          totalBoughtValue: holding.totalBoughtValue,
          totalRealizedPnL: holding.totalRealizedPnL
        }

        holdings.push(tokenHolding)
        totalValue += currentValue
        totalInvested += holding.totalBoughtValue
        totalUnrealizedPnL += unrealizedPnL
      }

      // Sort holdings by total value (descending)
      holdings.sort((a, b) => b.totalValue - a.totalValue)

      // Calculate portfolio metrics
      const totalChange = totalUnrealizedPnL
      const totalChangePercent = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0

      setPortfolioData({
        totalValue,
        totalChange,
        totalChangePercent,
        totalInvested,
        holdings,
        isLoading: false
      })

      // Mark as loaded for this wallet
      hasLoadedRef.current = true
      currentWalletRef.current = walletAddress

    } catch (error) {
      console.error('Error processing portfolio data:', error)
      setPortfolioData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load portfolio data'
      }))
    } finally {
      setIsProcessing(false)
    }
  }

  // Refresh portfolio data
  const refreshPortfolio = () => {
    hasLoadedRef.current = false
    currentWalletRef.current = null
    processHoldings()
  }

  // Process data when wallet changes
  useEffect(() => {
    if (!isLoadingTokens && isConnected && walletAddress) {
      processHoldings()
    }
  }, [isLoadingTokens, isConnected, walletAddress])

  return {
    ...portfolioData,
    refreshPortfolio
  }
} 