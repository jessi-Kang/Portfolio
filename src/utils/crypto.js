import { cloudSet, cloudDelete } from './db'

const ADMIN_KEY = 'portfolio_admin_hash'
const TOKENS_KEY = 'portfolio_access_tokens'
const ADMIN_SESSION_KEY = 'portfolio_admin_session'
const ACCESS_LOG_KEY = 'portfolio_access_log'
const HERO_KEY = 'portfolio_hero_config'

// --- PBKDF2 helpers (Web Crypto API) ---

async function deriveKey(password, salt) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: enc.encode(salt), iterations: 310000, hash: 'SHA-256' },
    keyMaterial,
    256,
  )
  return Array.from(new Uint8Array(bits)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateSalt() {
  const buf = new Uint8Array(32)
  crypto.getRandomValues(buf)
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateToken() {
  const buf = new Uint8Array(24)
  crypto.getRandomValues(buf)
  return Array.from(buf).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function generateSessionId() {
  return generateToken()
}

// --- Admin Passcode ---

// Build-time embedded credentials (from .env)
const ENV_SALT = import.meta.env.VITE_ADMIN_SALT || ''
const ENV_HASH = import.meta.env.VITE_ADMIN_HASH || ''
const hasEnvAdmin = !!(ENV_SALT && ENV_HASH)

export function isAdminSetup() {
  if (hasEnvAdmin) return true
  return !!localStorage.getItem(ADMIN_KEY)
}

export function isEnvAdmin() {
  return hasEnvAdmin
}

// Admin URL path — derived from hash to prevent guessing
export const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || (ENV_HASH ? ENV_HASH.slice(0, 12) : 'admin')

export async function setupAdminPasscode(passcode) {
  const salt = generateSalt()
  const hash = await deriveKey(passcode, salt)
  localStorage.setItem(ADMIN_KEY, JSON.stringify({ salt, hash }))
}

export async function verifyAdminPasscode(passcode) {
  // Check env-embedded credentials first
  if (hasEnvAdmin) {
    const attempt = await deriveKey(passcode, ENV_SALT)
    if (attempt === ENV_HASH) return true
  }
  // Fallback to localStorage
  const stored = localStorage.getItem(ADMIN_KEY)
  if (!stored) return false
  const { salt, hash } = JSON.parse(stored)
  const attempt = await deriveKey(passcode, salt)
  return attempt === hash
}

export function createAdminSession() {
  const id = generateSessionId()
  const expires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ id, expires }))
}

export function isAdminSessionValid() {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY)
  if (!raw) return false
  const { expires } = JSON.parse(raw)
  if (Date.now() > expires) {
    localStorage.removeItem(ADMIN_SESSION_KEY)
    return false
  }
  return true
}

export function clearAdminSession() {
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

export function resetAdminPasscode() {
  localStorage.removeItem(ADMIN_KEY)
  localStorage.removeItem(ADMIN_SESSION_KEY)
}

// --- Visitor Access Tokens ---

export function getAccessTokens() {
  try {
    const raw = localStorage.getItem(TOKENS_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveAccessTokens(tokens) {
  localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  cloudSet('tokens', { items: tokens })
}

export function createAccessToken(label, expiresAt) {
  const token = generateToken()
  const tokens = getAccessTokens()
  tokens.push({
    id: crypto.randomUUID(),
    label,
    token,
    createdAt: Date.now(),
    expiresAt: new Date(expiresAt).getTime(),
    forceExpired: false,
  })
  saveAccessTokens(tokens)
  return token
}

export function revokeAccessToken(id) {
  const tokens = getAccessTokens().filter((t) => t.id !== id)
  saveAccessTokens(tokens)
}

export function forceExpireToken(id) {
  const tokens = getAccessTokens().map((t) =>
    t.id === id ? { ...t, forceExpired: true } : t,
  )
  saveAccessTokens(tokens)
}

export function verifyAccessToken(input) {
  const tokens = getAccessTokens()
  const now = Date.now()
  const match = tokens.find(
    (t) => t.token === input && t.expiresAt > now && !t.forceExpired,
  )
  if (!match) return null
  return { id: match.id, label: match.label, expiresAt: match.expiresAt }
}

// --- Access Log ---

export function getAccessLog() {
  try {
    const raw = localStorage.getItem(ACCESS_LOG_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return []
}

function saveAccessLog(log) {
  localStorage.setItem(ACCESS_LOG_KEY, JSON.stringify(log))
  cloudSet('access_log', { items: log })
}

export function recordAccess(tokenId, tokenLabel) {
  const log = getAccessLog()
  log.push({
    tokenId,
    tokenLabel,
    accessedAt: Date.now(),
    userAgent: navigator.userAgent,
    language: navigator.language,
  })
  saveAccessLog(log)
}

export function getAccessLogForToken(tokenId) {
  return getAccessLog().filter((entry) => entry.tokenId === tokenId)
}

export function clearAccessLog() {
  localStorage.removeItem(ACCESS_LOG_KEY)
  cloudDelete('access_log')
}

// --- AuthGate Config ---

const AUTH_GATE_KEY = 'portfolio_authgate_config'

const defaultAuthGateConfig = {
  tagline: 'PM Portfolio',
  headline: 'ML로 행동을 예측하고,\nLLM으로 대화를 설계합니다',
  subtitle: '데이터로 행동을 예측하고, 점점 더 사람에 가까운 AI를 만들어온 PM',
  cardTitle: '접속 코드 입력',
  cardDescription: '포트폴리오 열람을 위한 인증이 필요합니다',
  buttonText: '포트폴리오 열람',
  contactEmail: 'jihyun.kang@me.com',
  contactMessage: '접속 코드가 없으신가요?',
  contactHint: '위 이메일로 접속 코드를 요청해 주세요',
}

export function loadAuthGateConfig() {
  try {
    const raw = localStorage.getItem(AUTH_GATE_KEY)
    if (raw) return { ...defaultAuthGateConfig, ...JSON.parse(raw) }
  } catch {}
  return defaultAuthGateConfig
}

export function saveAuthGateConfig(config) {
  localStorage.setItem(AUTH_GATE_KEY, JSON.stringify(config))
  cloudSet('authgate', config)
}

export function resetAuthGateConfig() {
  localStorage.removeItem(AUTH_GATE_KEY)
  cloudDelete('authgate')
  return defaultAuthGateConfig
}

// --- Resume Config ---

const RESUME_KEY = 'portfolio_resume_config'

export const defaultResumeConfig = {
  education: [
    { school: '', degree: '', period: '' },
  ],
  work: [
    { company: '', title: '', period: '', description: '' },
  ],
  activities: [
    { year: '', category: '', summary: '' },
  ],
  selfIntro: '',
}

export function loadResumeConfig() {
  try {
    const raw = localStorage.getItem(RESUME_KEY)
    if (raw) return { ...defaultResumeConfig, ...JSON.parse(raw) }
  } catch {}
  return defaultResumeConfig
}

export function saveResumeConfig(config) {
  localStorage.setItem(RESUME_KEY, JSON.stringify(config))
  cloudSet('resume', config)
}

export function resetResumeConfig() {
  localStorage.removeItem(RESUME_KEY)
  cloudDelete('resume')
  return defaultResumeConfig
}

// --- Hero Config ---

const defaultHeroConfig = {
  tagline: 'PM Portfolio',
  headline: 'ML로 행동을 예측하고, LLM으로 대화를 설계합니다',
  subtitle: '데이터로 행동을 예측하고, 점점 더 사람에 가까운 AI를 만들어온 PM',
  ctaText: '케이스 보기',
}

export function loadHeroConfig() {
  try {
    const raw = localStorage.getItem(HERO_KEY)
    if (raw) return { ...defaultHeroConfig, ...JSON.parse(raw) }
  } catch {}
  return defaultHeroConfig
}

export function saveHeroConfig(config) {
  localStorage.setItem(HERO_KEY, JSON.stringify(config))
  cloudSet('hero', config)
}

export function resetHeroConfig() {
  localStorage.removeItem(HERO_KEY)
  cloudDelete('hero')
  return defaultHeroConfig
}

// --- Contact Config ---

const CONTACT_KEY = 'portfolio_contact_config'

const defaultContactConfig = {
  heading: 'Contact',
  message: '함께 일하고 싶으시다면 연락주세요.',
  email: 'hello@example.com',
  linkedinUrl: 'https://linkedin.com/in/',
  linkedinLabel: 'LinkedIn',
  copyright: '© 2026. All rights reserved.',
}

export function loadContactConfig() {
  try {
    const raw = localStorage.getItem(CONTACT_KEY)
    if (raw) return { ...defaultContactConfig, ...JSON.parse(raw) }
  } catch {}
  return defaultContactConfig
}

export function saveContactConfig(config) {
  localStorage.setItem(CONTACT_KEY, JSON.stringify(config))
  cloudSet('contact', config)
}

export function resetContactConfig() {
  localStorage.removeItem(CONTACT_KEY)
  cloudDelete('contact')
  return defaultContactConfig
}
