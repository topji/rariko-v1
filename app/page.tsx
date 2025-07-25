'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to stocks page on app load
    router.replace('/stocks')
  }, [router])

  return null
} 