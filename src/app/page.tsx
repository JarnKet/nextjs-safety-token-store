'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useProfile } from '@/hooks/auth-hooks'

export default function HomeSimplified() {
  const { data: user, isLoading } = useProfile()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.replace('/dashboard')
      } else {
        router.replace('/login')
      }
    }
  }, [user, isLoading, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">
          {isLoading ? 'Loading...' : 'Redirecting...'}
        </p>
      </div>
    </div>
  )
}
