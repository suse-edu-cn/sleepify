'use client'

import { useEffect, useState } from 'react'
import '../styles/info.css'
import { useRouter } from 'next/navigation'
import { confirm } from 'mdui/functions/confirm.js'
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
    const [isAndroid, setIsAndroid] = useState(false)

    useEffect(() => {
        setIsAndroid(/android/i.test(navigator.userAgent))
    }, [])

    const onSignOut = async () => {
        if (signingOut) {
            return
        }

        setSigningOut(true)

        try {
            await requestApi<Record<string, never>>({
                url: '/sign/out',
                method: 'POST',
            })
        } finally {
            clearUser()
            setSigningOut(false)
            router.replace('/sign')
        }
    }

    const onLocalSignOut = () => {
        document.cookie = 'token=; path=/; max-age=0'
        document.cookie = 'id=; path=/; max-age=0'
        clearUser()
        router.replace('/sign')
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
        <section className="sleepify-page">
            <div className="sleepify-avatar-area">
                <mdui-avatar
                    src="https://obj.crrashh.com/prod/assets_sleepify/icon.jpg"
                    className="sleepify-avatar"
                />
                <div className="sleepify-info-title">睡了么</div>
            </div>

            <div className="sleepify-info-area">
                <div className="sleepify-catalog">个人信息</div>
                <mdui-card>
                    {userLoading ? (
                        <mdui-circular-progress></mdui-circular-progress>
                    ) : (
                        <mdui-list className="sleepify-info-list">
                            <mdui-list-item className="sleepify-info-item" icon="class">
                                <div className="sleepify-info-row">
                                    <span>学号</span>
                                    <span className="sleepify-info-value">
                                        {user?.number ?? '-'}
                                    </span>
                                </div>
                            </mdui-list-item>
                            <mdui-list-item className="sleepify-info-item" icon="school">
                                <div className="sleepify-info-row">
                                    <span>班级</span>
                                    <span className="sleepify-info-value">
                                        {user?.class ?? '-'}
                                    </span>
                                </div>
                            </mdui-list-item>
                            <mdui-list-item className="sleepify-info-item" icon="message">
                                <div className="sleepify-info-row">
                                    <span>QQ</span>
                                    <span className="sleepify-info-value">{user?.qq ?? '-'}</span>
                                </div>
                            </mdui-list-item>
                            <mdui-list-item className="sleepify-info-item" icon="star">
                                <div className="sleepify-info-row">
                                    <span>积分</span>
                                    <span className="sleepify-info-value">
                                        {typeof user?.points === 'number' ? user.points : '-'}
                                    </span>
                                </div>
                            </mdui-list-item>
                        </mdui-list>
                    )}
                </mdui-card>
            </div>

            <div className="sleepify-info-area">
                <div className="sleepify-catalog">关于应用</div>
                <mdui-card>
                    <mdui-list className="sleepify-info-list">
                        <mdui-list-item
                            className="sleepify-info-item"
                            icon="share"
                            end-icon="arrow_right"
                            onClick={() => {
                                void onShare()
                            }}
                        >
                            <div className="sleepify-info-row">
                                <span>分享</span>
                            </div>
                        </mdui-list-item>
                        {isAndroid && (
                            <mdui-list-item
                                className="sleepify-info-item"
                                icon="android"
                                end-icon="arrow_right"
                                onClick={() => {
                                    window.location.href = '/v1/pkg/url'
                                }}
                            >
                                <div className="sleepify-info-row">
                                    <span>获取 App</span>
                                </div>
                            </mdui-list-item>
                        )}
                        <mdui-list-item className="sleepify-info-item" icon="info">
                            <div className="sleepify-info-row">
                                <span>版本</span>
                                <span className="sleepify-info-value">{'v' + version}</span>
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
                    confirm({
                        headline: '退出登录',
                        description: '是否下线其它已登录的设备？\n\n注：这可能会导致自动打卡功能失效。',
                        closeOnOverlayClick: true,
                        confirmText: '确认下线',
                        cancelText: '取消',
                        onConfirm: () => {
                            void onSignOut()
                        },
                        onCancel: () => {
                            onLocalSignOut()
                        },
                    }).catch(() => {})
                }}
                suppressHydrationWarning
            >
                退出登录
            </mdui-button>

            <p className="sleepify-info-motto">
                若你我相逢在人海里&nbsp;&nbsp;&nbsp;请你送我一束花
                <br />
                我想要成为一名&nbsp;&nbsp;&nbsp;艺术家
            </p>

            <p className="sleepify-info-copyright">
                &copy; 2026 crrashh1542.
            </p>
        </section>
    )
}
