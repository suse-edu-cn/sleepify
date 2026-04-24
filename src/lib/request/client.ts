'use client'

import axios, { type AxiosRequestConfig } from 'axios'
import { snackbar } from 'mdui/functions/snackbar.js'
import type { ApiResponse } from '@/lib/request/types'
import { ApiRequestError } from '@/lib/request/types'

const client = axios.create({
    baseURL: '/v1',
    timeout: 10000,
})

client.interceptors.response.use(
    (response) => response,
    (error) => {
        const message =
            (axios.isAxiosError(error) &&
                (error.response?.data as { message?: string } | undefined)?.message) ||
            '网络请求失败'

        snackbar({
            message,
            closeable: true,
            placement: 'top',
        })

        return Promise.reject(error)
    }
)

export async function requestApi<T extends object>(config: AxiosRequestConfig): Promise<T> {
    const response = await client.request<ApiResponse<T>>(config)
    const payload = response.data

    if (payload.code !== 0) {
        snackbar({
            message: payload.message || '请求失败',
            closeable: true,
            placement: 'top',
        })

        throw new ApiRequestError(payload.code, payload.message || '请求失败')
    }

    return payload.data
}
