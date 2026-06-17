'use client'

import { useMemo } from 'react'
import { useUserState } from '@/components/UserStateProvider'

import 'mdui/components/circular-progress.js'
import '@mdui/icons/warning-amber.js'

export default function SleepStatsCard() {
    const { user, sleepRanking, sleepRankingLoading } = useUserState()

    const stats = useMemo(() => {
        const mine = sleepRanking?.find((item) => item.id === user?.id)
        if (!mine) {
            return null
        }
        return {
            weekly_sleep_days: mine.weekly_sleep_days,
            monthly_sleep_days: mine.monthly_sleep_days,
            max_continuous_days: mine.max_continuous_days,
        }
    }, [sleepRanking, user?.id])

    return (
        <mdui-card className="sleepify-card">
            <h2 className="sleepify-card-title">睡眠统计</h2>
            {sleepRankingLoading ? (
                <div className="sleepify-card-loading">
                    <mdui-circular-progress />
                </div>
            ) : stats ? (
                <div className="sleepify-stats-grid">
                    <div className="sleepify-stats-item">
                        <div className="sleepify-stats-value">{stats.weekly_sleep_days}</div>
                        <div className="sleepify-stats-label">本周睡眠天数</div>
                    </div>
                    <div className="sleepify-stats-item">
                        <div className="sleepify-stats-value">{stats.monthly_sleep_days}</div>
                        <div className="sleepify-stats-label">本月睡眠天数</div>
                    </div>
                    <div className="sleepify-stats-item">
                        <div className="sleepify-stats-value">{stats.max_continuous_days}</div>
                        <div className="sleepify-stats-label">最大连续天数</div>
                    </div>
                </div>
            ) : (
                <div className="sleepify-card-sleep-status">
                    <mdui-icon-warning-amber />
                    暂未获取到睡眠统计。
                </div>
            )}
        </mdui-card>
    )
}
