import { useState, useEffect } from 'react'
import { useDynamicWallet } from './useDynamicWallet'
import axios from 'axios'

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

// Known stock tokens mapping
const STOCK_TOKENS = {
  'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh': {
    symbol: 'STOCK',
    name: 'Stock Token',
    decimals: 9
  }
}

export function usePortfolio() {
  const { tokenBalances, isLoadingTokens, isConnected } = useDynamicWallet()
  const [portfolioData, setPortfolioData] = useState<PortfolioData>({
    totalValue: 0,
    totalChange: 0,
    totalChangePercent: 0,
    totalInvested: 0,
    holdings: [],
    isLoading: true
  })

  // Fetch token price from Jupiter
  const fetchTokenPrice = async (contractAddress: string): Promise<number> => {
    try {
      const response = await axios.get(`https://lite-api.jup.ag/price/v3?ids=${contractAddress}`)
      const data = response.data
      
      if (data && data[contractAddress]) {
        return parseFloat(data[contractAddress].usdPrice)
      }
      
      return 0
    } catch (error) {
      console.error(`Error fetching price for ${contractAddress}:`, error)
      return 0
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

  // Process token balances and fetch additional data
  const processTokenBalances = async () => {
    if (!tokenBalances || !isConnected) {
      setPortfolioData(prev => ({ ...prev, isLoading: false, holdings: [] }))
      return
    }

    setPortfolioData(prev => ({ ...prev, isLoading: true }))

    try {
      const holdings: TokenHolding[] = []
      let totalValue = 0

      // Process each token balance
      for (const token of tokenBalances) {
        // Skip SOL for now (we'll handle it separately)
        if (token.symbol === 'SOL') continue

        // Skip tokens with zero balance
        if (token.balance <= 0) continue

        // Get the mint address from the token
        const contractAddress = (token as any).mintAddress || (token as any).contractAddress
        if (!contractAddress) continue

        // Fetch price and metadata
        const [priceUsd, metadata] = await Promise.all([
          fetchTokenPrice(contractAddress),
          fetchTokenMetadata(contractAddress)
        ])

        // Calculate total value
        const totalValueForToken = token.balance * priceUsd

        const holding: TokenHolding = {
          symbol: metadata.symbol,
          name: metadata.name,
          contractAddress,
          balance: token.balance,
          balanceFormatted: token.balance.toFixed(2),
          priceUsd,
          totalValue: totalValueForToken,
          decimals: (token as any).decimals || 9,
          change24h: metadata.change24h
        }

        holdings.push(holding)
        totalValue += totalValueForToken
      }

      // Add SOL if it has a significant balance
      const solToken = tokenBalances.find(token => token.symbol === 'SOL')
      if (solToken && solToken.balance > 0.01) { // Only show if more than 0.01 SOL
        const solPrice = (solToken.marketValue || 0) / solToken.balance
        const solHolding: TokenHolding = {
          symbol: 'SOL',
          name: 'Solana',
          contractAddress: 'So11111111111111111111111111111111111111112',
          balance: solToken.balance,
          balanceFormatted: solToken.balance.toFixed(4),
          priceUsd: solPrice,
          totalValue: solToken.marketValue || 0,
          decimals: 9,
          change24h: 0 // We'll need to fetch this separately
        }
        holdings.push(solHolding)
        totalValue += (solToken.marketValue || 0)
      }

      // Sort holdings by total value (descending)
      holdings.sort((a, b) => b.totalValue - a.totalValue)

      // Calculate portfolio metrics
      const totalInvested = totalValue // For now, assume current value = invested value
      const totalChange = 0 // We don't have historical data yet
      const totalChangePercent = 0

      setPortfolioData({
        totalValue,
        totalChange,
        totalChangePercent,
        totalInvested,
        holdings,
        isLoading: false
      })

    } catch (error) {
      console.error('Error processing portfolio data:', error)
      setPortfolioData(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load portfolio data'
      }))
    }
  }

  // Refresh portfolio data
  const refreshPortfolio = () => {
    processTokenBalances()
  }

  // Process data when token balances change
  useEffect(() => {
    if (!isLoadingTokens) {
      processTokenBalances()
    }
  }, [tokenBalances, isLoadingTokens, isConnected])

  return {
    ...portfolioData,
    refreshPortfolio
  }
} 