#!/usr/bin/env node
/**
 * Admin 패스코드 해시 생성 스크립트
 * 사용: node scripts/gen-admin-hash.mjs
 *
 * 생성된 값을 .env 파일에 추가하세요:
 *   VITE_ADMIN_SALT=...
 *   VITE_ADMIN_HASH=...
 */

import { webcrypto } from 'node:crypto'
import * as readline from 'node:readline'

const rl = readline.createInterface({ input: process.stdin, output: process.stderr })
const ask = (q) => new Promise((r) => rl.question(q, r))

async function deriveKey(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await webcrypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await webcrypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 310000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateSalt() {
  const buf = new Uint8Array(32)
  webcrypto.getRandomValues(buf)
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('')
}

const passcode = await ask('관리자 패스코드를 입력하세요 (최소 8자): ')
rl.close()

if (passcode.length < 8) {
  console.error('패스코드는 최소 8자 이상이어야 합니다.')
  process.exit(1)
}

const salt = generateSalt()
const hash = await deriveKey(passcode, salt)

console.log(`\nVITE_ADMIN_SALT=${salt}`)
console.log(`VITE_ADMIN_HASH=${hash}`)
console.log(`\n위 값을 .env 파일에 추가한 후 다시 빌드하세요.`)
