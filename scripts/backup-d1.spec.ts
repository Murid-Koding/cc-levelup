import { describe, expect, it } from 'vitest'
import { validateBackupEndpoint } from './backup-d1.mjs'

describe('Backup script validateBackupEndpoint implementation', () => {
  it('accepts valid HTTPS endpoints', () => {
    const res = validateBackupEndpoint('https://api.cclevelup.web.id/api/admin/export')
    expect(res.valid).toBe(true)
    expect(res.parsedUrl?.protocol).toBe('https:')
  })

  it('rejects HTTP for remote domains even with allowInsecure="true"', () => {
    const res = validateBackupEndpoint('http://api.cclevelup.web.id/api/admin/export', 'true')
    expect(res.valid).toBe(false)
    expect(res.error).toContain('BACKUP_API_URL harus menggunakan HTTPS')
  })

  it('allows HTTP on localhost/127.0.0.1/[::1] only when allowInsecure="true"', () => {
    expect(validateBackupEndpoint('http://localhost:3000/api/admin/export', 'true').valid).toBe(
      true
    )
    expect(validateBackupEndpoint('http://127.0.0.1:3000/api/admin/export', 'true').valid).toBe(
      true
    )
    expect(validateBackupEndpoint('http://[::1]:3000/api/admin/export', 'true').valid).toBe(true)

    // Rejects when flag is missing or false
    expect(validateBackupEndpoint('http://localhost:3000/api/admin/export').valid).toBe(false)
    expect(validateBackupEndpoint('http://localhost:3000/api/admin/export', 'false').valid).toBe(
      false
    )
    expect(validateBackupEndpoint('http://localhost:3000/api/admin/export', '0').valid).toBe(false)
  })

  it('rejects non-url string and empty input', () => {
    expect(validateBackupEndpoint('').valid).toBe(false)
    expect(validateBackupEndpoint('not-a-valid-url').valid).toBe(false)
  })
})
