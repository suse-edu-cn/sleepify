'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { requestApi } from '@/lib/request/client'

type Challenge = {
    id: number
    name: string
    description: string
    is_onetime: boolean
    points: number
    duration: number
    end_time: string | null
    status: string
}

const STATUS_LABEL: Record<string, string> = {
    active: '可报名',
    closed: '已关闭',
    progressing: '进行中',
    expired: '已截止',
}

function formatEndTime(value: string | null) {
    if (!value) {
        return '无截止时间'
    }

    const date = new Date(value)

    if (Number.isNaN(date.getTime())) {
        return value
    }

    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')

    return `${y}-${m}-${d} ${h}:${min}`
}

export default function ChallengesList() {
    const router = useRouter()
    const [challenges, setChallenges] = useState<Challenge[]>([])
    const [loading, setLoading] = useState(true)

    const fetchChallenges = useCallback(async () => {
        setLoading(true)

        try {
            const data = await requestApi<Challenge[]>({
                url: '/points/challenges',
                method: 'GET',
            })

            setChallenges(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void fetchChallenges()
    }, [fetchChallenges])

    return (
        <section className="sleepify-page">
            <h1 className="sleepify-challenges-title">所有挑战</h1>

            {loading ? (
                <mdui-circular-progress />
            ) : challenges.length > 0 ? (
                <div className="sleepify-challenges-list">
                    {challenges.map((item) => (
                        <mdui-card
                            key={item.id}
                            className="sleepify-card sleepify-challenges-item"
                            clickable={item.status !== 'expired' && item.status !== 'closed'}
                            disabled={item.status === 'expired' || item.status === 'closed'}
                            onClick={() => {
                                if (item.status !== 'expired' && item.status !== 'closed') {
                                    router.push(`/challenges/${item.id}`)
                                }
                            }}
                        >
                            <div className="sleepify-challenges-header">
                                <div className="sleepify-challenges-name">{item.name}</div>
                                <div className={`sleepify-challenges-status sleepify-challenges-status-${item.status}`}>
                                    {STATUS_LABEL[item.status] ?? item.status}
                                </div>
                            </div>
                            <div className="sleepify-challenges-description">
                                {item.description}
                            </div>
                            <div className="sleepify-challenges-meta">
                                {item.is_onetime ? (
                                    <span className="sleepify-challenges-tag">一次性</span>
                                ) : (
                                    item.duration > 0 && (
                                        <span className="sleepify-challenges-tag">
                                            {item.duration} 天
                                        </span>
                                    )
                                )}
                                <span className="sleepify-challenges-tag">
                                    +{item.points} 积分
                                </span>
                            </div>
                            <div className="sleepify-challenges-end">
                                截止时间：{formatEndTime(item.end_time)}
                            </div>
                        </mdui-card>
                    ))}
                </div>
            ) : (
                <div className="sleepify-points-empty">暂无挑战</div>
            )}
        </section>
    )
}
