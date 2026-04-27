'use client'

import type { ReactNode } from 'react'
import { usePathname, useRouter } from 'next/navigation'

type AppShellProps = {
    children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
    const pathname = usePathname()
    const router = useRouter()
    const navValue =
        pathname === '/' || pathname === '/ranking' || pathname === '/info' ? pathname : ''
    const isSignPage = pathname === '/sign'

    return (
        <div className="sleepify-shell">
            <mdui-top-app-bar className="sleepify-top-bar" suppressHydrationWarning>
                <mdui-top-app-bar-title className="sleepify-top-title">
                    睡了么
                </mdui-top-app-bar-title>
            </mdui-top-app-bar>

            <main className="sleepify-content">{children}</main>

            {!isSignPage && (
                <mdui-navigation-bar className="sleepify-bottom-nav" value={navValue}>
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
                            if (pathname !== '/ranking') {
                                router.push('/ranking')
                            }
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
            )}
        </div>
    )
}
