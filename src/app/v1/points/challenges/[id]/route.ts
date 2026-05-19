import axios from 'axios'
import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamChallengeDetail = {
    id: number
    name: string
    description: string
    challenge_type: string
    points: number
    is_repeatable: boolean
    duration_days: number
    include_weekends: boolean
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

type UpstreamJoinResponse = {
    detail: string
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const token = request.headers
        .get('cookie')
        ?.split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith('token='))
        ?.replace('token=', '')

    if (!token) {
        return fail(1001, '未检测到登录状态')
    }

    const { id } = await params

    try {
        const authHeaders = getAuthHeader(token)

        const [detailRes, currentRes] = await Promise.all([
            upstream.get<UpstreamChallengeDetail>(`/challenges/${encodeURIComponent(id)}/`, {
                headers: authHeaders,
            }),
            upstream.get<UpstreamStudentChallenge[]>('/student-challenges/', {
                headers: authHeaders,
            }),
        ])

        const item = detailRes.data
        const progressingIds = new Set(currentRes.data.map((c) => c.challenge))
        const now = new Date()

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

        return success({
            id: item.id,
            name: item.name,
            description: item.description,
            is_onetime: item.challenge_type === 'ONETIME',
            points: item.points,
            duration: item.duration_days,
            is_repeatable: item.is_repeatable,
            is_include_weekends: item.include_weekends,
            end_time: item.end_date,
            status,
        })
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return fail(2004, '未找到挑战信息')
        }

        return internalError()
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const token = request.headers
        .get('cookie')
        ?.split(';')
        .map((item) => item.trim())
        .find((item) => item.startsWith('token='))
        ?.replace('token=', '')

    if (!token) {
        return fail(1001, '未检测到登录状态')
    }

    const { id } = await params

    try {
        await upstream.post<UpstreamJoinResponse>(
            `/challenges/${encodeURIComponent(id)}/join/`,
            {},
            {
                headers: getAuthHeader(token),
            }
        )

        return success({ success: true })
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        if (axios.isAxiosError(error) && error.response?.status === 400) {
            const detail = (error.response.data as { detail?: string }).detail

            if (detail === '您正在进行此挑战') {
                return fail(1011, '挑战正在进行中')
            }

            if (detail === '挑战已截止') {
                return fail(1012, '挑战已截止')
            }
        }

        return internalError()
    }
}
