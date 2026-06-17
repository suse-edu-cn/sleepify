'use client'

import { useCallback, useEffect, useState } from 'react'
import { alert } from 'mdui/functions/alert.js'
import { requestApi } from '@/lib/request/client'

import 'mdui/components/switch.js'
import 'mdui/components/button.js'
import 'mdui/components/circular-progress.js'
import 'mdui/components/select.js'
import 'mdui/components/menu-item.js'

type AutoSleepConfig = {
    enabled: boolean
    time: string
    frequency: 'daily' | 'workday' | 'custom'
    days: number[]
}

export default function AutoSleepCard() {
    const [autoSleepLoading, setAutoSleepLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [draftConfig, setDraftConfig] = useState<AutoSleepConfig>({
        enabled: false,
        time: '23:00',
        frequency: 'daily',
        days: [],
    })

    const fetchAutoSleepConfig = useCallback(async () => {
        setAutoSleepLoading(true)
        try {
            const data = await requestApi<AutoSleepConfig>({
                url: '/sleep/config',
                method: 'GET',
            })
            setDraftConfig(data)
        } catch {
            // keep default
        } finally {
            setAutoSleepLoading(false)
        }
    }, [])

    const submitAutoSleepConfig = useCallback(async () => {
        setSaving(true)
        try {
            await requestApi({
                url: '/sleep/config',
                method: 'POST',
                data: draftConfig,
            })
            alert({
                headline: '自动睡眠',
                description: '自动睡眠配置已更新成功',
                confirmText: '确认',
            }).catch(() => {})
        } finally {
            setSaving(false)
        }
    }, [draftConfig])

    const toggleAutoSleep = useCallback(async () => {
        const updated = { ...draftConfig, enabled: !draftConfig.enabled }
        setDraftConfig(updated)
        setSaving(true)
        try {
            await requestApi({
                url: '/sleep/config',
                method: 'POST',
                data: updated,
            })
        } finally {
            setSaving(false)
        }
    }, [draftConfig])

    useEffect(() => {
        void fetchAutoSleepConfig()
    }, [fetchAutoSleepConfig])

    return (
        <mdui-card className="sleepify-card">
            <div className="sleepify-card-title-row">
                <h2 className="sleepify-card-title">自动睡眠</h2>
                <mdui-switch
                    checked={draftConfig.enabled}
                    disabled={autoSleepLoading || saving}
                    onChange={() => {
                        void toggleAutoSleep()
                    }}
                />
            </div>
            {autoSleepLoading ? (
                <div className="sleepify-card-loading">
                    <mdui-circular-progress />
                </div>
            ) : draftConfig.enabled ? (
                <div className="sleepify-auto-sleep-config">
                    <div className="sleepify-auto-sleep-time">
                        <select
                            className="sleepify-time-picker-trigger"
                            disabled={saving}
                            value={draftConfig.time.split(':')[0]}
                            onChange={(e) => {
                                const mm = draftConfig.time.split(':')[1]
                                setDraftConfig({
                                    ...draftConfig,
                                    time: `${e.target.value}:${mm}`,
                                })
                            }}
                        >
                            {['20', '21', '22', '23'].map((h) => (
                                <option key={h} value={h}>
                                    {h}
                                </option>
                            ))}
                        </select>
                        <span className="sleepify-time-separator">:</span>
                        <select
                            className="sleepify-time-picker-trigger"
                            disabled={saving}
                            value={draftConfig.time.split(':')[1]}
                            onChange={(e) => {
                                const hh = draftConfig.time.split(':')[0]
                                setDraftConfig({
                                    ...draftConfig,
                                    time: `${hh}:${e.target.value}`,
                                })
                            }}
                        >
                            {Array.from({ length: 60 }, (_, i) => (
                                <option
                                    key={i}
                                    value={i.toString().padStart(2, '0')}
                                >
                                    {i.toString().padStart(2, '0')}
                                </option>
                            ))}
                        </select>
                    </div>
                    <mdui-select
                        label="任务类型"
                        value={draftConfig.frequency}
                        disabled={saving}
                        clearable={false}
                        variant='outlined'
                        onChange={(e: React.ChangeEvent<HTMLElement>) => {
                            const target = e.target as HTMLSelectElement
                            setDraftConfig({
                                ...draftConfig,
                                frequency: target.value as AutoSleepConfig['frequency'],
                            })
                        }}
                    >
                        <mdui-menu-item value="daily">每天</mdui-menu-item>
                        <mdui-menu-item value="workday">工作日</mdui-menu-item>
                        <mdui-menu-item value="custom">自定义</mdui-menu-item>
                    </mdui-select>
                    {draftConfig.frequency === 'custom' && (
                        <div className="sleepify-auto-sleep-days">
                            {['一', '二', '三', '四', '五', '六', '日'].map(
                                (label, index) => {
                                    const day = (index + 1) % 7
                                    const selected = draftConfig.days.includes(day)
                                    return (
                                        <mdui-button
                                            key={day}
                                            variant={selected ? 'filled' : 'outlined'}
                                            disabled={saving}
                                            onClick={() => {
                                                setDraftConfig({
                                                    ...draftConfig,
                                                    days: selected
                                                        ? draftConfig.days.filter(
                                                              (d) => d !== day
                                                          )
                                                        : [...draftConfig.days, day],
                                                })
                                            }}
                                        >
                                            {label}
                                        </mdui-button>
                                    )
                                }
                            )}
                        </div>
                    )}
                    <div className="sleepify-auto-sleep-actions">
                        <mdui-button
                            variant="filled"
                            loading={saving}
                            disabled={saving}
                            onClick={() => {
                                void submitAutoSleepConfig()
                            }}
                        >
                            更新配置
                        </mdui-button>
                    </div>
                </div>
            ) : (
                <div className="sleepify-card-sleep-status">
                    当前未启用自动睡眠
                </div>
            )}
        </mdui-card>
    )
}
