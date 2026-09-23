#!/usr/bin/env node

import { writeFileSync, mkdirSync, renameSync, unlinkSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'

export function validateBackupEndpoint(endpoint, allowInsecure) {
  if (!endpoint || typeof endpoint !== 'string') {
    return { valid: false, error: 'BACKUP_API_URL environment variable wajib disetel.' }
  }

  let parsedUrl
  try {
    parsedUrl = new URL(endpoint)
  } catch {
    return { valid: false, error: `BACKUP_API_URL "${endpoint}" bukan URL yang valid.` }
  }

  if (parsedUrl.protocol === 'https:') {
    return { valid: true, parsedUrl }
  }

  const isLoopback =
    ['localhost', '127.0.0.1', '::1', '[::1]'].includes(parsedUrl.hostname) &&
    parsedUrl.protocol === 'http:'
  const isExplicitlyAllowed = allowInsecure === 'true'

  if (isLoopback && isExplicitlyAllowed) {
    return { valid: true, parsedUrl }
  }

  return {
    valid: false,
    error:
      'BACKUP_API_URL harus menggunakan HTTPS. HTTP hanya diizinkan untuk loopback jika ALLOW_INSECURE_BACKUP=true.'
  }
}

export async function runBackup() {
  const endpoint = process.env.BACKUP_API_URL
  const validation = validateBackupEndpoint(endpoint, process.env.ALLOW_INSECURE_BACKUP)
  if (!validation.valid) {
    console.error(`Error: ${validation.error}`)
    process.exit(1)
  }

  const token = process.env.CF_ACCESS_JWT_ASSERTION || ''
  console.log(`Mengambil cadangan data dari ${endpoint}...`)

  const headers = {
    Accept: 'application/json'
  }
  if (token) {
    headers['cf-access-jwt-assertion'] = token
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000)

  let tempFilePath = null

  try {
    const res = await fetch(endpoint, {
      headers,
      signal: controller.signal,
      redirect: 'error'
    })

    if (!res.ok) {
      throw new Error(`Permintaan gagal dengan status ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()

    // Validate expected tables exist in payload
    const requiredKeys = [
      'sharingSessions',
      'pembicaras',
      'kategoris',
      'sessionKategoris',
      'settings',
      'sessionEvents'
    ]
    for (const key of requiredKeys) {
      if (!Array.isArray(data[key])) {
        throw new Error(
          `Payload cadangan tidak valid: tabel "${key}" tidak ditemukan atau bukan array`
        )
      }
    }

    const backupDir = join(process.cwd(), 'backups')
    mkdirSync(backupDir, { recursive: true, mode: 0o700 })

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const uniqueSuffix = randomBytes(4).toString('hex')
    tempFilePath = join(backupDir, `backup-${timestamp}-${uniqueSuffix}.tmp`)
    const finalFilePath = join(backupDir, `backup-${timestamp}-${uniqueSuffix}.json`)

    // Atomic write with private 0600 mode
    writeFileSync(tempFilePath, JSON.stringify(data, null, 2), {
      encoding: 'utf-8',
      mode: 0o600,
      flag: 'wx'
    })
    renameSync(tempFilePath, finalFilePath)
    tempFilePath = null

    console.log(
      `Berhasil menyimpan cadangan tervalidasi (${data.sharingSessions.length} sesi) ke: ${finalFilePath}`
    )
  } catch (err) {
    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        unlinkSync(tempFilePath)
      } catch {
        // Ignore cleanup failure
      }
    }
    console.error('Gagal menjalankan backup data:', err?.message || err)
    process.exit(1)
  } finally {
    clearTimeout(timeoutId)
  }
}

// Run directly if invoked from CLI
if (process.argv[1]?.endsWith('backup-d1.mjs')) {
  runBackup()
}
