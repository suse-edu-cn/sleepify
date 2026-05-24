import Database from 'better-sqlite3'
import path from 'node:path'
import fs from 'node:fs'
import { generateKeyPair } from '@/lib/crypto/ecc'

const dataDir = path.join(process.cwd(), 'data')
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'sleepify.db')
const db = new Database(dbPath)

db.exec(`
    CREATE TABLE IF NOT EXISTS config (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
    )
`)

export function getConfig(key: string): string | null {
    const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key) as
        | { value: string }
        | undefined
    return row?.value ?? null
}

export function setConfig(key: string, value: string) {
    db.prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)').run(key, value)
}

export function removeConfig(key: string) {
    db.prepare('DELETE FROM config WHERE key = ?').run(key)
}

if (!getConfig('ecc_private_key')) {
    const { privateKey, publicKey } = generateKeyPair()
    setConfig('ecc_private_key', privateKey)
    setConfig('ecc_public_key', publicKey)
    console.log('[db] ECC 密钥对已生成')
}
