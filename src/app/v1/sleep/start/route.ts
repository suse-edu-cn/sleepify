import axios from 'axios'
import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamStartSleep = {
    start_time: string
    end_time: string | null
    planned_end_time: string
    status: 'IN_PROGRESS'
}

export async function GET(request: Request) {
    const token = request.headers
        .get('cookie')
        ?.split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith('token='))
        ?.replace('token=', '')

    if (!token) {
        return fail(1001, '未检测到登录状态')
    }

    try {
        const upstreamResponse = await upstream.post<UpstreamStartSleep>(
            '/sleep/start/',
            {},
            {
                headers: getAuthHeader(token),
            }
        )

        return success({
            start_time: upstreamResponse.data.start_time,
            planned_end_time: upstreamResponse.data.planned_end_time,
        })
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        if (
            axios.isAxiosError(error) &&
            error.response?.status === 400 &&
            (error.response.data as { error?: string } | undefined)?.error ===
                '已有进行中的睡眠记录'
        ) {
            return fail(2002, '已有进行中的睡眠记录')
        }

        return internalError()
    }
}
