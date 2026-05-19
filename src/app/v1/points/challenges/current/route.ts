import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamStudentChallenge = {
    challenge: number
    challenge_name: string
    challenge_type: string
    challenge_points: number
    challenge_duration: number
    challenge_end_date: string | null
    status: string
    start_date: string
    completed_at: string | null
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
        const upstreamResponse = await upstream.get<UpstreamStudentChallenge[]>(
            '/student-challenges/',
            {
                headers: getAuthHeader(token),
            }
        )

        return success(
            upstreamResponse.data.map((item) => ({
                id: item.challenge,
                name: item.challenge_name,
                is_onetime: item.challenge_type === 'ONETIME',
                points: item.challenge_points,
                duration: item.challenge_duration,
                start_date: item.start_date,
                end_date: item.challenge_end_date,
                completed_date: item.completed_at,
                status: item.status,
            }))
        )
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        return internalError()
    }
}
