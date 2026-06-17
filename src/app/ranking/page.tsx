'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import '../styles/ranking.css'
import { alert } from 'mdui/functions/alert.js'
import { useUserState } from '@/components/UserStateProvider'

type RankingType = 'sleep' | 'points'

function formatTime(value: string) {
    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    return date.toLocaleString('zh-CN', {
        hour12: false,
    })
}

export default function RankingPage() {
    const {
        user,
        sleepRanking,
        sleepRankingLoading,
        refreshSleepRanking,
        pointsRanking,
        pointsRankingLoading,
        refreshPointsRanking,
    } = useUserState()
    const [rankingType, setRankingType] = useState<RankingType>('sleep')
    const tabsRef = useRef<HTMLElement | null>(null)

    useEffect(() => {
        const el = tabsRef.current
        if (!el) return

        const handleChange = () => {
            const value = (el as { value?: string }).value
            if (value === 'sleep' || value === 'points') {
                setRankingType(value)
            }
        }

        el.addEventListener('change', handleChange)
        return () => el.removeEventListener('change', handleChange)
    }, [])

    const loading = rankingType === 'sleep' ? sleepRankingLoading : pointsRankingLoading

    const rankingRows = useMemo(() => {
        if (rankingType === 'sleep') {
            return sleepRanking ?? []
        }

        return pointsRanking ?? []
    }, [pointsRanking, rankingType, sleepRanking])

    return (
        <section className="sleepify-page">

            <div className="sleepify-ranking-tools">
                <mdui-tabs
                    ref={tabsRef}
                    value="sleep"
                    variant="secondary"
                    full-width
                    className="sleepify-ranking-tabs">
                    <mdui-tab value="sleep">周睡眠</mdui-tab>
                    <mdui-tab value="points">积分</mdui-tab>
                </mdui-tabs>

                <mdui-button
                    icon="refresh"
                    variant="outlined"
                    loading={loading}
                    disabled={loading}
                    onClick={() => {
                        if (rankingType === 'sleep') {
                            void refreshSleepRanking({ clearBeforeLoad: true })
                        } else {
                            void refreshPointsRanking({ clearBeforeLoad: true })
                        }
                    }}
                >
                    刷新
                </mdui-button>
            </div>

            {loading ? (
                <mdui-circular-progress />
            ) : rankingRows.length > 0 ? (
                <div className="sleepify-ranking-list">
                    {rankingRows.map((item, index) => {
                        const isCurrentUser = item.id === user?.id
                        const displayValue =
                            rankingType === 'sleep'
                                ? `${(item as { weekly_sleep_days: number }).weekly_sleep_days} 天`
                                : `${(item as { points: number }).points}`

                        const onCardClick = async () => {
                            if (rankingType !== 'sleep') {
                                return
                            }

                            const sleepItem = item as {
                                name: string
                                monthly_sleep_days: number
                                max_continuous_days: number
                                last_sleep: string
                            }

                            await alert({
                                headline: `${sleepItem.name} 的睡眠详情`,
                                description: `本月睡眠天数：${sleepItem.monthly_sleep_days}\n连续睡眠天数：${sleepItem.max_continuous_days}\n上次睡眠时间：${formatTime(sleepItem.last_sleep)}`,
                                confirmText: '知道了',
                                closeOnOverlayClick: true,
                            })
                        }

                        return (
                            <mdui-card
                                key={item.id}
                                clickable
                                className={`sleepify-ranking-item${rankingType === 'sleep' ? ' sleepify-ranking-item-clickable' : ''}${isCurrentUser ? ' sleepify-ranking-item-self' : ''}`}
                                onClick={() => {
                                    void onCardClick()
                                }}
                            >
                                <div className="sleepify-ranking-rank">#{index + 1}</div>

                                <div className="sleepify-ranking-name">
                                    <div className="sleepify-ranking-headline">{item.name}</div>
                                    <div className="sleepify-ranking-description">
                                        {item.class_name}
                                    </div>
                                </div>

                                <div className="sleepify-ranking-value">{displayValue}</div>
                            </mdui-card>
                        )
                    })}
                </div>
            ) : (
                <div className="sleepify-ranking-empty">暂无排行榜数据</div>
            )}
        </section>
    )
}
