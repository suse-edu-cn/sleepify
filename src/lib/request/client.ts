'use client'

import axios, { type AxiosRequestConfig } from 'axios'
import { snackbar } from 'mdui/functions/snackbar.js'
import type { ApiResponse } from '@/lib/request/types'
import { ApiRequestError } from '@/lib/request/types'

const client = axios.create({
    baseURL: '/v1',
    timeout: 10000,
})

const AUTH_ERROR_CODES = new Set([1001, 1002])

client.interceptors.response.use(
    (response) => response,
    (error) => {
        const data = axios.isAxiosError(error)
            ? (error.response?.data as { code?: number; message?: string } | undefined)
            : undefined

        if (data?.code && AUTH_ERROR_CODES.has(data.code)) {
            return Promise.reject(error)
        }

        const message = data?.message || '网络请求失败'

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
        if (!AUTH_ERROR_CODES.has(payload.code)) {
            snackbar({
                message: payload.message || '请求失败',
                closeable: true,
                placement: 'top',
            })
        }

        throw new ApiRequestError(payload.code, payload.message || '请求失败')
    }

    return payload.data
}
