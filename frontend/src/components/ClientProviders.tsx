'use client'

import { ErrorBoundary } from './ErrorBoundary'
import { UserProvider } from '@/context/UserContext'

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <UserProvider>
        {children}
      </UserProvider>
    </ErrorBoundary>
  )
}
