export interface User {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  walletAddress: string
  createdAt: Date
  updatedAt: Date
}

export interface Wallet {
  address: string
  balance: number
  currency: 'USDT'
  transactions: Transaction[]
}

export interface Transaction {
  id: string
  type: 'send' | 'receive' | 'swap'
  amount: number
  currency: string
  from: string
  to: string
  status: 'pending' | 'completed' | 'failed'
  timestamp: Date
  hash?: string
  note?: string
  fee?: number
}

export interface Invoice {
  id: string
  amount: number
  currency: string
  description: string
  dueDate: Date
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  payer?: string
  createdAt: Date
  paidAt?: Date
}

export interface TipWidget {
  id: string
  amount: number
  label: string
  description?: string
  link: string
  embedCode: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface WalletState {
  wallet: Wallet | null
  isLoading: boolean
  error: string | null
}

export type NavigationItem = {
  id: string
  label: string
  icon: string
  href: string
  badge?: number
}

export type Currency = 'USD' | 'INR' | 'EUR' | 'GBP'

export interface SwapQuote {
  fromToken: string
  toToken: string
  fromAmount: number
  toAmount: number
  rate: number
  fee: number
  estimatedTime: number
} 