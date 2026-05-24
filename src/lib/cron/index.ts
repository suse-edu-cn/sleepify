import cron from 'node-cron'
import { autoPunch } from './punch'

export function initCron() {
    cron.schedule('* 20-23 * * *', () => {
        void autoPunch()
    })

    console.log('[cron] 自动睡眠打卡任务已注册')
}
