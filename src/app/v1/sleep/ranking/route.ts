import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamSleepRankingItem = {
    student_id: string
    name: string
    class_name: string
    weekly_sleep_days: number
    monthly_sleep_days: number
    max_continuous_days: number
    last_sleep: string
}

function readCookie(rawCookie: string | null, key: string) {
    if (!rawCookie) {
        return null
    }

    return (
        rawCookie
            .split(';')
            .map((item) => item.trim())
            .find((item) => item.startsWith(`${key}=`))
            ?.replace(`${key}=`, '') ?? null
    )
}

export async function GET(request: Request) {
    const token = readCookie(request.headers.get('cookie'), 'token')

    if (!token) {
        return fail(1001, '未检测到登录状态')
    }

    try {
        const upstreamResponse = await upstream.get<UpstreamSleepRankingItem[]>(
            '/sleep/rankings/',
            {
                headers: getAuthHeader(token),
            }
        )

        return success(
            upstreamResponse.data.map((item) => ({
                id: item.student_id,
                name: item.name,
                class_name: item.class_name,
                weekly_sleep_days: item.weekly_sleep_days,
                monthly_sleep_days: item.monthly_sleep_days,
                max_continuous_days: item.max_continuous_days,
                last_sleep: item.last_sleep,
            }))
        )
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        return internalError()
    }
}
