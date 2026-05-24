import Database from 'better-sqlite3'
import path from 'node:path'

const dbPath = path.join(process.cwd(), 'data', 'sleepify.db')
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
