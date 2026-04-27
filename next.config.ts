import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
    allowedDevOrigins: ['10.106.*.*'],
    assetPrefix: isProd ? 'https://obj.crrashh.com/prod/assets_sleepify' : undefined,
}

export default nextConfig
