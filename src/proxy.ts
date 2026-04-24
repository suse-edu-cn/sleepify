import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/v1')) {
        return NextResponse.next()
    }

    const token = request.cookies.get('token')?.value

    if (pathname === '/sign') {
        if (token) {
            return NextResponse.redirect(new URL('/', request.url))
        }

        return NextResponse.next()
    }

    if (!token) {
        return NextResponse.redirect(new URL('/sign', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
}
