import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET() {
    try {
        const filePath = join(process.cwd(), 'android-pkg.json')
        const raw = await readFile(filePath, 'utf-8')
        const { url } = JSON.parse(raw)

        return Response.redirect(url, 302)
    } catch {
        return new Response(null, { status: 500 })
    }
}
