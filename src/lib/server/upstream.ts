import axios from 'axios'

export const upstream = axios.create({
    baseURL: 'http://43.136.175.216:8000/api',
    timeout: 10000,
})

export function getAuthHeader(token: string) {
    return {
        Authorization: `Token ${token}`,
    }
}

export function isInvalidTokenError(error: unknown) {
    if (!axios.isAxiosError(error)) {
        return false
    }

    return (
        error.response?.status === 401 &&
        (error.response.data as { detail?: string } | undefined)?.detail === '认证令牌无效。'
    )
}
