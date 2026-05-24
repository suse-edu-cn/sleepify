import { fail, success } from '@/lib/server/api'
import { getConfig } from '@/lib/db'

export async function GET() {
    const publicKey = getConfig('ecc_public_key')
    if (!publicKey) {
        return fail(5000, '服务器未初始化')
    }

    return success({ publicKey })
}
