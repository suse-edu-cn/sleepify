'use client'

import { useEffect } from 'react'

const isProd = process.env.NODE_ENV === 'production'

export default function PwaRegister() {
    useEffect(() => {
        if (!isProd || !('serviceWorker' in navigator)) {
            return
        }

        const register = async () => {
            try {
                await navigator.serviceWorker.register('/sw.js', { scope: '/' })
            } catch (error) {
                console.error('Service worker registration failed', error)
            }
        }

        register()
    }, [])

    return null
}
