import { getAllAutoSleepUsers } from '@/lib/db'
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

async function autoPunchForUser(userId: string, token: string, config: AutoSleepConfig) {
    if (!isConfigTime(config)) {
        return
    }

    if (!shouldPunchToday(config)) {
        console.log(`[cron] [${userId}] ${config.time} 今日不在打卡计划内，跳过`)
        return
    }

    const headers = getAuthHeader(token)

    try {
        const statusRes = await upstream.get('/sleep/today_status/', { headers })
        const status = statusRes.data?.status

        if (status !== 'NO_RECORD' && status !== 'COMPLETED') {
            console.log(`[cron] [${userId}] 今日已有打卡记录，跳过`)
            return
        }
    } catch (error) {
        if (isInvalidTokenError(error)) {
            console.log(`[cron] [${userId}] token 已失效，跳过打卡`)
            return
        }
        console.error(`[cron] [${userId}] 检查打卡状态失败:`, error)
        return
    }

    try {
        await upstream.post('/sleep/start/', {}, { headers })
        console.log(`[cron] [${userId}] 自动打卡成功`)
    } catch (error) {
        if (isInvalidTokenError(error)) {
            console.log(`[cron] [${userId}] token 已失效，打卡失败`)
            return
        }
        console.error(`[cron] [${userId}] 自动打卡失败:`, error)
    }
}

export async function autoPunch() {
    const users = getAllAutoSleepUsers()

    for (const user of users) {
        let config: AutoSleepConfig
        try {
            config = JSON.parse(user.auto_sleep)
        } catch {
            continue
        }

        if (!config.enabled) {
            continue
        }

        await autoPunchForUser(user.user_id, user.token, config)
    }
}
