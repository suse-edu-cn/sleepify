import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamPointsRankingItem = {
    id: string
    name: string
    class_name: string
    points: number
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
        const upstreamResponse = await upstream.get<UpstreamPointsRankingItem[]>('/leaderboard/current-points/', {
            headers: getAuthHeader(token),
        })

        return success(upstreamResponse.data)
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        return internalError()
    }
}