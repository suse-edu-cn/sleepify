'use client'

import { useEffect, useMemo, useState } from 'react'
import { requestApi } from '@/lib/request/client'
import { useUserState } from '@/components/UserStateProvider'

import '@mdui/icons/access-time.js'
import '@mdui/icons/warning-amber.js'
import '@mdui/icons/bedtime.js'

type StartSleepData = {
    start_time: string
    planned_end_time: string
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

function getTimeStr(totalMinutes: number) {
    const safeMinutes = Math.max(0, totalMinutes)
    const hours = Math.floor(safeMinutes / 60)
    const minutes = safeMinutes % 60

    return `${hours} 小时 ${minutes} 分钟`
}

export default function HomeDashboard() {
    const {
        user,
        sleepStatus,
        sleepLoading,
        refreshSleepStatus,
        updateSleepStatus,
        sleepRanking,
        sleepRankingLoading,
    } = useUserState()
    const [startingSleep, setStartingSleep] = useState(false)
    const [nowMs, setNowMs] = useState(() => Date.now())

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

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNowMs(Date.now())
        }, 30000)

        return () => {
            window.clearInterval(timer)
        }
    }, [])

    const sleepContent = useMemo(() => {
        if (sleepLoading) {
            return <mdui-circular-progress />
        }

        if (!sleepStatus) {
            return (
                <div className="sleepify-card-sleep-status">
                    <mdui-icon-warning-amber />
                    暂未获取到睡眠状态。
                </div>
            )
        }

        if (sleepStatus.status === 0) {
            return (
                <>
                    <div className="sleepify-card-sleep-status">
                        <mdui-icon-bedtime />
                        当前无进行中的睡眠活动
                    </div>
                    <mdui-button
                        variant="filled"
                        loading={startingSleep}
                        disabled={startingSleep}
                        onClick={async () => {
                            setStartingSleep(true)

                            try {
                                const started = await requestApi<StartSleepData>({
                                    url: '/sleep/start',
                                    method: 'GET',
                                })

                                updateSleepStatus({
                                    status: 1,
                                    start_time: started.start_time,
                                    planned_end_time: started.planned_end_time,
                                })
                            } finally {
                                setStartingSleep(false)
                            }
                        }}
                    >
                        开始睡觉
                    </mdui-button>
                </>
            )
        }

        const startTime = new Date(sleepStatus.start_time).getTime()
        const endTime = new Date(sleepStatus.planned_end_time).getTime()
        const hasValidRange =
            Number.isFinite(startTime) && Number.isFinite(endTime) && endTime > startTime

        const elapsedMinutes = Math.max(0, Math.floor((nowMs - startTime) / 60000))
        const remainingMinutes = Math.max(0, Math.floor((endTime - nowMs) / 60000))
        const progressPercent = hasValidRange
            ? Math.max(
                  0,
                  Math.min(100, Math.round(((nowMs - startTime) / (endTime - startTime)) * 100))
              )
            : 0

        return (
            <>
                <div className="sleepify-card-sleep-status">
                    <mdui-icon-access-time />
                    睡眠正在进行中......
                </div>
                {hasValidRange ? (
                    <>
                        <div className="sleepify-sleep-progress">
                            <div>已开始：{getTimeStr(elapsedMinutes)}</div>
                            <div>还剩余：{getTimeStr(remainingMinutes)}</div>
                        </div>
                        <mdui-linear-progress
                            max={100}
                            value={progressPercent}
                        ></mdui-linear-progress>
                        <div className="sleepify-sleep-progress-percent">{progressPercent}%</div>
                    </>
                ) : null}
                <div className="sleepify-time-grid">
                    <div className="sleepify-time-tag">
                        开始时间：{formatTime(sleepStatus.start_time)}
                    </div>
                    <div className="sleepify-time-tag">
                        结束时间：{formatTime(sleepStatus.planned_end_time)}
                    </div>
                </div>
            </>
        )
    }, [nowMs, sleepLoading, sleepStatus, startingSleep, updateSleepStatus])

    return (
        <section className="sleepify-page">
            <mdui-card className="sleepify-card">
                <div className="sleepify-card-title-row">
                    <h2 className="sleepify-card-title">睡眠状态</h2>
                    <button
                        type="button"
                        className="sleepify-refresh-btn"
                        aria-label="刷新睡眠状态"
                        disabled={sleepLoading || startingSleep}
                        onClick={() => {
                            void refreshSleepStatus({ clearBeforeLoad: true })
                        }}
                    >
                        <mdui-icon-refresh />
                    </button>
                </div>
                {sleepContent}
            </mdui-card>

            <mdui-card className="sleepify-card">
                <h2 className="sleepify-card-title">睡眠统计</h2>
                {sleepRankingLoading ? (
                    <mdui-circular-progress />
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
        </section>
    )
}
