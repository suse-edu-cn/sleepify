import { z } from 'zod'
import { fail, success } from '@/lib/server/api'
import { getConfig, setConfig, getUserAutoSleep, setUserAutoSleep } from '@/lib/db'

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

function readCookie(rawCookie: string | null, key: string) {
    if (!rawCookie) return null
    return (
        rawCookie
            .split(';')
            .map((item) => item.trim())
            .find((item) => item.startsWith(`${key}=`))
            ?.replace(`${key}=`, '') ?? null
    )
}

function getConfigForUser(userId: string | null) {
    if (userId) {
        const raw = getUserAutoSleep(userId)
        if (raw) {
            try {
                return JSON.parse(raw)
            } catch {
                return DEFAULT_CONFIG
            }
        }
        return DEFAULT_CONFIG
    }

    const raw = getConfig('auto_sleep')
    if (!raw) return DEFAULT_CONFIG
    try {
        return JSON.parse(raw)
    } catch {
        return DEFAULT_CONFIG
    }
}

export async function GET(request: Request) {
    const userId = readCookie(request.headers.get('cookie'), 'id')
    return success(getConfigForUser(userId))
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const parsed = configSchema.safeParse(body)

        if (!parsed.success) {
            return fail(1005, '请求的内容不符合要求')
        }

        const userId = readCookie(request.headers.get('cookie'), 'id')
        const serialized = JSON.stringify(parsed.data)

        if (userId) {
            setUserAutoSleep(userId, serialized)
        } else {
            setConfig('auto_sleep', serialized)
        }

        return success(parsed.data)
    } catch {
        return fail(1000, '请求内容错误')
    }
}
