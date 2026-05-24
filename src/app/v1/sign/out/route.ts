import axios from 'axios'
import type { NextResponse } from 'next/server'
import { removeConfig } from '@/lib/db'
import { fail, internalError, success } from '@/lib/server/api'
import { getAuthHeader, isInvalidTokenError, upstream } from '@/lib/server/upstream'

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

export async function POST(request: Request) {
    const rawCookie = request.headers.get('cookie')
    const token = readCookie(rawCookie, 'token')

    if (!token) {
        return fail(1001, '未检测到登录状态')
    }

    const clearCookies = (response: NextResponse) => {
        response.cookies.set({
            name: 'token',
            value: '',
            httpOnly: false,
            path: '/',
            maxAge: 0,
            sameSite: 'lax',
        })

        response.cookies.set({
            name: 'id',
            value: '',
            httpOnly: false,
            path: '/',
            maxAge: 0,
            sameSite: 'lax',
        })

        return response
    }

    try {
        await upstream.post(
            '/auth/logout/',
            null,
            {
                headers: getAuthHeader(token),
            }
        )

        removeConfig('token')
        return clearCookies(success({}))
    } catch (error) {
        if (isInvalidTokenError(error)) {
            removeConfig('token')
            return clearCookies(fail(1002, '登录状态无效'))
        }

        return internalError()
    }
}

export function GET() {
    return fail(1000, '请求内容错误')
}
