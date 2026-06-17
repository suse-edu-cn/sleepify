'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { alert } from 'mdui/functions/alert.js'
import { confirm } from 'mdui/functions/confirm.js'
import { requestApi } from '@/lib/request/client'

type ChallengeDetail = {
    id: number
    name: string
    description: string
    is_onetime: boolean
    points: number
    duration: number
    is_repeatable: boolean
    is_include_weekends: boolean
    end_time: string | null
    status: string
}

const STATUS_LABEL: Record<string, string> = {
    active: '可报名',
    closed: '已关闭',
    progressing: '进行中',
    expired: '已截止',
}

function formatTime(value: string | null) {
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

export default function ChallengeDetail() {
    const { id } = useParams<{ id: string }>()
    const [detail, setDetail] = useState<ChallengeDetail | null>(null)
    const [loading, setLoading] = useState(true)
    const [joining, setJoining] = useState(false)

    const fetchDetail = useCallback(async () => {
        setLoading(true)

        try {
            const data = await requestApi<ChallengeDetail>({
                url: `/points/challenges/${id}`,
                method: 'GET',
            })

            setDetail(data)
        } finally {
            setLoading(false)
        }
    }, [id])

    useEffect(() => {
        void fetchDetail()
    }, [fetchDetail])

    const handleJoin = useCallback(async () => {
        const confirmed = await confirm({
            headline: '报名',
            description: '确定要报名吗？',
            confirmText: '确定',
            cancelText: '取消',
        }).catch(() => false)

        if (!confirmed) {
            return
        }

        setJoining(true)

        try {
            await requestApi<{ success: boolean }>({
                url: `/points/challenges/${id}`,
                method: 'POST',
            })

            await alert({
                headline: '报名',
                description: '报名成功',
                confirmText: '确定',
            })
        } catch {
            // requestApi already shows snackbar on error
        } finally {
            setJoining(false)
        }
    }, [id])

    const handleApply = useCallback(() => {
        void alert({
            description: '功能正在开发中',
            confirmText: '确定',
        })
    }, [])

    if (loading) {
        return (
            <section className="sleepify-page sleepify-page-center">
                <mdui-circular-progress />
            </section>
        )
    }

    if (!detail) {
        return (
            <section className="sleepify-page">
                <div className="sleepify-points-empty">未找到挑战信息</div>
            </section>
        )
    }

    return (
        <section className="sleepify-page">
            <mdui-card className="sleepify-card">
                <div className="sleepify-detail-header">
                    <h1 className="sleepify-detail-name">{detail.name}</h1>
                    <div
                        className={`sleepify-challenges-status sleepify-challenges-status-${detail.status}`}
                    >
                        {STATUS_LABEL[detail.status] ?? detail.status}
                    </div>
                </div>
                <div className="sleepify-detail-description">{detail.description}</div>
            </mdui-card>

            <mdui-card className="sleepify-card">
                <div className="sleepify-detail-info">
                    <div className="sleepify-detail-row">
                        <span className="sleepify-detail-label">积分</span>
                        <span>+{detail.points}</span>
                    </div>
                    <div className="sleepify-detail-row">
                        <span className="sleepify-detail-label">持续时间</span>
                        <span>{detail.is_onetime ? '一次性' : `${detail.duration} 天`}</span>
                    </div>
                    <div className="sleepify-detail-row">
                        <span className="sleepify-detail-label">截止时间</span>
                        <span>{formatTime(detail.end_time)}</span>
                    </div>
                    <div className="sleepify-detail-row">
                        <span className="sleepify-detail-label">可重复</span>
                        <span>{detail.is_repeatable ? '是' : '否'}</span>
                    </div>
                    <div className="sleepify-detail-row">
                        <span className="sleepify-detail-label">包含周末</span>
                        <span>{detail.is_include_weekends ? '是' : '否'}</span>
                    </div>
                </div>
            </mdui-card>

            {detail.status !== 'progressing' && (
                <mdui-button
                    variant="filled"
                    loading={joining}
                    disabled={joining || detail.status === 'expired' || detail.status === 'closed'}
                    onClick={() => {
                        void handleJoin()
                    }}
                    full-width
                >
                    报名
                </mdui-button>
            )}
            {detail.status === 'progressing' && (
                <mdui-button onClick={handleApply} full-width>
                    申请
                </mdui-button>
            )}
        </section>
    )
}
