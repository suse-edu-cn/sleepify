import { z } from 'zod'
import { fail, success } from '@/lib/server/api'
import { getConfig, setConfig } from '@/lib/db'

const DEFAULT_CONFIG = {
    enabled: false,
    time: '23:00',
    frequency: 'daily',
    days: [],
}

const configSchema = z.object({
    enabled: z.boolean(),
    time: z.string().regex(/^\d{2}:\d{2}$/),
    frequency: z.enum(['daily', 'workday', 'custom']),
    days: z.array(z.number().int().min(0).max(6)),
})

export async function GET() {
    const raw = getConfig('auto_sleep')
    if (!raw) {
        return success(DEFAULT_CONFIG)
    }

    try {
        return success(JSON.parse(raw))
    } catch {
        return success(DEFAULT_CONFIG)
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = configSchema.safeParse(body)

        if (!parsed.success) {
            return fail(1005, '请求的内容不符合要求')
        }

        setConfig('auto_sleep', JSON.stringify(parsed.data))
        return success(parsed.data)
    } catch {
        return fail(1000, '请求内容错误')
    }
}
