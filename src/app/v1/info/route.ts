import axios from 'axios'
import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

type UpstreamInfoData = {
    student_number: string
    class_name: string
    qq: string
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
        const upstreamResponse = await upstream.get<UpstreamInfoData>(
            `/students/${encodeURIComponent(id)}/`,
            {
                headers: getAuthHeader(token),
            }
        )

        return success({
            id,
            number: upstreamResponse.data.student_number,
            class: upstreamResponse.data.class_name,
            qq: upstreamResponse.data.qq,
            points: upstreamResponse.data.points,
        })
    } catch (error) {
        if (isInvalidTokenError(error)) {
            return fail(1002, '登录状态无效')
        }

        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return fail(2003, '未找到学生信息')
        }

        return internalError()
    }
}
