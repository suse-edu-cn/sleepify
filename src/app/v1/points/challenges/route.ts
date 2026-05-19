import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamChallenge = {
    id: number
    name: string
    description: string
    challenge_type: string
    points: number
    duration_days: number
    end_date: string | null
    is_active: boolean
}

type UpstreamStudentChallenge = {
    challenge: number
    challenge_type: string
    challenge_name: string
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
        const authHeaders = getAuthHeader(token)

        const [challengesRes, currentRes] = await Promise.all([
            upstream.get<UpstreamChallenge[]>('/challenges/', { headers: authHeaders }),
            upstream.get<UpstreamStudentChallenge[]>('/student-challenges/', {
                headers: authHeaders,
            }),
        ])

        const progressingIds = new Set(currentRes.data.map((item) => item.challenge))
        const now = new Date()

        return success(
            challengesRes.data.map((item) => {
                let status: string

                if (item.end_date && now > new Date(item.end_date)) {
                    status = 'expired'
                } else if (progressingIds.has(item.id)) {
                    status = 'progressing'
                } else if (item.is_active) {
                    status = 'active'
                } else {
                    status = 'closed'
                }

                return {
                    id: item.id,
                    name: item.name,
                    description: item.description,
                    is_onetime: item.challenge_type === 'ONETIME',
                    points: item.points,
                    duration: item.duration_days,
                    end_time: item.end_date,
                    status,
                }
            })
        )
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        return internalError()
    }
}
