import { Buffer } from 'node:buffer'
import axios from 'axios'
import { z } from 'zod'
import { getConfig, upsertUser } from '@/lib/db'
import { decrypt } from '@/lib/crypto/ecc'
import { fail, internalError, success } from '@/lib/server/api'
import { upstream } from '@/lib/server/upstream'

const payloadSchema = z.object({
    payload: z.string(),
})

const signBodySchema = z.object({
    username: z.string(),
    password: z.string(),
})

export async function POST(request: Request) {
    try {
        const rawBody = await request.json().catch(() => null)
        const payloadParsed = payloadSchema.safeParse(rawBody)

        if (!payloadParsed.success) {
            return fail(1000, '请求内容错误')
        }

        const privateKey = getConfig('ecc_private_key')
        if (!privateKey) {
            return fail(5000, '服务器未初始化')
        }

        let decryptedJson: string
        try {
            const decryptedBytes = await decrypt(payloadParsed.data.payload, privateKey)
            decryptedJson = new TextDecoder().decode(decryptedBytes)
        } catch (e) {
            console.error('[sign/in] ECC decrypt failed:', e)
            return fail(1000, '请求内容错误')
        }

        const parsed = signBodySchema.safeParse(JSON.parse(decryptedJson))

        if (!parsed.success) {
            return fail(1000, '请求内容错误')
        }

        try {
            const upstreamResponse = await upstream.post<{
                token: string
                user: { student_data: { id: string } }
            }>('/auth/login/', {
                username: parsed.data.username,
                password: Buffer.from(parsed.data.password, 'base64').toString('utf-8'),
            })

            const token = upstreamResponse.data.token
            const id = upstreamResponse.data.user?.student_data?.id

            if (!token || !id) {
                return internalError()
            }

            upsertUser(id, token)

            const response = success({ token, id })

            response.cookies.set({
                name: 'token',
                value: token,
                httpOnly: false,
                path: '/',
                maxAge: 2592000,
                sameSite: 'lax',
            })

            response.cookies.set({
                name: 'id',
                value: id,
                httpOnly: false,
                path: '/',
                maxAge: 2592000,
                sameSite: 'lax',
            })

            return response
        } catch (error) {
            if (
                axios.isAxiosError(error) &&
                error.response?.status === 400 &&
                Array.isArray(
                    (error.response.data as { non_field_errors?: string[] }).non_field_errors
                )
            ) {
                return fail(2001, '登录失败，用户名或密码错误')
            }

            return internalError()
        }
    } catch {
        return internalError()
    }
}

export function GET() {
    return fail(1000, '请求内容错误')
}

export function DELETE() {
    const response = success({})

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
