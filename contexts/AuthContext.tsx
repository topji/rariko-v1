'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { User, AuthState } from '../types'

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: Partial<User> }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
    default:
      return state
  }
}

interface AuthContextType extends AuthState {
  login: (user: User) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = (user: User) => {
    dispatch({ type: 'SET_USER', payload: user })
    // Store user data in localStorage for persistence
    localStorage.setItem('rizz.money_user', JSON.stringify(user))
  }

  const logout = () => {
    dispatch({ type: 'LOGOUT' })
    localStorage.removeItem('rizz.money_user')
  }

  const updateUser = (updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: updates })
    // Update localStorage
    const currentUser = state.user
    if (currentUser) {
      const updatedUser = { ...currentUser, ...updates }
      localStorage.setItem('rizz.money_user', JSON.stringify(updatedUser))
    }
  }

  useEffect(() => {
    // Check for existing user session on app load
    const savedUser = localStorage.getItem('rizz.money_user')
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch({ type: 'SET_USER', payload: user })
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('rizz.money_user')
      }
    } else {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 