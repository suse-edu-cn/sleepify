import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
    allowedDevOrigins: ['10.106.224.246'],
    // assetPrefix: isProd ? 'https://obj.crrashh.com/prod/assets_sleepy' : undefined
}

export default nextConfig
