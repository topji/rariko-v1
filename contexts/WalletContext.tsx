'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { Wallet, Transaction, WalletState } from '../types'
import { generateWalletAddress } from '../lib/utils'

type WalletAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_WALLET'; payload: Wallet | null }
  | { type: 'UPDATE_BALANCE'; payload: number }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'SET_ERROR'; payload: string | null }

const initialState: WalletState = {
  wallet: null,
  isLoading: true,
  error: null,
}

function walletReducer(state: WalletState, action: WalletAction): WalletState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_WALLET':
      return {
        ...state,
        wallet: action.payload,
        isLoading: false,
        error: null,
      }
    case 'UPDATE_BALANCE':
      return {
        ...state,
        wallet: state.wallet
          ? { ...state.wallet, balance: action.payload }
          : null,
      }
    case 'ADD_TRANSACTION':
      return {
        ...state,
        wallet: state.wallet
          ? {
              ...state.wallet,
              transactions: [action.payload, ...state.wallet.transactions],
            }
          : null,
      }
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false }
    default:
      return state
  }
}

interface WalletContextType extends WalletState {
  initializeWallet: (address?: string) => void
  updateBalance: (balance: number) => void
  addTransaction: (transaction: Transaction) => void
  sendTransaction: (to: string, amount: number, note?: string) => Promise<void>
  clearError: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(walletReducer, initialState)

  const initializeWallet = (address?: string) => {
    const walletAddress = address || generateWalletAddress()
    const wallet: Wallet = {
      address: walletAddress,
      balance: 0,
      currency: 'USDT',
      transactions: [],
    }
    dispatch({ type: 'SET_WALLET', payload: wallet })
    
    // Store wallet data in localStorage
    localStorage.setItem('rariko_wallet', JSON.stringify(wallet))
  }

  const updateBalance = (balance: number) => {
    dispatch({ type: 'UPDATE_BALANCE', payload: balance })
    
    // Update localStorage
    if (state.wallet) {
      const updatedWallet = { ...state.wallet, balance }
      localStorage.setItem('rariko_wallet', JSON.stringify(updatedWallet))
    }
  }

  const addTransaction = (transaction: Transaction) => {
    dispatch({ type: 'ADD_TRANSACTION', payload: transaction })
    
    // Update localStorage
    if (state.wallet) {
      const updatedWallet = {
        ...state.wallet,
        transactions: [transaction, ...state.wallet.transactions],
      }
      localStorage.setItem('rariko_wallet', JSON.stringify(updatedWallet))
    }
  }

  const sendTransaction = async (to: string, amount: number, note?: string) => {
    if (!state.wallet) {
      dispatch({ type: 'SET_ERROR', payload: 'Wallet not initialized' })
      return
    }

    if (amount > state.wallet.balance) {
      dispatch({ type: 'SET_ERROR', payload: 'Insufficient balance' })
      return
    }

    const transaction: Transaction = {
      id: Date.now().toString(),
      type: 'send',
      amount,
      currency: 'USDT',
      from: state.wallet.address,
      to,
      status: 'pending',
      timestamp: new Date(),
      note,
    }

    // Simulate transaction processing
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update transaction status
      const completedTransaction = { ...transaction, status: 'completed' as const }
      addTransaction(completedTransaction)
      
      // Update balance
      const newBalance = state.wallet.balance - amount
      updateBalance(newBalance)
      
      dispatch({ type: 'SET_LOADING', payload: false })
    } catch (error) {
      const failedTransaction = { ...transaction, status: 'failed' as const }
      addTransaction(failedTransaction)
      dispatch({ type: 'SET_ERROR', payload: 'Transaction failed' })
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null })
  }

  useEffect(() => {
    // Load wallet data from localStorage on app load
    const savedWallet = localStorage.getItem('rariko_wallet')
    if (savedWallet) {
      try {
        const wallet = JSON.parse(savedWallet)
        dispatch({ type: 'SET_WALLET', payload: wallet })
      } catch (error) {
        console.error('Error parsing saved wallet:', error)
        localStorage.removeItem('rariko_wallet')
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const value: WalletContextType = {
    ...state,
    initializeWallet,
    updateBalance,
    addTransaction,
    sendTransaction,
    clearError,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
} 