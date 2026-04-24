'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { snackbar } from 'mdui/functions/snackbar.js'
import { useUserState } from '@/components/UserStateProvider'
import { requestApi } from '@/lib/request/client'
import { version } from '@/../package.json'

async function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        return
    }

    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()

    const copied = document.execCommand('copy')
    document.body.removeChild(textarea)

    if (!copied) {
        throw new Error('copy failed')
    }
}

export default function InfoPage() {
    const router = useRouter()
    const { user, userLoading, clearUser } = useUserState()
    const [signingOut, setSigningOut] = useState(false)

    const onSignOut = async () => {
        if (signingOut) {
            return
        }

        setSigningOut(true)

        try {
            await requestApi<Record<string, never>>({
                url: '/sign',
                method: 'DELETE',
            })
        } finally {
            clearUser()
            setSigningOut(false)
            router.replace('/sign')
        }
    }

    const onShare = async () => {
        const shareText = window.location.origin

        await copyText(shareText)
        snackbar({
            message: '已复制链接，分享给别人吧！',
            closeable: true,
            placement: 'top',
        })
    }

    return (
        <section className="sleepy-page">
            <div className="sleepy-avatar-area">
                <mdui-avatar
                    src="https://obj.crrashh.com/prod/assets_sleepy/icon.jpg"
                    className="sleepy-avatar"
                />
                <div className="sleepy-info-title">Sleepy 代签到工具</div>
            </div>

            <div className="sleepy-info-area">
                <div className="sleepy-catalog">个人信息</div>
                <mdui-card>
                    {userLoading ? (
                        <mdui-circular-progress></mdui-circular-progress>
                    ) : (
                        <mdui-list className="sleepy-info-list">
                            <mdui-list-item className="sleepy-info-item" icon="class">
                                <div className="sleepy-info-row">
                                    <span>学号</span>
                                    <span className="sleepy-info-value">{user?.number ?? '-'}</span>
                                </div>
                            </mdui-list-item>
                            <mdui-list-item className="sleepy-info-item" icon="school">
                                <div className="sleepy-info-row">
                                    <span>班级</span>
                                    <span className="sleepy-info-value">{user?.class ?? '-'}</span>
                                </div>
                            </mdui-list-item>
                            <mdui-list-item className="sleepy-info-item" icon="message">
                                <div className="sleepy-info-row">
                                    <span>QQ</span>
                                    <span className="sleepy-info-value">{user?.qq ?? '-'}</span>
                                </div>
                            </mdui-list-item>
                            <mdui-list-item className="sleepy-info-item" icon="star">
                                <div className="sleepy-info-row">
                                    <span>积分</span>
                                    <span className="sleepy-info-value">
                                        {typeof user?.points === 'number' ? user.points : '-'}
                                    </span>
                                </div>
                            </mdui-list-item>
                        </mdui-list>
                    )}
                </mdui-card>
            </div>

            <div className="sleepy-info-area">
                <div className="sleepy-catalog">关于应用</div>
                <mdui-card>
                    <mdui-list className="sleepy-info-list">
                        <mdui-list-item
                            className="sleepy-info-item"
                            icon="share"
                            end-icon="arrow_right"
                            onClick={() => {
                                void onShare()
                            }}
                        >
                            <div className="sleepy-info-row">
                                <span>分享</span>
                            </div>
                        </mdui-list-item>
                        <mdui-list-item className="sleepy-info-item" icon="info">
                            <div className="sleepy-info-row">
                                <span>版本</span>
                                <span className="sleepy-info-value">{'v' + version}</span>
                            </div>
                        </mdui-list-item>
                    </mdui-list>
                </mdui-card>
            </div>

            <mdui-button
                variant="filled"
                full-width
                loading={signingOut}
                disabled={signingOut}
                onClick={() => {
                    void onSignOut()
                }}
                suppressHydrationWarning
            >
                退出登录
            </mdui-button>
        </section>
    )
}
