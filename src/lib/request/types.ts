export type ApiResponse<T extends object> = {
    code: number
    message: string
    data: T
}

export class ApiRequestError extends Error {
    code: number

    constructor(code: number, message: string) {
        super(message)
        this.code = code
        this.name = 'ApiRequestError'
    }
}
