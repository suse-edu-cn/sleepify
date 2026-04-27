'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import '../styles/ranking.css'
import { alert } from 'mdui/functions/alert.js'
import { requestApi } from '@/lib/request/client'
import { useUserState } from '@/components/UserStateProvider'

type RankingType = 'sleep' | 'points'

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
    const { user } = useUserState()
    const [rankingType, setRankingType] = useState<RankingType>('sleep')
    const [sleepRanking, setSleepRanking] = useState<SleepRankingItem[]>([])
    const [pointsRanking, setPointsRanking] = useState<PointsRankingItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchRanking = useCallback(async (type: RankingType, clearBeforeLoad = true) => {
        if (clearBeforeLoad) {
            if (type === 'sleep') {
                setSleepRanking([])
            } else {
                setPointsRanking([])
            }
        }

        setLoading(true)

        try {
            if (type === 'sleep') {
                const data = await requestApi<SleepRankingItem[]>({
                    url: '/ranking/sleep',
                    method: 'GET',
                })
                setSleepRanking(data)
                return
            }

            const data = await requestApi<PointsRankingItem[]>({
                url: '/ranking/points',
                method: 'GET',
            })
            setPointsRanking(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const run = async () => {
            await Promise.allSettled([fetchRanking(rankingType, false)])
        }

        void run()
    }, [fetchRanking, rankingType])

    const rankingRows = useMemo(() => {
        if (rankingType === 'sleep') {
            return sleepRanking
        }

        return pointsRanking
    }, [pointsRanking, rankingType, sleepRanking])

    return (
        <section className="sleepify-page">
            <h1 className="sleepify-ranking-title">排行榜</h1>

            <div className="sleepify-ranking-tools">
                <div className="sleepify-ranking-switch">
                    <mdui-button
                        variant={rankingType === 'sleep' ? 'filled' : 'outlined'}
                        onClick={() => {
                            if (rankingType !== 'sleep') {
                                setRankingType('sleep')
                            }
                        }}
                    >
                        睡眠
                    </mdui-button>
                    <mdui-button
                        variant={rankingType === 'points' ? 'filled' : 'outlined'}
                        onClick={() => {
                            if (rankingType !== 'points') {
                                setRankingType('points')
                            }
                        }}
                    >
                        积分
                    </mdui-button>
                </div>

                <mdui-button
                    icon="refresh"
                    variant="outlined"
                    loading={loading}
                    disabled={loading}
                    onClick={() => {
                        void fetchRanking(rankingType, true)
                    }}
                >
                    刷新
                </mdui-button>
            </div>

            {loading ? (
                <mdui-circular-progress></mdui-circular-progress>
            ) : rankingRows.length > 0 ? (
                <div className="sleepify-ranking-list">
                    {rankingRows.map((item, index) => {
                        const isCurrentUser = item.id === user?.id
                        const displayValue =
                            rankingType === 'sleep'
                                ? `${(item as SleepRankingItem).weekly_sleep_days} 天`
                                : `${(item as PointsRankingItem).points}`

                        const onCardClick = async () => {
                            if (rankingType !== 'sleep') {
                                return
                            }

                            const sleepItem = item as SleepRankingItem

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
