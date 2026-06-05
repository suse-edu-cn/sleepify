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

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id    TEXT PRIMARY KEY,
        token      TEXT NOT NULL,
        auto_sleep TEXT,
        active     INTEGER NOT NULL DEFAULT 1
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

// ---- per-user storage ----

export function upsertUser(userId: string, token: string) {
    db.prepare(
        `INSERT INTO users (user_id, token, active)
         VALUES (?, ?, 1)
         ON CONFLICT(user_id) DO UPDATE SET token = excluded.token, active = 1`
    ).run(userId, token)
}

export function getUser(userId: string) {
    return db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId) as
        | { user_id: string; token: string; auto_sleep: string | null; active: number }
        | undefined
}

export function getAllAutoSleepUsers() {
    return db
        .prepare('SELECT * FROM users WHERE active = 1 AND auto_sleep IS NOT NULL')
        .all() as Array<{ user_id: string; token: string; auto_sleep: string; active: number }>
}

export function setUserAutoSleep(userId: string, config: string) {
    db.prepare('UPDATE users SET auto_sleep = ? WHERE user_id = ?').run(config, userId)
}

export function getUserAutoSleep(userId: string) {
    const row = db
        .prepare('SELECT auto_sleep FROM users WHERE user_id = ?')
        .get(userId) as { auto_sleep: string | null } | undefined
    return row?.auto_sleep ?? null
}

export function deactivateUser(userId: string) {
    db.prepare('UPDATE users SET active = 0 WHERE user_id = ?').run(userId)
}

if (!getConfig('ecc_private_key')) {
    const { privateKey, publicKey } = generateKeyPair()
    setConfig('ecc_private_key', privateKey)
    setConfig('ecc_public_key', publicKey)
    console.log('[db] ECC 密钥对已生成')
}
