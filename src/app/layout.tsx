import type { Metadata, Viewport } from 'next'
import 'mdui/mdui.css'

import './styles/base.css'
import './styles/fonts.css'

import AppShell from '@/components/AppShell'
import AppProviders from '@/components/AppProviders'
import MduiRuntime from '@/components/MduiRuntime'
import PwaRegister from '@/components/PwaRegister'

export const viewport: Viewport = {
    themeColor: '#fef7ff',
}

export const metadata: Metadata = {
    title: '睡了么 Sleepify',
    description: '何导学生的御用小程序，用于对抗 AI 生成的猎奇 App',
    applicationName: 'Sleepify',
    manifest: '/site.webmanifest',
    appleWebApp: {
        capable: true,
        title: 'Sleepify',
        statusBarStyle: 'default',
    },
    icons: {
        icon: [
            { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
            { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
            { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
        shortcut: '/favicon.ico',
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="zh-CN" className="mdui-theme-auto">
            <body>
                <MduiRuntime />
                <PwaRegister />
                <AppProviders>
                    <AppShell>{children}</AppShell>
                </AppProviders>
            </body>
        </html>
    )
}
