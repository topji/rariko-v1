import { useState, useEffect, useCallback, useRef } from 'react'
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
  const [isProcessing, setIsProcessing] = useState(false)
  const hasLoadedRef = useRef(false)
  const currentWalletRef = useRef<string | null>(null)

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
      // Fetch token balances from Jupiter API
      const response = await axios.get(`https://lite-api.jup.ag/ultra/v1/balances/${walletAddress}`)
      const balances = response.data

      const holdings: TokenHolding[] = []
      let totalValue = 0

      // Process each token balance
      for (const [contractAddress, balanceData] of Object.entries(balances)) {
        // Skip SOL for now (we'll handle it separately if needed)
        if (contractAddress === 'SOL') continue

        // Check if this is one of our stock tokens
        if (STOCK_TOKEN_ADDRESSES.includes(contractAddress)) {
          const balance = balanceData as any
          const uiAmount = balance.uiAmount || 0

          // Only include tokens with non-zero balance
          if (uiAmount > 0) {
            // Fetch token price and metadata
            const [price, metadata] = await Promise.all([
              fetchTokenPrice(contractAddress),
              fetchTokenMetadata(contractAddress)
            ])

            const tokenValue = uiAmount * price

            holdings.push({
              symbol: metadata.symbol,
              name: metadata.name,
              contractAddress,
              balance: uiAmount,
              balanceFormatted: uiAmount.toFixed(6),
              priceUsd: price,
              totalValue: tokenValue,
              decimals: 9, // Most Solana tokens use 9 decimals
              change24h: metadata.change24h
            })

            totalValue += tokenValue
          }
        }
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
    processTokenBalances()
  }

  // Process data when wallet changes
  useEffect(() => {
    if (!isLoadingTokens && isConnected && walletAddress) {
      processTokenBalances()
    }
  }, [isLoadingTokens, isConnected, walletAddress])

  return {
    ...portfolioData,
    refreshPortfolio
  }
} 