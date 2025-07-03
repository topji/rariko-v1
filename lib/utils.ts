import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatUSDT(amount: number): string {
  return `${amount.toFixed(2)} USDT`
}

export function generateUsername(): string {
  const adjectives = ['swift', 'bright', 'clever', 'brave', 'calm', 'eager', 'fair', 'gentle', 'happy', 'kind']
  const nouns = ['fox', 'bear', 'wolf', 'eagle', 'lion', 'tiger', 'dragon', 'phoenix', 'unicorn', 'griffin']
  
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 999) + 1
  
  return `${adjective}${noun}${number}`
}

export function shortenAddress(address: string, chars: number = 6): string {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function generateWalletAddress(): string {
  const chars = '0123456789abcdef'
  let result = '0x'
  for (let i = 0; i < 40; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
} 