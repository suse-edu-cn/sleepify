import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamSleepStatus =
    | {
          status: 'NO_RECORD'
      }
    | {
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
        const upstreamResponse = await upstream.get<UpstreamSleepStatus>('/sleep/today_status/', {
            headers: getAuthHeader(token),
        })

        if (upstreamResponse.data.status === 'NO_RECORD') {
            return success({ status: 0 })
        }

        if (upstreamResponse.data.status === 'IN_PROGRESS') {
            return success({
                status: 1,
                start_time: upstreamResponse.data.start_time,
                planned_end_time: upstreamResponse.data.planned_end_time,
            })
        }

        return success({ status: 0 })
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        return internalError()
    }
}
