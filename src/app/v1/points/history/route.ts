import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamPointsHistoryItem = {
    change: number
    reason: string
    operator: string
    record_date: string
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
    const rawCookie = request.headers.get('cookie')
    const token = readCookie(rawCookie, 'token')

    if (!token) {
        return fail(1001, '未检测到登录状态')
    }

    const id = readCookie(rawCookie, 'id')

    if (!id) {
        return fail(1000, '请求内容错误')
    }

    try {
        const upstreamResponse = await upstream.get<UpstreamPointsHistoryItem[]>(
            `/students/${encodeURIComponent(id)}/points/`,
            {
                headers: getAuthHeader(token),
            }
        )

        return success(
            upstreamResponse.data.map((item) => ({
                change: item.change,
                reason: item.reason,
                operator: item.operator,
                record_date: item.record_date,
            }))
        )
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        return internalError()
    }
}
