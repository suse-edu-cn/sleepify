'use client'

import type { ReactNode } from 'react'
import { UserStateProvider } from '@/components/UserStateProvider'

export default function AppProviders({ children }: { children: ReactNode }) {
    return <UserStateProvider>{children}</UserStateProvider>
}
