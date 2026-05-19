'use client'

import { useCallback, useEffect, useState } from 'react'
import { requestApi } from '@/lib/request/client'

type PointsHistoryItem = {
    change: number
    reason: string
    operator: string
    record_date: string
}

export default function PointsHistory() {
    const [history, setHistory] = useState<PointsHistoryItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchHistory = useCallback(async () => {
        setLoading(true)

        try {
            const data = await requestApi<PointsHistoryItem[]>({
                url: '/points/history',
                method: 'GET',
            })

            setHistory(data)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        void fetchHistory()
    }, [fetchHistory])

    return (
        <section className="sleepify-page">
            <h1 className="sleepify-points-history-title">积分历史</h1>

            {loading ? (
                <mdui-circular-progress />
            ) : history.length > 0 ? (
                <div className="sleepify-points-history-list">
                    {history.map((item, index) => (
                        <mdui-card
                            key={`${item.record_date}-${index}`}
                            className="sleepify-card sleepify-points-history-item"
                            clickable
                        >
                            <div className="sleepify-points-history-header">
                                <div className="sleepify-points-history-reason">
                                    {item.reason}
                                </div>
                                <div
                                    className={`sleepify-points-history-change${item.change > 0 ? ' sleepify-points-history-change-positive' : ''}`}
                                >
                                    {item.change > 0 ? `+${item.change}` : item.change}
                                </div>
                            </div>
                            <div className="sleepify-points-history-meta">
                                <span>{item.operator}</span>
                                <span>{item.record_date}</span>
                            </div>
                        </mdui-card>
                    ))}
                </div>
            ) : (
                <div className="sleepify-points-empty">暂无积分记录</div>
            )}
        </section>
    )
}
