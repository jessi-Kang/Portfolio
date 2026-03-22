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
    { school: '홍익대학교', degree: '디지털미디어디자인 학사 (GPA 3.49/4.5)', period: '2007.03 ~ 2012.02' },
  ],
  work: [
    {
      company: 'LINE+ Corporation',
      title: 'PO / PM / UX 기획 | ABC Studio, Wallet Platform Plan',
      period: '2020.06 ~ 현재',
      description: '**AI Friends — AI 캐릭터 대화 서비스** (2024.10~현재) — LLM 기반 서비스 PM. 대화 품질 PoC로 DAU +81.8%, 심사 적체 59,277건 전건 해소(974만엔 절감), 2026 상반기 로드맵 수립\n\n**LINE Wallet Tab — Chirashi Module 추천 로직 개선** (2024.02~2025.09) — ML 추천 모델(FROST30) A/B 테스트 설계·검증. CTR +34.6%, UU CTR +81.2%\n\n**GetPoint Phase 6.1 — Wallet 콘텐츠 추천 고도화** (2025.09) — MLP30→FROST30 모델 교체 효과 검증. 전체 KPI 30%↑, Point SUM +29%\n\n**Demaecan Delivery Product Renewal** (2021.03~2022.12) — 배달 프로덕트 전면 리뉴얼(35명). 배달시간 34.8→27.9분, 자동화 0→95%, 운영인력 200→10명\n\n**Demaecan Consumer Product Renewal Plan** (2023.01~2023.04) — Consumer App·Web 리뉴얼 전략 수립, CXO 합의 도출\n\n**Demaecan Front App UX Renovation** (2023.01~2023.04) — Front App UX Renovation 방향 설계 및 경과 보고\n\n**PollWIKI Service Plan** (2020.06~2021.07) — FanWIKI Pivot 방향 수립, 신규 PollWIKI 상세 기획, Clova AI Studio 활용 설계\n\n**VVID Service Plan** (2020.06~2021.02) — Card/Collection Share 기능 설계, App Review·User Voice 수집 기획',
    },
    {
      company: '29CM (AplusB)',
      title: 'PM / UX 기획 | Service Lab.',
      period: '2018.12 ~ 2020.06',
      description: '**첫 구매 쿠폰 개선** — App 주문건수 일평균 681% 증가(58→453건), 전체 쿠폰 사용률 280% 증가, 첫 구매 고객수 13% 증가\n\n**회원 인증 추가** — 본인인증 도입으로 20.2만명 인증 수집, 어뷰징 유저 탐지(동일 DI 58개 계정), 주문 37만건 정보 정제\n\n**멤버십 구조 개선** — 멤버십 혜택 구조 재설계, 리텐션 개선\n\n**쿠폰함 개선** — 쿠폰함 UX 개선, 사용 편의성 향상\n\n**상품 상세 페이지 가격 노출 방식 개선** — 가격 정보 노출 재설계\n\n**로그인/회원가입 이슈 대응**\n\n**파트너 대시보드 개선** — 기능 및 화면 설계\n\n**샘플 리뷰 기능 추가** — 기능 및 화면 설계\n\n**전담 반품 기능 기획** — 3PL 연동\n\n**티켓/숙박 상품(무형 상품) 판매 대응** — 기능 및 화면 설계\n\n**이용약관 및 개인정보 처리방침 개정**\n\n**Admin 개선** — 띠배너 운영툴, LookBook 등',
    },
    {
      company: 'NHN edu',
      title: 'PO / UX 기획 | 서비스 기획팀',
      period: '2016.09 ~ 2018.11',
      description: '**S-CAT 서비스 신설** — 아이엠스쿨 내 신규 서비스 기획·설계\n\n**아이엠스쿨 앱 전체 개편 — 더보기 메뉴** 기획\n\n**아이엠티처 서비스 기획** — Today 영역, 회원 페이지, 자료실\n\n**안심학원 Front Page** 개발\n\n**결제 관리 / SNS 발송 포인트 관리 Admin** 설계\n\n**세금계산서 요청 기능** 설계\n\n**이용약관·개인정보 처리방침 전체 개정**\n\nMobile App 평점 하락 대응 기획 → 앱 평점 상승\n\n서비스 개선 TF 진행 (Usability Test 포함)\n\n**User Feedback 수집 기능** 설계 및 과제화 Flow 마련',
    },
    {
      company: 'Yello Travel',
      title: 'Manager / UX 기획 | UX팀',
      period: '2015.04 ~ 2016.04',
      description: '우리펜션 Web Front·Back Office·펜션주 Admin 설계\n\n우리펜션 Mobile App 및 제주닷컴 Web Renewal PM',
    },
    {
      company: 'Studio April Rain',
      title: '대표 (1인 창업)',
      period: '2014.02 ~ 2015.03',
      description: '아티스트-상품 제작자 중개 B2B/B2C 플랫폼 기획·운영\n\n서울시 창업지원 프로그램 \'챌린지 1000 프로젝트\' 6기 선발',
    },
    {
      company: 'Coupang',
      title: 'UX Design | UX Lab.',
      period: '2013.06 ~ 2014.01',
      description: '**PC Web / Mobile 상품 후기 페이지 개선** 제안\n\n**Mobile PLP 사용성 개선** 제안\n\n**Mobile App 기본 구매 Flow 사용성 연구**\n\n**PC/Mobile PG 통합결제창 사용성 연구**\n\n**PC 상품 상세 페이지(PDP) 쉬운 옵션 선택방법 연구**\n\n**Mobile App PDP 옵션 다중 선택영역 사용성 연구**\n\n**PC/Mobile 할인쿠폰 영역 사용성 연구**\n\n서비스 개선 후 **구매전환율 상승** 달성',
    },
    {
      company: 'SK planet',
      title: 'Manager / UX Design | 위치기반광고사업팀',
      period: '2011.12 ~ 2013.02',
      description: '**Arounders 위치기반 광고 서비스** PM 및 UX 디자인\n\n**Arounders Admin Page 제작** — PM 및 디자인\n\n**Arounders Front Page 제작** — PM 및 디자인\n\n**홍보 영상 및 프린트물 디자인**\n\n**Mobile Web 디자인 및 퍼블리싱**\n\n**퍼블리셔별 광고 Inventory 개선** 제안\n\n서비스 성공적 런칭, Admin Page 사용성 향상',
    },
    {
      company: 'team interface',
      title: '인턴 / UI Design | UI컨설팅사업부',
      period: '2010.07 ~ 2010.08',
      description: '**KT ucloud UI Design** — PC Client UI 디자인, Mobile App Splash View 시안, PC Client 가이드 문서\n\nucloud 리뉴얼 프로젝트 완료',
    },
  ],
  activities: [
    { year: '2026', category: '강연', summary: 'AI Campus Day 사내 강연 멘토' },
    { year: '2014', category: '창업', summary: '서울시 창업지원 프로그램 \'챌린지 1000 프로젝트\' 6기 선발' },
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

// --- About Config ---

const ABOUT_KEY = 'portfolio_about_config'

const defaultAboutConfig = {
  heading: '사용자와 비즈니스 사이의\n균형을 설계합니다',
  bio: '',
  skills: [],
}

export function loadAboutConfig() {
  try {
    const raw = localStorage.getItem(ABOUT_KEY)
    if (raw) return { ...defaultAboutConfig, ...JSON.parse(raw) }
  } catch {}
  return defaultAboutConfig
}

export function saveAboutConfig(config) {
  localStorage.setItem(ABOUT_KEY, JSON.stringify(config))
  cloudSet('about', config)
}

export function resetAboutConfig() {
  localStorage.removeItem(ABOUT_KEY)
  cloudDelete('about')
  return defaultAboutConfig
}

// --- Achievements Config ---

const ACHIEVEMENTS_KEY = 'portfolio_achievements_config'

const defaultAchievementsConfig = {
  items: [],
}

export function loadAchievementsConfig() {
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY)
    if (raw) return { ...defaultAchievementsConfig, ...JSON.parse(raw) }
  } catch {}
  return defaultAchievementsConfig
}

export function saveAchievementsConfig(config) {
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(config))
  cloudSet('achievements', config)
}

export function resetAchievementsConfig() {
  localStorage.removeItem(ACHIEVEMENTS_KEY)
  cloudDelete('achievements')
  return defaultAchievementsConfig
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
