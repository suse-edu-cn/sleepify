import type { Metadata } from 'next'
import 'mdui/mdui.css'
import './globals.css'
import AppShell from '@/components/AppShell'
import AppProviders from '@/components/AppProviders'
import MduiRuntime from '@/components/MduiRuntime'

export const metadata: Metadata = {
    title: '睡了么 Sleepify',
    description: '何导学生的御用小程序，用于对抗 AI 生成的猎奇 App',
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
                <AppProviders>
                    <AppShell>{children}</AppShell>
                </AppProviders>
            </body>
        </html>
    )
}
