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

export function renameAccessToken(id, newLabel) {
  const tokens = getAccessTokens().map((t) =>
    t.id === id ? { ...t, label: newLabel } : t,
  )
  saveAccessTokens(tokens)
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
  headline: 'Data-driven decisions,\nUser-centric design',
  subtitle: 'A product manager who drives growth through data-driven decisions and user-centric design',
  cardTitle: 'Enter Access Code',
  cardDescription: 'Authentication is required to view the portfolio',
  buttonText: 'View Portfolio',
  contactEmail: 'jihyun.kang@me.com',
  contactMessage: "Don't have an access code?",
  contactHint: 'Request one via the email above',
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
      title: 'Product Manager | ABC Studio, Wallet Platform Plan',
      period: '2020.06 ~ 현재',
      leaveNote: '휴직 2023.10.13 ~ 2024.01.01',
      projects: [
        {
          title: 'LINE - AI Friends Product Management',
          period: '2025.10 - 현재',
          role: 'PM',
          team: '약 40명',
          summary: `- 문제 상황\n  - 서비스 업력 1년에 인접하였으나 서비스 볼륨이 상승하지 않고 유지되는 상황\n  - 유료화 적용 이후 급격한 리텐션 지표 하락 가속\n  - 서비스 구축을 위주로 한 다수의 시스템 구조적 한계 확인\n- 솔루션\n  - 주요 지표 개선을 위한 2026년 전략 및 주요 정책 수립\n    - 서비스 Core의 빠른 개선을 위한 PoC 체제 수립 및 진행\n    - 리텐션 상승을 위한 대화 품질 개선 전략 수립(Prompt 개선)\n    - 서비스 구조 한계 돌파를 위한 PoC\n  - 캐릭터 심사 적체 해소를 위한 개선 과제 진행 (일괄 심사 추가)`,
          result: `- 일괄 심사 추가\n  - 캐릭터 심사 적체 59,277건 전건 해소\n  - 974만엔 운영 비용 절감\n  - 14.7MM 운영 인력 절감\n- 대화 품질 개선 PoC\n  - DAU +81.8%\n  - 신규 유입 +101.9%\n  - 메시지 수 +68.5%\n  - 기존 유저 리텐션 +10%↑`,
        },
        {
          title: 'LINE Wallet Tab - GetPoint Module Recommendation Logic Improvement',
          period: '2025.7 - 2025.9',
          role: 'PM',
          team: '2명',
          summary: `- 문제 상황\n  - Wallet 탭(현 MINI 탭) 내에 효율이 좋은 Module이나 오랜 기간 지표가 정체된 상태\n- 솔루션\n  - LINE App 내 Wallet Tab에 표시되는 모듈 중 하나인 GetPoint Module(현재 일본 내에서만 표시)의 캠페인 추천 효율 증대를 위한 개선\n  - ML (Machine Learning) Logic 설계 (Frost30)\n  - User Segment에 따라 A/B Test를 통한 검증 수행`,
          result: `- CTR +34.6%(Warm 유저 CTR +126%)\n- UU CTR +81.2%\n- 일 클릭수 +39.7%`,
        },
        {
          title: 'LINE Wallet Tab - Chirashi Module Recommendation Logic Improvement',
          period: '2024.2 - 2025.5',
          role: 'PM',
          team: '3명',
          summary: `- 문제 상황\n  - CTR은 높으나 유저 볼륨 자체가 타 모듈 대비 매우 적은 상태\n- 솔루션\n  - LINE App 내 Wallet Tab에 표시되는 모듈 중 하나인 Chirashi Module(현재 일본 내에서만 표시)의 콘텐츠 효율 증대를 위한 개선\n  - Chirashi(전단지) 개인화 추천 개선을 위한 추천 로직 개선\n  - ML (Machine Learning) 또는 Rule Base로 Logic 설계\n  - User Segment에 따라 A/B Test를 통한 검증 수행`,
          result: null,
        },
        {
          title: 'Demaecan \'Consumer Product\' Renewal Plan',
          period: '2023.1 - 2023.4',
          role: 'PO, 개선 방향 기획',
          team: '12명 (한, 일)',
          summary: `- 문제 상황\n  - 일본 도도부현 내 Uber Eats와의 경쟁에서 밀리는 상황\n- 솔루션\n  - 기존 서비스를 쇄신할 Demaecan Service (Consumer Side) Mobile App, Web 전체 개선 방향 및 전략 수립\n  - 수립한 전략으로 Renewal 방향을 합의하여 전체 인식 통일 (with Demaecan CXO)`,
          result: null,
        },
        {
          title: 'Demaecan \'Delivery Product\' Renewal',
          period: '2021.3 - 2022.8 (2022.12까지 추가 개선 진행)',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '35명 (한, 일)',
          summary: `- 문제 상황\n  - 서비스 전체적으로 20년 전 형태 유지\n  - 배달원의 선택에 의한 다건 배달로 인해 긴 배달 소요시간\n  - 전체 수동 운영으로 인한 많은 운영 인력(200명 가량)\n- 솔루션\n  - Driver App 전체 Renewal 및 운영 진행\n  - Broadcast 배차 방식에서 ML을 통한 자동 배차로 변경 (Delivery Engine) 적용\n  - 배달 시간이 증가하지 않는 다건 배달 수 파악 및 ML을 통한 오더 매치 적용 (한 번에 최대 2건 배달)\n  - 주문량 및 배달 기사의 비율을 고려한 ML Data를 통해 배달 기사를 효율적으로 분포할 수 있는 Heat Map을 App 내 제공\n  - Controller Web (Admin) 개선 방향 설계 (Product Renewal 및 자동화)\n  - User Feedback 도입 기획 설계 및 Web Admin 기획, 설계, 운영`,
          result: `- 서비스 전체 리뉴얼 후 2022년 8월 성공적인 전국 전개 완료(일본 전체 적용)\n- 배달시간 대폭 단축 : 2022년 7월 기준 34.8분 → 27.9분\n- 시스템 자동화 : 0%에서 95%\n  - 인력 비용 감소 : 운영인력 200여명(직접 고용) → 10명(외주 계약)\n- 서비스 기대감 상승 : User feedback을 반영하여 서비스를 개선하여 사용자의 적극적인 목소리가 증가하고 Youtube 등을 통해 기대를 표출하는 사용자가 발생 (당시 일평균 100여건, 많게는 400여건 feedback 등록\n- 서비스 개선 프로세스 변경 : 서비스 개선 시 적극적으로 user feedback을 적용하는 형태로 변경`,
        },
        {
          title: 'PollWIKI Service Plan',
          period: '2020.6 - 2021.7',
          role: '개선 방향 기획, 기능 및 화면 설계',
          team: '6명',
          summary: `- 문제 상황\n  - 기존 FanWIKI 서비스의 운영이 지지부진하여 Pivot이 필요한 상황\n- 솔루션\n  - 기존 Fanwiki 서비스 현황 분석 및 리서치\n  - 서비스 Pivot을 위한 방향 모색 및 리서치\n  - 신규 Fanwiki (PollWIKI) 서비스 상세 기획 및 설계\n  - 사용자가 직접 등록하는 Artist 정보 외에 AI를 활용한 정보 등록 (Clova AI Studio 활용)\n- 결과\n  - Pivot 진행 중 서비스 종료`,
          result: null,
        },
        {
          title: 'VVID Service Plan',
          period: '2020.6 - 2021.2',
          role: '개선 방향 기획, 기능 및 화면 설계',
          team: '3명',
          summary: `- Card, Collection Complete Share 기능 설계\n- App Review 및 User Voice 수집 기능 기획 및 설계\n- VVID 운영 및 개선 방향 Research`,
          result: null,
        },
      ],
    },
    {
      company: '29CM (AplusB)',
      title: 'PM / UX 기획 | Service Lab.',
      period: '2018.12 ~ 2020.06',
      projects: [
        {
          title: '상품 상세 페이지 내 가격 노출 방식 개선',
          period: '2020.2 - 2020.6',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '1명 (기획중 상태)',
          summary: `- 문제 상황\n  - 사용자가 혜택을 받을 수 있는 정확한 가격을 확인하기 어려움\n- 솔루션\n  - 로그인 상태에 따른 최대 할인가 표시 정책 설계 (등급별 고정 할인 혜택 적용)\n  - 실제 보유 혜택을 사용한 실 결제 금액 확인 영역 추가\n  - 최대 혜택을 자동 적용 및 표시하고, 추가로 받을 수 있는 쿠폰 다운로드 기능 추가\n  - 상품 금액에 할인 및 마일리지 적용 산식 개선 (환불/취소, 정산 포함)`,
          result: null,
        },
        {
          title: '로그인/회원가입 관련 이슈 대응',
          period: '2020.2 - 2020.6',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '2명 (개발 담당 지정 전 상태)',
          summary: `- 문제 상황\n  - 가입 방법의 오인으로 인한 로그인/계정 찾기 실패 빈번\n- 솔루션\n  - 로그인/회원가입 시 SNS 가입을 명확히 인지할 수 있도록 개선\n  - 계정찾기 시 SNS 가입 계정임을 정확하게 안내하고 로그인 방식을 안내\n  - 휴대폰 정보가 불명확한 회원이 계정을 찾을 수 있도록 이메일 인증 추가\n  - 가입 시 기가입된 계정에 대한 안내 표시\n  - 첫 구매 혜택 적용 대상을 확인하여 해당 대상에게만 혜택을 지급하도록 구조 개선`,
          result: null,
        },
        {
          title: '쿠폰함 개선',
          period: '2019.12 - 2020.6',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '2명 (개발 담당 지정 전)',
          summary: `- 문제 상황\n  - 많은 쿠폰 종류로 인해 사용자가 쿠폰함에서 원하는 쿠폰을 찾기 어려움\n- 솔루션\n  - 쿠폰 상태별로 쿠폰 분리\n  - 쿠폰 상세내용 표시 및 사용하지 않는 쿠폰 삭제 기능 추가\n  - 쿠폰함 내에 받을 수 있는 쿠폰 표시 기능 추가\n  - 추천 쿠폰 기능 추가 및 운영 툴 기획\n  - 만료 임박 쿠폰 표시 및 사용 유도\n  - 쿠폰 연관 상품 페이지 연결 기능 추가`,
          result: null,
        },
        {
          title: '멤버십 개선',
          period: '2019.2 - 2019.3 / 2019.11 - 2020.6',
          role: 'PM, 개선 방향 기획, 혜택 구조 설계',
          team: '2명',
          summary: `- 문제 상황\n  - 사용형태와 관계 없이 모든 회원 등급에 많은 혜택을 주는 상태\n  - 그에 반해 실제 VIP는 적정한 혜택을 받지 못하는 구조\n  - 체리 피커에게 유리한 혜택 구조(휴면 상태의 고객에게 혜택을 주어 여러 아이디로 혜택을 취하는 행태)\n- 솔루션\n  - 혜택으로 인한 불필요한 비용 지출을 줄이고 효율적으로 고객을 Lock-in 할 수 있는 멤버십 구조 설계 목적\n  - 첫 구매부터 3번 이상의 구매를 빠르게 이끌어 낼 수 있도록 혜택 설계\n  - 충성 고객을 유지할 수 있는 VIP 라운지 등 프리미엄 혜택 설계\n  - 추가 혜택 제공을 위한 기능 및 정책 설계 (정액 쿠폰, 배송비 쿠폰, 마일리지 정책, 등급별 고정 할인 등)\n  - 멤버십 개선 효과를 극대화 하기 위한 서비스 영역 기획 설계 진행 (쿠폰함, 상품 상세 페이지, 주문서, 마이 페이지 개선)`,
          result: null,
        },
        {
          title: '회원 인증 추가',
          period: '2019.5 - 2019.10',
          role: 'PO, 개선 방향 기획, 화면 설계, 정책 개선, QA',
          team: '6명',
          summary: `- 문제 상황\n  - 인증 체계 부재로 사용자당 계정 보유수가 상당한 상태(체리피커, 어뷰져)\n  - 인증 없이 취한 정보로 인해 정확한 고객층에 대한 데이터 부재\n- 솔루션\n  - 신규/기존 가입 회원에 인증을 수집할 수 있는 Flow 추가 (회원가입/회원정보 수정 페이지 개선)\n  - 미성년자 개인정보 취급 이슈 대응 : 미성년자 확인 및 법정 대리인 동의 Flow 추가\n  - 주문/결제 관련 분쟁 시 대응 : 회원정보로 주문자 정보 일원화, 주문서 단계에서 회원정보 정제 후 주문 진행 Flow 추가\n  - 계정 타입별 정책 개선 및 관련 이슈 대응`,
          result: `- 인증 수집률 : 전체 회원 중 10%(202,189명) 가량 인증 수집. 그 중 103명의 미성년자 확인. (2020년 1월 7일 - 배포 80여일째 데이터 확인)\n- 주문건의 주문자 정보 정제 : 2019년 10월 14일 배포 이후 ~ 2020년 1월 7일까지 주문건 기준 371,559건의 주문자 정보 정제\n- 악성(어뷰징) 유저에 대한 정확한 파악 : 동일 DI로 58개, 22개 계정 인증 회원 및 정보 도용 사례 확인\n- 1월 7일 기준 전체 SNS 가입 유저의 46%(472,886명) 정보 정제`,
        },
        {
          title: '파트너 대시보드 개선',
          period: '2019.4 - 2019.6',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '4명',
          summary: `- 문제 상황\n  - 반품이 복잡하여 사용자의 클레임 다수 접수\n- 솔루션\n  - 반품 접수 및 철회 정책 재설계\n  - 굿스플로 전담 반품을 통한 반품 접수가 가능하도록 서비스 내 접수 Flow 설계\n  - 반품 방법 및 귀책 사유에 따른 반품 비용 정산 정책 설계\n  - 반품 상세 정보 페이지 추가 (Front)`,
          result: null,
        },
        {
          title: '\'샘플 리뷰\' 기능 추가',
          period: '2019.5 - 2019.7',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '4명',
          summary: `- 문제 상황\n  - 다수의 체험 이벤트를 진행하고 있으나 이벤트의 결과를 데이터로 활용하지 못하는 상황\n- 솔루션\n  - 체험 이벤트를 통해 상품을 이용한 고객에게 리뷰를 수집할 수 있는 기능 추가 (Front, Back)\n  - 리뷰 등록 페이지 개선을 통해 기존 상품 구매 리뷰와 분리하여 등록 관리 할 수 있도록 권한 및 등록 Flow 설계\n  - 이벤트 당첨자 선정 및 리뷰 작성 권한을 부여할 수 있는 기능 설계`,
          result: `신규 Event type 진행 가능`,
        },
        {
          title: '전담 반품 기능 기획',
          period: '2019.4 - 2019.6',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '4명',
          summary: null,
          result: null,
        },
        {
          title: '티켓, 숙박 상품(무형 상품) 판매 대응',
          period: '2019.1 - 2019.3',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '7명',
          summary: `- 문제 상황\n  - 무형 상품 판매 니즈가 있으나 현재 시스템 구조로 어려운 상황\n- 솔루션\n  - 무형 상품 타입 추가 : 티켓, 숙박(숙박권)\n  - 기존 유형 상품(배송) 타입 주문 Flow 구조를 개선하지 않고 무형 상품 처리 방식 설계\n  - 배송이 되지 않는 무형 상품의 정산 기준 설정 및 어드민 내 티켓 확인 기능 추가\n  - 무형 상품 기준 알림톡 발송 내용 변경\n  - 동반자 정보 수집 및 확인 기능 추가 (Front, Admin 공통)`,
          result: `티켓 상품 판매 관련 파트너 불편 감소`,
        },
        {
          title: '이용약관 및 개인정보 처리방침 개정',
          period: '2019.1 - 2019.2',
          role: '문서 개정 및 개정내용 고지, 문서 관리 방식 정의',
          team: '2명',
          summary: `- 문제 상황\n  - 약관 및 개인정보 처리방침이 서비스 개선 상황과 현행법에 맞지 않는 상황\n- 솔루션\n  - 업데이트되지 않던 기존 문서를 전체 개정 (v2.0으로 표기)\n  - 현재까지의 서비스 변화 및 이후 확장에 대응한 이용약관 및 개인정보 처리방침 작업 (정보통신망법, 전자상거래법, 청소년 보호법 대응)\n  - 버전별 문서 관리 체계 마련 및 개정안 고지 Flow 구축\n  - 개인정보를 제공받은 상품 판매 제휴업체를 지속 운영하도록 별도 문서로 분리 (개인정보 제3자 제공)`,
          result: null,
        },
        {
          title: '첫 구매 쿠폰 개선',
          period: '2018.12 - 2019.03',
          role: 'PM, 개선 방향 기획, 기능 및 화면 설계',
          team: '7명',
          summary: `- 문제 상황\n  - 첫 구매 쿠폰 혜택이 매우 큰 반면 사용자가 혜택을 인지하지 못하는 상황\n  - Web보다 App 구매를 유도하려는 의도와 다르게 Web에서 더 많이 혜택을 받는 구조\n- 솔루션\n  - 기존 Green 등급 혜택 정리 및 첫 구매 혜택 재설계 (APP 구매 유도)\n  - 가입 완료 시점에 첫 구매 혜택을 인지하도록 유도\n  - 첫 구매 완료 후 재구매를 유도하기 위한 장치 마련 (Lock-in 요소)`,
          result: `(개선 적용 20여일 후 기준)\n- APP 첫구매 쿠폰 사용 주문건수 : 일평균 681%(58→ 453건) 증가\n- Web 첫구매 쿠폰 사용 주문건수 : 일평균 36% 증가\n- 웹/앱 전체 일평균 쿠폰 사용률 : 280% 증가\n- 첫구매 쿠폰 사용 비중이 APP 75% : Web 25%로 앱을 통한 첫구매 유도 목적 달성\n- 첫구매 고객수 : 기존 대비 13% 증가`,
        },
      ],
      otherProjects: `- 2020.2–3 배송비 쿠폰 설계
- 2020.1 마일리지 적립 쿠폰 설계
- 2019.11 마일리지 선지급 기능 설계
- 2019.8 룩북 등록 및 정렬 방식 개선
- 2019.7–9 3PL 연동
- 2019.3–4 정액 쿠폰 설계
- 2019.1–2 해외배송 상품 판매 대응 (개인통관고유부호 수집)
- 2019.1 Admin 띠배너 운영툴 설계`,
    },
    {
      company: 'NHN edu',
      title: 'PO / UX 기획 | 서비스 기획팀',
      period: '2016.09 ~ 2018.11',
      projects: [
        {
          title: '아이엠스쿨 앱 전체 개편 - \'더보기\' 메뉴',
          period: '2018.06 - 2018.09',
          role: '기획, 화면설계',
          team: '8명',
          summary: `- '자녀 설정' 메뉴 신규 추가 기획\n- '내 계정' 메뉴 및 회원 페이지 기획\n- 프로모션 영역 확보 및 기존 메뉴 항목 정리`,
          result: null,
        },
        {
          title: 'S-CAT 서비스 신설',
          period: '2018.04 - 2018.11',
          role: 'PM, 신규 서비스 기획, 화면설계',
          team: '8명',
          summary: `- 문제 상황\n  - 서비스 내 알림장 열람 외 학무모의 흥미를 끌 기능의 부재\n- 솔루션\n  - 해피마인드의 CAT검사(종합주의력검사)를 약식 모바일 버전으로 기획\n  - 대면 가이드 없이 검사를 진행할 수 있도록 준비과정과 연습단계 추가\n  - 결과 리포트를 모바일 버전으로 재구성하고, 상담으로 이어질 수 있도록 설계`,
          result: null,
        },
        {
          title: '아이엠티처(Web) Today 영역 기획',
          period: '2018.03 - 2018.04',
          role: '신규 서비스 기획, 화면설계',
          team: '8명',
          summary: `- 메인 페이지에 노출할 날씨 및 미세먼지 정보 영역 기획\n- 오늘의 훈화, 역사 속 오늘 노출 영역 기획`,
          result: null,
        },
        {
          title: '아이엠티처 회원 페이지 기획',
          period: '2017.12 - 2018.03',
          role: '서비스 기획, 화면설계',
          team: '5명',
          summary: `- 스쿨 관리자, 유니원 학교용, 아이엠티처 서비스의 회원 연결\n- 회원 통합 시 영향을 받는 스쿨 관리자의 기능 수정(관리 학교 수 제한, 중복 제거)\n- 스쿨 관리자, 유니원 학교용 회원의 로그인을 허용하고, 통합을 위한 추가 정보 수집 위주 기획\n- 기능 사용 제한 케이스별 안내 페이지 구성`,
          result: null,
        },
        {
          title: '아이엠티처 자료실 서비스 기획',
          period: '2017.10 - 2018.03',
          role: 'PM, 신규 서비스 기획, 화면설계',
          team: '5명',
          summary: `- 학교에서 사용하는 행정문서를 검색하고, 다운로드 받을 수 있는 자료실 신규 기획\n- 추후 적용 예정이었던 Cloud 서비스를 고려하여 설계 진행\n- Front, Admin Web 페이지 기획`,
          result: null,
        },
        {
          title: '아이엠스쿨 서비스 유저 인게이지먼트 향상 TF',
          period: '2017.04 - 2017.10',
          role: 'PM, 개선방향 기획, 정보구조 설계, 화면설계',
          team: '7명',
          summary: `- 문제 상황\n  - 아이엠스쿨 앱의 유저 인게이지먼트가 상당히 낮은 상태(광고만 이용 후 이탈)\n- 솔루션\n  - 콘텐츠 집중도를 높일 수 있는 홈 영역 설계\n  - 콘텐츠 집중 서비스 제공 전 검증 : 콘텐츠 제공 방식 변경 후 사용 패턴 검증\n  - 광고 노출 영역 개선 검증 : 광고 제공 형태 및 영역 정리 후 성과 체크\n  - 사용성 개선 검증 : 소식 피드 내 필터, 통합 검색, 카드의 부가 기능 추가\n  - 실제 사용자의 반응 확인을 위한 UT (Usability Test) 설계 및 모더레이팅 및 결과 분석`,
          result: null,
        },
        {
          title: '이용약관, 개인정보 처리방침 전체 개정 및 대응 개발',
          period: '2017.02 - 2017.05',
          role: 'PM, 문서개정, 서비스 분석, 개선방향 기획, 화면설계',
          team: '4명',
          summary: `- 문제 상황\n  - 약관 및 개인정보 처리방침 작성 이후 업데이트가 없는 상태\n  - 문서 생성 이후 서비스 영역이 크게 확대된 상태\n- 솔루션\n  - 확장된 서비스를 포괄할 수 있는 형태로 문서 개정 방향 수립\n  - 관련 법령 및 적용 영역 파악\n  - 현재 수집&활용 중인 개인정보 현황 파악 및 정리\n  - 서비스 내 분야별 정책 파악 및 정리\n  - 개정 방향에 맞춰 개발이 필요한 영역을 리스트업하고 화면설계`,
          result: null,
        },
        {
          title: '안심학원 Front Page 개발',
          period: '2016.12 - 2017.02',
          role: 'PM, 서비스 분석, 정보구조 설계, 화면설계',
          team: '3명',
          summary: `- 타겟 유저 분석, 예상 사용 플로우 설계\n- Low-Fi 프로토타이핑을 통한 서비스 제공형태 협의\n- 반응형 웹 페이지 기획\n- 보상 또는 이벤트 인지율을 높일 수 있는 형태 구성\n- Mobile App과 동일한 UX를 줄 수 있는 형태 구성`,
          result: null,
        },
        {
          title: '아이엠스쿨 Mobile App 평점하락 대응 기획',
          period: '2016.10 - 2016.11',
          role: 'PM, 데이터 분석, 정보구조 설계, 화면설계',
          team: '4명',
          summary: `- 문제 상황\n  - 서비스의 평점이 1점대로 회복이 되지 않음\n- 솔루션\n  - 평점 하락 대응 방안 리서치\n  - 서비스 평가 수집을 통해 긍정적인 평가 유도\n  - 불만 사항을 App 내에서 수집할 수 있는 구조 설계\n  - 불만 사항을 관리 및 트래킹 할 수 있는 Admin Page 설계`,
          result: `불만사항을 앱 내에 별도 수집하여 부정적인 평가 우회 (전체의 85% - 287개의 부정적인 의견 중 243개가 내부 Admin으로 등록)`,
        },
        {
          title: '결제관리, 포인트관리 Admin 설계',
          period: '2016.09 - 2016.10',
          role: 'PM, 서비스 분석, 정보구조 설계, 화면설계',
          team: '2명',
          summary: `- 커머스 및 문자포인트 결제관리를 할 수 있는 Admin Page 기획\n- 요구사항 분석 및 제공 기능 정의, 결제상태별 Flow 구성\n- 커머스, 문자포인트를 통합 또는 각 항목별로 분리하여 관리할 수 있는 형태 구성`,
          result: null,
        },
      ],
      otherProjects: `- Admin 내 세금 계산서 요청 기능 추가 (SNS 발송을 위한 포인트 결제 금액)
- Admin 내 포인트 관리 및 결제 관리 기능 추가
- 급식 소식이 연동 안된 학교를 대상으로 사용자가 학교측으로 연동 요청하는 기능 추가
- User Feedback 수집, 분석 및 과제화 flow 마련
- 서비스 IA(Information Architecture) 작성 및 관리
- 사내 Confluence(WIKI Tool) 교육`,
    },
    {
      company: 'Yello Travel',
      title: 'Manager / UX 기획 | UX팀',
      period: '2015.04 ~ 2016.04',
      projects: [
        {
          title: '제주닷컴 Front Page Renewal',
          period: '2015.11.02 - 2016.3.31',
          role: 'PM, 서비스 분석, UX컨설팅, 데이터 분석, 정보구조 설계, 화면설계',
          team: '8명',
          summary: `- 문제 상황\n  - 업력이 오래된 서비스로 올드한 서비스 형태\n  - 구조상 항공, 숙박, 티켓, 렌터카 등 각각 따로 결제가 되는 불편함\n- 솔루션\n  - 서비스의 사용성을 분석 후 개선방향 제안\n  - 매출 및 트래픽 분석을 통한 전략 분석\n  - 정보 구조 재설계\n  - 서비스 전략 및 재설계한 정보구조를 바탕으로 화면설계\n    - Admin 통합이 불가능하여 Front 상에서 통합 구매가 가능한 형태로 서비스 구조 개선\n    - 온오프라인 사용성이 연결되도록 Flow 개선 및 정보 보충`,
          result: null,
        },
        {
          title: '우리펜션 모바일 UX 컨설팅',
          period: '2015.10.01 - 2015.11.30',
          role: 'PM, 사용성 분석, 개선방향 모색, 개선방향 제안',
          team: '4명',
          summary: `- 유저 시나리오에 기반한 태스크 도출\n- 우리펜션 모바일 앱 사용성 분석\n- 경쟁 서비스 분석\n- 개선 방향 모색 후 제안`,
          result: null,
        },
        {
          title: '우리펜션 Admin Page Renewal',
          period: '2015.05.31 - 2015.08.31',
          role: '서비스 분석, 리서치, 데이터 분석, 화면 설계, 프로토타이핑',
          team: '4명',
          summary: `- 문제 상황\n  - 복잡한 숙박 예약 구조가 직관적이지 않는 구조로 설계되어 휴먼 에러가 빈번함\n  - 위 이유로 인해 숙련자 외에는 운영이 어려운 상황\n- 솔루션\n  - 현 관리자 페이지 문제점 진단 (숙박 형태 별 대응 필요, 방 막기 등 특수한 상황 대응 필요)\n  - 운영인력 인터뷰를 통해 요구사항 수집\n  - 기존 운영 데이터를 분석 후 정보 구조 재설계\n  - 재설계한 구조를 바탕으로 화면설계 진행`,
          result: null,
        },
        {
          title: '우리펜션 Front Page Renewal',
          period: '2015.04.13 - 2015.05.31',
          role: '서비스 분석, 리서치, 데이터 분석, 화면 설계, 프로토타이핑',
          team: '2명',
          summary: `- 현 서비스의 문제점을 전체적으로 진단\n- 정보 구조 정리 및 Back Office 연동 기능 파악\n- 구매프로세스 파악 및 정리`,
          result: null,
        },
      ],
    },
    {
      company: 'Studio April Rain',
      title: '대표 (1인 창업)',
      period: '2014.02 ~ 2015.03',
      projects: [
        {
          title: '아티스트-상품 제작자 중개 B2B/B2C 플랫폼',
          period: '2014.02 ~ 2015.03',
          role: '대표, 기획·운영',
          team: '1명',
          summary: `- 아티스트와 상품 제작자를 중개하는 B2B/B2C 플랫폼 기획 및 운영\n- 서울시 창업지원 프로그램 '챌린지 1000 프로젝트' 6기 선발`,
          result: null,
        },
      ],
    },
    {
      company: 'Coupang',
      title: 'UX Design | UX Lab.',
      period: '2013.06 ~ 2014.01',
      projects: [
        {
          title: 'Coupang PC Web, Mobile Web/App 상품 후기 페이지 개선 제안',
          period: '2013.12.01 - 2013.12.31',
          role: '리서치, 데이터 분석, 결과 정리',
          team: '1명',
          summary: `- 문제 상황\n  - 상품 후기가 입력이 저조하고 구매에 잘 활용되지 않음\n- 솔루션\n  - 현재 상품후기 영역 문제점 파악 및 분석\n  - 국내외 서비스 상품후기 영역 벤치마킹\n  - 단계별 반영안 정리 및 제안\n    - 상품 종류별 리뷰 표시 구조 개선, 리뷰 작성자 등급 및 리워드 도입`,
          result: null,
        },
        {
          title: 'Coupang Mobile 상품 리스트 페이지(PLP) 사용성 개선 제안',
          period: '2013.09.02 - 2013.12.31',
          role: '리서치, 데이터 분석, 결과 정리',
          team: '1명',
          summary: `- 문제 상황\n  - 상품이 많아질 수록 상품 리스트 페이지의 탐색이 어려운 구조\n- 솔루션\n  - Product List Page(PLP)의 문제점 분석 후 구매 패턴 관찰\n  - 해외 경쟁사 앱 PLP의 기능을 기준으로 리서치 진행 후 자사 서비스와 비교\n  - 공통점 및 차별점을 분리하여 세부 분석이 필요한 내용 정리\n    - 검색 결과 또는 카테고리별 필터 및 소팅 세분화`,
          result: null,
        },
        {
          title: 'Coupang Mobile App 기본 구매 Flow 사용성 연구',
          period: '2013.09.02 - 2013.12.31',
          role: '사용성 테스트 준비, 테스트 내용 분석 및 데이터 정리',
          team: '3명',
          summary: `- 카테고리 기능 인지 여부 확인\n- Product List Page(PLP) 및 검색 기능에 대한 사용성 확인\n- Product Detail Page(PDP) 탐색 후 상품 구매에 영향을 주는 요인 확인\n- 장바구니, 주문/결제 페이지 사용성 확인`,
          result: null,
        },
        {
          title: 'Coupang PC/Mobile PG통합결제창 사용성 연구',
          period: '2013.09.02 - 09.30',
          role: '사용성 테스트 모더레이터, 테스트 내용 분석 및 데이터 정리',
          team: '3명',
          summary: `- PC/Mobile PG통합 결제창 내 세부 영역 인지 여부 확인\n- 타사 결제 영역과 사용성 비교\n- 분석 내용 데이터 정리 및 관련 부서 전달`,
          result: null,
        },
        {
          title: 'Coupang PC 상품 상세 페이지(PDP)의 쉬운 옵션 선택방법 연구',
          period: '2013.09.02 - 2013.10.31',
          role: '리서치, 데이터 분석, 개선안 ideation',
          team: '3명',
          summary: `- Product Detail Page(PDP) 사용 행태 조사 및 사용성 연구\n- 효율적인 옵션 선택 방안 Ideation\n- 분석 Data 및 Ideation 결과 관련 부서 전달\n  - 상품 썸네일 클릭 시 해당 상품 포커스/상세 내용 팝업 노출`,
          result: null,
        },
        {
          title: 'Coupang Mobile App 상품 상세 페이지(PDP)의 옵션 다중 선택영역 사용성 연구',
          period: '2013.08.01 - 2013.12',
          role: '사용성 테스트 모더레이터, 테스트 내용 분석 및 데이터 정리',
          team: '3명',
          summary: `- 소셜커머스 3사 옵션 다중선택 영역 분석\n- Product Detail Page(PDP) 영역의 옵션 다중선택 인지 여부 확인 및 사용성 점검\n- 옵션 다중선택이 적용된 타사 앱의 사용성을 테스트 후 비교\n- 분석 data 관련 부서 전달`,
          result: null,
        },
        {
          title: 'Coupang PC/Mobile 할인쿠폰 영역 사용성 연구',
          period: '2013.08.01 - 2013.09.30',
          role: '리서치, 데이터 분석, 개선안 ideation',
          team: '5명',
          summary: `- 타사 할인쿠폰 영역 리서치 및 분석\n- 할인쿠폰 영역 및 사용성 확인\n- 분석내용을 토대로 개선안 ideation\n- 분석 Data 및 ideation 결과 관련 부서 전달`,
          result: null,
        },
      ],
    },
    {
      company: 'SK planet',
      title: 'Manager / UX Design | 위치기반광고사업팀',
      period: '2011.12 ~ 2013.02',
      projects: [
        {
          title: '\'Arounders\' 위치기반광고서비스 Admin Page 제작',
          period: '2012.12.03~2013.2.28',
          role: 'UX/UI설계, UI디자인, 퍼블리싱',
          team: '3명',
          summary: `- 광고주, 퍼블리셔 업체, 서비스 운영 담당자가 운영할 admin page 필요\n- 백오피스 기능 정의 및 정보 구조 설계\n- 화면 설계 및 UI 디자인, 퍼블리싱까지 전반적인 업무 진행`,
          result: null,
        },
        {
          title: '\'Arounders\' 위치기반광고서비스 Front Page 제작',
          period: '2012.05.02 - 2012~10.31',
          role: '디자인 PM, UI 디자인',
          team: '5명',
          summary: `- 서비스 특색에 맞는 디자인 방향 기획 및 수립\n- 프론트 페이지 디자인\n- 모바일 랜딩페이지 디자인`,
          result: null,
        },
        {
          title: '\'Arounders\' 위치기반광고서비스 홍보물 제작',
          period: '2012.11.01 - 11.30',
          role: '모션그래픽 디자인, 편집 디자인, UI디자인 및 퍼블리싱',
          team: '3명',
          summary: `- 서비스 내용을 기반으로 광고주를 대상으로한 홍보 영상물 및 홍보 책자 디자인\n- 홍보용 랜딩페이지(모바일용) 디자인 및 퍼블리싱`,
          result: null,
        },
        {
          title: '퍼플리셔별 광고 Inventory 개선 제안',
          period: '2012.11.01 - 11.30',
          role: '리서치, 데이터 분석, 개선안 정리',
          team: '1명',
          summary: `- 광고 인벤토리 및 어플리케이션 인터페이스 문제점 분석\n- 유저 보이스 분석, 개선안 정리 및 제안`,
          result: null,
        },
      ],
    },
    {
      company: 'team interface',
      title: '인턴 / UI Design | UI컨설팅사업부',
      period: '2010.07 ~ 2010.08',
      projects: [
        {
          title: 'KT ucloud UI Design',
          period: '2010.07 ~ 2010.08',
          role: 'UI Design',
          team: '-',
          summary: `- PC Client UI 디자인\n- Mobile App Splash View 시안\n- PC Client 가이드 문서`,
          result: null,
        },
      ],
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
  headline: 'Data-driven decisions,\nUser-centric design',
  subtitle: 'A product manager who drives growth through data-driven decisions and user-centric design',
  ctaText: 'View Cases',
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
  heading: 'Designing the balance between users and business',
  bio: 'I define problems with data and design solutions with UX. With 13+ years of experience spanning AI, ML recommendation, logistics, e-commerce, and edtech, I bridge the gap between complex technology and intuitive user experiences.',
  skills: [
    { label: 'Product Strategy', category: 'data' },
    { label: 'A/B Testing', category: 'data' },
    { label: 'ML Recommendation', category: 'ai' },
    { label: 'LLM / Prompt Engineering', category: 'ai' },
    { label: 'Data Analysis', category: 'data' },
    { label: 'UX Design', category: 'ux' },
    { label: 'Service Planning', category: 'ux' },
    { label: 'Cross-functional Collaboration', category: 'ops' },
    { label: 'Agile / Scrum', category: 'ops' },
    { label: 'Stakeholder Management', category: 'ops' },
  ],
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
  message: "Interested in working together? Let's connect.",
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
