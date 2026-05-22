'use client'

import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { snackbar } from 'mdui/functions/snackbar.js'
import { requestApi } from '@/lib/request/client'
import { ApiRequestError } from '@/lib/request/types'
import type { SleepStatusData } from '@/lib/sleep/types'
import type { UserInfo } from '@/lib/user/types'

type RefreshOptions = {
    clearBeforeLoad?: boolean
}

type CurrentChallenge = {
    id: number
    name: string
    is_onetime: boolean
    points: number
    duration: number
    start_date: string
    end_date: string | null
    completed_date: string | null
    status: string
}

type SleepRankingItem = {
    id: string
    name: string
    class_name: string
    weekly_sleep_days: number
    monthly_sleep_days: number
    max_continuous_days: number
    last_sleep: string
}

type PointsRankingItem = {
    id: string
    name: string
    class_name: string
    points: number
}

type UserStateContextValue = {
    user: UserInfo | null
    userLoading: boolean
    refreshUser: (options?: RefreshOptions) => Promise<UserInfo | null>
    sleepStatus: SleepStatusData | null
    sleepLoading: boolean
    refreshSleepStatus: (options?: RefreshOptions) => Promise<SleepStatusData | null>
    updateSleepStatus: (value: SleepStatusData | null) => void
    sleepRanking: SleepRankingItem[] | null
    sleepRankingLoading: boolean
    refreshSleepRanking: (options?: RefreshOptions) => Promise<SleepRankingItem[] | null>
    pointsRanking: PointsRankingItem[] | null
    pointsRankingLoading: boolean
    refreshPointsRanking: (options?: RefreshOptions) => Promise<PointsRankingItem[] | null>
    challenges: CurrentChallenge[] | null
    challengesLoading: boolean
    refreshChallenges: (options?: RefreshOptions) => Promise<CurrentChallenge[] | null>
    clearUser: () => void
}

const UserStateContext = createContext<UserStateContextValue | null>(null)

export function UserStateProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const [user, setUser] = useState<UserInfo | null>(null)
    const [userLoading, setUserLoading] = useState(false)
    const [sleepStatus, setSleepStatus] = useState<SleepStatusData | null>(null)
    const [sleepLoading, setSleepLoading] = useState(false)
    const [sleepRanking, setSleepRanking] = useState<SleepRankingItem[] | null>(null)
    const [sleepRankingLoading, setSleepRankingLoading] = useState(false)
    const [pointsRanking, setPointsRanking] = useState<PointsRankingItem[] | null>(null)
    const [pointsRankingLoading, setPointsRankingLoading] = useState(false)
    const [challenges, setChallenges] = useState<CurrentChallenge[] | null>(null)
    const [challengesLoading, setChallengesLoading] = useState(false)

    const refreshUser = useCallback(async (options?: RefreshOptions) => {
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
        } catch (error) {
            if (error instanceof ApiRequestError) {
                if (error.code === 1002) {
                    snackbar({
                        message: '登录状态失效，请重新登录',
                        closeable: true,
                        placement: 'top',
                    })
                }

                if (error.code === 1001 || error.code === 1002) {
                    await fetch('/v1/sign/out', { method: 'POST' }).catch(() => {})
                    window.location.replace('/sign')
                }
            }

            return null
        } finally {
            setUserLoading(false)
        }
    }, [])

    const refreshSleepStatus = useCallback(async (options?: RefreshOptions) => {
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

    const refreshSleepRanking = useCallback(async (options?: RefreshOptions) => {
        const clearBeforeLoad = options?.clearBeforeLoad ?? true

        if (clearBeforeLoad) {
            setSleepRanking(null)
        }

        setSleepRankingLoading(true)

        try {
            const data = await requestApi<SleepRankingItem[]>({
                url: '/sleep/ranking',
                method: 'GET',
            })

            setSleepRanking(data)
            return data
        } catch {
            return null
        } finally {
            setSleepRankingLoading(false)
        }
    }, [])

    const refreshPointsRanking = useCallback(async (options?: RefreshOptions) => {
        const clearBeforeLoad = options?.clearBeforeLoad ?? true

        if (clearBeforeLoad) {
            setPointsRanking(null)
        }

        setPointsRankingLoading(true)

        try {
            const data = await requestApi<PointsRankingItem[]>({
                url: '/points/ranking',
                method: 'GET',
            })

            setPointsRanking(data)
            return data
        } catch {
            return null
        } finally {
            setPointsRankingLoading(false)
        }
    }, [])

    const refreshChallenges = useCallback(async (options?: RefreshOptions) => {
        const clearBeforeLoad = options?.clearBeforeLoad ?? true

        if (clearBeforeLoad) {
            setChallenges(null)
        }

        setChallengesLoading(true)

        try {
            const data = await requestApi<CurrentChallenge[]>({
                url: '/points/challenges/current',
                method: 'GET',
            })

            setChallenges(data)
            return data
        } catch {
            return null
        } finally {
            setChallengesLoading(false)
        }
    }, [])

    const clearUser = useCallback(() => {
        setUser(null)
        setUserLoading(false)
        setSleepStatus(null)
        setSleepLoading(false)
        setSleepRanking(null)
        setSleepRankingLoading(false)
        setPointsRanking(null)
        setPointsRankingLoading(false)
        setChallenges(null)
        setChallengesLoading(false)
    }, [])

    useEffect(() => {
        if (pathname === '/sign' || (user && sleepStatus && sleepRanking && pointsRanking && challenges)) {
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

            if (!sleepRanking) {
                tasks.push(refreshSleepRanking({ clearBeforeLoad: false }))
            }

            if (!pointsRanking) {
                tasks.push(refreshPointsRanking({ clearBeforeLoad: false }))
            }

            if (!challenges) {
                tasks.push(refreshChallenges({ clearBeforeLoad: false }))
            }

            await Promise.allSettled(tasks)
        }

        void run()
    }, [challenges, pathname, refreshChallenges, refreshPointsRanking, refreshSleepRanking, refreshUser, refreshSleepStatus, pointsRanking, sleepRanking, sleepStatus, user])

    const value = useMemo(
        () => ({
            user,
            userLoading,
            refreshUser,
            sleepStatus,
            sleepLoading,
            refreshSleepStatus,
            updateSleepStatus,
            sleepRanking,
            sleepRankingLoading,
            refreshSleepRanking,
            pointsRanking,
            pointsRankingLoading,
            refreshPointsRanking,
            challenges,
            challengesLoading,
            refreshChallenges,
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
            sleepRanking,
            sleepRankingLoading,
            refreshSleepRanking,
            pointsRanking,
            pointsRankingLoading,
            refreshPointsRanking,
            challenges,
            challengesLoading,
            refreshChallenges,
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
