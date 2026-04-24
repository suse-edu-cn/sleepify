'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { alert } from 'mdui/functions/alert.js'

type AppShellProps = {
    children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
    const pathname = usePathname()
    const router = useRouter()
    const navValue =
        pathname === '/' || pathname === '/ranking' || pathname === '/info' ? pathname : ''

    return (
        <div className="sleepy-shell">
            <mdui-top-app-bar className="sleepy-top-bar">
                <mdui-top-app-bar-title className="sleepy-top-title">Sleepy</mdui-top-app-bar-title>
            </mdui-top-app-bar>

            <main className="sleepy-content">{children}</main>

            <mdui-navigation-bar className="sleepy-bottom-nav" value={navValue}>
                <mdui-navigation-bar-item
                    value="/"
                    onClick={() => {
                        if (pathname !== '/') {
                            router.push('/')
                        }
                    }}
                >
                    <mdui-icon-home slot="icon" />
                    首页
                </mdui-navigation-bar-item>

                <mdui-navigation-bar-item
                    value="/ranking"
                    onClick={() => {
                        void alert({
                            headline: '排行榜',
                            description: '正在开发中......',
                            confirmText: '知道了',
                        })
                    }}
                >
                    <mdui-icon-align-vertical-bottom slot="icon" />
                    排行榜
                </mdui-navigation-bar-item>

                <mdui-navigation-bar-item
                    value="/info"
                    onClick={() => {
                        if (pathname !== '/info') {
                            router.push('/info')
                        }
                    }}
                >
                    <mdui-icon-account-circle slot="icon" />
                    我的
                </mdui-navigation-bar-item>
            </mdui-navigation-bar>
        </div>
    )
}
