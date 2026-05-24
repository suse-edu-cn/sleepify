import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    allowedDevOrigins: ['10.*.*.*'],
    serverExternalPackages: ['better-sqlite3'],
}

export default nextConfig
