'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { snackbar } from 'mdui/functions/snackbar.js'
import { requestApi } from '@/lib/request/client'

const signSchema = z.object({
    username: z.string().min(9, '用户名长度必须大于 8').regex(/^\d+$/, '用户名必须为纯数字'),
    password: z.string().min(9, '密码长度必须大于 8'),
})

function encodeBase64(value: string) {
    const bytes = new TextEncoder().encode(value)
    let binary = ''

    bytes.forEach((byte) => {
        binary += String.fromCharCode(byte)
    })

    return btoa(binary)
}

export default function SignForm() {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const lastSubmitAtRef = useRef(0)

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const now = Date.now()

        if (now - lastSubmitAtRef.current < 1000) {
            snackbar({
                message: '操作过于频繁，稍后再试',
                closeable: true,
                placement: 'top',
            })
            return
        }

        lastSubmitAtRef.current = now

        const parsed = signSchema.safeParse({ username, password })

        if (!parsed.success) {
            const firstIssue = parsed.error.issues[0]?.message ?? '输入内容不合法'
            snackbar({
                message: firstIssue,
                closeable: true,
                placement: 'top',
            })
            return
        }

        setSubmitting(true)

        try {
            await requestApi<{ token: string; id: string }>({
                url: '/sign/in',
                method: 'POST',
                data: {
                    username,
                    password: encodeBase64(password),
                },
            })

            // 登录成功后替换路由到首页
            // 使用 replace 而不是 push，避免用户返回到登录页
            router.replace('/')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <section className="sleepify-sign-wrap">
            <mdui-card className="sleepify-sign-card">
                <h1 className="sleepify-sign-title">登录睡了么</h1>
                <p className="sleepify-sign-subtitle">输入学号密码后继续</p>

                <form className="sleepify-form" onSubmit={onSubmit}>
                    <mdui-text-field
                        required
                        label="用户名"
                        value={username}
                        inputmode="numeric"
                        variant="outlined"
                        onInput={(event) => {
                            setUsername((event.target as HTMLInputElement).value)
                        }}
                    />

                    <mdui-text-field
                        required
                        type="password"
                        label="密码"
                        value={password}
                        variant="outlined"
                        onInput={(event) => {
                            setPassword((event.target as HTMLInputElement).value)
                        }}
                    />

                    <mdui-button
                        type="submit"
                        variant="filled"
                        full-width
                        loading={submitting}
                        disabled={submitting}
                    >
                        登录
                    </mdui-button>
                </form>
            </mdui-card>
        </section>
    )
}
