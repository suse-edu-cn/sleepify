'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { requestApi } from '@/lib/request/client'
import type { SleepStatusData } from '@/lib/sleep/types'
import type { UserInfo } from '@/lib/user/types'

type RefreshUserOptions = {
    clearBeforeLoad?: boolean
}

type UserStateContextValue = {
    user: UserInfo | null
    userLoading: boolean
    refreshUser: (options?: RefreshUserOptions) => Promise<UserInfo | null>
    sleepStatus: SleepStatusData | null
    sleepLoading: boolean
    refreshSleepStatus: (options?: RefreshUserOptions) => Promise<SleepStatusData | null>
    updateSleepStatus: (value: SleepStatusData | null) => void
    clearUser: () => void
}

const UserStateContext = createContext<UserStateContextValue | null>(null)

export function UserStateProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const [user, setUser] = useState<UserInfo | null>(null)
    const [userLoading, setUserLoading] = useState(false)
    const [sleepStatus, setSleepStatus] = useState<SleepStatusData | null>(null)
    const [sleepLoading, setSleepLoading] = useState(false)

    const refreshUser = useCallback(async (options?: RefreshUserOptions) => {
        const clearBeforeLoad = options?.clearBeforeLoad ?? true

        if (clearBeforeLoad) {
            setUser(null)
        }

        setUserLoading(true)

        try {
            const data = await requestApi<UserInfo>({
                url: '/info',
                method: 'GET',
            })

            setUser(data)
            return data
        } catch {
            return null
        } finally {
            setUserLoading(false)
        }
    }, [])

    const refreshSleepStatus = useCallback(async (options?: RefreshUserOptions) => {
        const clearBeforeLoad = options?.clearBeforeLoad ?? true

        if (clearBeforeLoad) {
            setSleepStatus(null)
        }

        setSleepLoading(true)

        try {
            const data = await requestApi<SleepStatusData>({
                url: '/sleep/status',
                method: 'GET',
            })

            setSleepStatus(data)
            return data
        } catch {
            return null
        } finally {
            setSleepLoading(false)
        }
    }, [])

    const updateSleepStatus = useCallback((value: SleepStatusData | null) => {
        setSleepStatus(value)
    }, [])

    const clearUser = useCallback(() => {
        setUser(null)
        setUserLoading(false)
        setSleepStatus(null)
        setSleepLoading(false)
    }, [])

    useEffect(() => {
        if (pathname === '/sign' || (user && sleepStatus)) {
            return
        }

        const run = async () => {
            const tasks = []

            if (!user) {
                tasks.push(refreshUser({ clearBeforeLoad: false }))
            }

            if (!sleepStatus) {
                tasks.push(refreshSleepStatus({ clearBeforeLoad: false }))
            }

            await Promise.allSettled(tasks)
        }

        void run()
    }, [pathname, refreshUser, refreshSleepStatus, sleepStatus, user])

    const value = useMemo(
        () => ({
            user,
            userLoading,
            refreshUser,
            sleepStatus,
            sleepLoading,
            refreshSleepStatus,
            updateSleepStatus,
            clearUser,
        }),
        [
            user,
            userLoading,
            refreshUser,
            sleepStatus,
            sleepLoading,
            refreshSleepStatus,
            updateSleepStatus,
            clearUser,
        ]
    )

    return <UserStateContext.Provider value={value}>{children}</UserStateContext.Provider>
}

export function useUserState() {
    const context = useContext(UserStateContext)

    if (!context) {
        throw new Error('useUserState 必须在 UserStateProvider 中使用')
    }

    return context
}
