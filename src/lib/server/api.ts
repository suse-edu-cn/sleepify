import { NextResponse } from 'next/server'

type EmptyData = Record<string, never>

type ApiSuccess<T extends object> = {
    code: 0
    message: ''
    data: T
}

type ApiFailure = {
    code: number
    message: string
    data: EmptyData
}

export function success<T extends object>(data: T, status = 200) {
    const payload: ApiSuccess<T> = {
        code: 0,
        message: '',
        data,
    }

    return NextResponse.json(payload, { status })
}

export function fail(code: number, message: string, status = 200) {
    const payload: ApiFailure = {
        code,
        message,
        data: {},
    }

    return NextResponse.json(payload, { status })
}

export function internalError() {
    return fail(5000, '服务器内部错误', 500)
}
