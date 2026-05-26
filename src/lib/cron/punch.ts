import { getConfig } from '@/lib/db'
import { upstream, getAuthHeader, isInvalidTokenError } from '@/lib/server/upstream'

type AutoSleepConfig = {
    enabled: boolean
    time: string
    frequency: 'daily' | 'workday' | 'custom'
    days: number[]
}

function shouldPunchToday(config: AutoSleepConfig): boolean {
    const today = new Date().getDay()

    switch (config.frequency) {
        case 'daily':
            return true
        case 'workday':
            return today >= 1 && today <= 5
        case 'custom':
            return config.days.includes(today)
        default:
            return false
    }
}

function isConfigTime(config: AutoSleepConfig): boolean {
    const now = new Date()
    const [hh, mm] = config.time.split(':').map(Number)
    return now.getHours() === hh && now.getMinutes() === mm
}

export async function autoPunch() {
    const rawConfig = getConfig('auto_sleep')
    if (!rawConfig) {
        return
    }

    let config: AutoSleepConfig
    try {
        config = JSON.parse(rawConfig)
    } catch {
        return
    }

    if (!config.enabled) {
        return
    }

    if (!isConfigTime(config)) {
        return
    }

    if (!shouldPunchToday(config)) {
        console.log(`[cron] ${config.time} 今日不在打卡计划内，跳过`)
        return
    }

    const token = getConfig('token')
    if (!token) {
        console.log('[cron] 未找到 token，跳过打卡')
        return
    }

    const headers = getAuthHeader(token)

    try {
        const statusRes = await upstream.get('/sleep/today_status/', { headers })
        const status = statusRes.data?.status

        if (status !== 'NO_RECORD' && status !== 'COMPLETED') {
            console.log('[cron] 今日已有打卡记录，跳过')
            return
        }
    } catch (error) {
        if (isInvalidTokenError(error)) {
            console.log('[cron] token 已失效，跳过打卡')
            return
        }
        console.error('[cron] 检查打卡状态失败:', error)
        return
    }

    try {
        await upstream.post('/sleep/start/', {}, { headers })
        console.log('[cron] 自动打卡成功')
    } catch (error) {
        if (isInvalidTokenError(error)) {
            console.log('[cron] token 已失效，打卡失败')
            return
        }
        console.error('[cron] 自动打卡失败:', error)
    }
}
