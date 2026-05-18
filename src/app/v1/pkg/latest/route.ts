import { readFile } from 'fs/promises'
import { join } from 'path'
import { internalError, success } from '@/lib/server/api'

type PkgInfo = {
    version: string
    versionCode: number
    message: string
    url: string
}

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'android-pkg.json')
        const raw = await readFile(filePath, 'utf-8')
        const data: PkgInfo = JSON.parse(raw)

        return success(data)
    } catch {
        return internalError()
    }
}
