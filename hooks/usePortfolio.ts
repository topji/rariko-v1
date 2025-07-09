import { useState, useEffect } from 'react'
import { useDynamicWallet } from './useDynamicWallet'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import axios from 'axios'
import { Connection, PublicKey } from '@solana/web3.js'
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token'

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

// Stock token addresses
const STOCK_TOKEN_ADDRESSES = [
  'Xsc9qvGR1efVDFGLrVsmkzv3qi45LTBjeUKSPmx9qEh',
  'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN',
  'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg',
  'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp',
  'XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1',
  'Xs7ZdzSHLU9ftNJsii5fCeJhoRWSC32SQGzGQtePxNu',
  'Xsf9mBktVB9BSU5kf4nHxPq5hCBJ2j2ui3ecFGxPRGc',
  'Xsv9hRk1z5ystj9MhnA7Lq4vjSsLwzL2nxrwmwtD3re',
  'XsqE9cRRpzxcGKDXj1BJ7Xmg4GRhZoyY1KpmGSxAWT2',
  'Xsa62P5mvPszXL1krVUnU5ar38bBSVcWAB6fmPCo5Zu',
  'XsP7xzNPvEHS1m6qfanPUGjNmdnmsLKEoNAnHjdxxyZ',
  'Xs8S1uUs1zvS2p7iwtsG3b6fkhpvmwz4GYU3gWAmWHZ',
  'XsvNBAYkrDRNhA7wPHQfX3ZUXZyZLdnCQDfHZ56bzpg',
  'XsoCS1TfEyfFhfvj8EtZ528L3CaKBDBRqRapnBbDF2W',
  'XsDoVfqeBukxuZHWhdvWHBhgEHjGNst4MLodqsJHzoB'
]

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
    if (!isConnected || !walletAddress) {
      setPortfolioData(prev => ({ ...prev, isLoading: false, holdings: [] }))
      return
    }

    setPortfolioData(prev => ({ ...prev, isLoading: true }))

    try {
      const holdings: TokenHolding[] = []
      let totalValue = 0

      // For now, we'll show placeholder data until we fix the token balance fetching
      // TODO: Implement proper token balance fetching
      console.log('Portfolio: Token balance fetching temporarily disabled')

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

  // Process data when wallet changes
  useEffect(() => {
    if (!isLoadingTokens && isConnected) {
      processTokenBalances()
    }
  }, [tokenBalances, isLoadingTokens, isConnected, walletAddress])

  return {
    ...portfolioData,
    refreshPortfolio
  }
} 