'use client'

import React, { useEffect } from 'react'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { useRouter } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { primaryWallet } = useDynamicContext()
  const router = useRouter()

  useEffect(() => {
    if (!primaryWallet?.address) {
      // Redirect to home page where WalletCheck will handle the flow
      router.push('/')
    }
  }, [primaryWallet?.address, router])

  if (!primaryWallet?.address) {
    return null
  }

  return <>{children}</>
} 