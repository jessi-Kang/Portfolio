import { useState, useRef, useCallback, useEffect } from 'react'
import { loadProjects, saveProjects, resetProjects, defaultProjects } from '../data/projects'
import {
  getAccessTokens,
  createAccessToken,
  revokeAccessToken,
  forceExpireToken,
  getAccessLogForToken,
  loadHeroConfig,
  saveHeroConfig,
  resetHeroConfig,
  loadAuthGateConfig,
  saveAuthGateConfig,
  resetAuthGateConfig,
  loadResumeConfig,
  saveResumeConfig,
  resetResumeConfig,
  defaultResumeConfig,
  loadContactConfig,
  saveContactConfig,
  resetContactConfig,
  loadAboutConfig,
  saveAboutConfig,
  resetAboutConfig,
  loadAchievementsConfig,
  saveAchievementsConfig,
  resetAchievementsConfig,
  clearAdminSession,
  setupAdminPasscode,
  verifyAdminPasscode,
  resetAdminPasscode,
  isEnvAdmin,
} from '../utils/crypto'

/* ─── Navigation ─── */

const NAV_ITEMS = [
  { group: '콘텐츠', items: [
    { id: 'projects', label: '프로젝트', icon: '🚀' },
    { id: 'resume', label: '경력·학력', icon: '📄' },
    { id: 'about', label: '소개', icon: '👋' },
    { id: 'achievements', label: '핵심 성과', icon: '🏆' },
  ]},
  { group: '페이지 설정', items: [
    { id: 'hero', label: '히어로', icon: '🏠' },
    { id: 'authgate', label: '접속 화면', icon: '🔐' },
    { id: 'contact', label: '연락처', icon: '✉️' },
  ]},
  { group: '접속 관리', items: [
    { id: 'tokens', label: '토큰', icon: '🎫' },
  ]},
  { group: '설정', items: [
    { id: 'account', label: '관리자 계정', icon: '⚙️' },
  ]},
]

/* ─── Shared UI ─── */

function AutoTextarea({ value, onChange, minRows = 2, className = '' }) {
  const ref = useRef(null)
  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    // Save scroll position to prevent jump
    const scrollY = window.scrollY
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
    // Restore scroll position
    window.scrollTo(0, scrollY)
  }, [])
  useEffect(() => { resize() }, [value, resize])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => { onChange(e.target.value); resize() }}
      rows={minRows}
      className={className}
      style={{ overflow: 'hidden' }}
    />
  )
}

function Field({ label, value, onChange, type = 'text', className = '', rows }) {
  const cls = 'w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors'
  if (rows) {
    return (
      <div className={className}>
        {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
        <AutoTextarea value={value} onChange={onChange} minRows={rows} className={`${cls} resize-y`} />
      </div>
    )
  }
  return (
    <div className={className}>
      {label && <label className="block text-xs text-gray-500 mb-1">{label}</label>}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} step={type === 'number' ? 'any' : undefined} className={cls} />
    </div>
  )
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
    </div>
  )
}

function ActionBar({ children }) {
  return <div className="flex flex-wrap items-center gap-2 mb-6 sticky top-0 md:top-0 bg-gray-950/95 backdrop-blur z-10 py-3 -mx-1 px-1">{children}</div>
}

function SaveButton({ onClick, label = '저장' }) {
  const handleClick = (e) => {
    e.preventDefault()
    onClick()
  }
  return (
    <button onClick={handleClick} className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
      {label}
    </button>
  )
}

function ResetButton({ onClick, label = '초기화' }) {
  return (
    <button onClick={onClick} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-lg transition-colors cursor-pointer">
      {label}
    </button>
  )
}

function Toast({ message }) {
  if (!message) return null
  return (
    <div className="fixed bottom-6 right-6 bg-accent text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50 animate-fade-in">
      {message}
    </div>
  )
}

/* ─── Import / Export / Sample ─── */

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function importJson(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        resolve(JSON.parse(e.target.result))
      } catch {
        reject(new Error('JSON 파싱 실패'))
      }
    }
    reader.onerror = () => reject(new Error('파일 읽기 실패'))
    reader.readAsText(file)
  })
}

function ImportExportBar({ onImport, onExport, onSample, importLabel = 'JSON 가져오기', sampleLabel = '샘플 다운로드' }) {
  const fileRef = useRef(null)
  return (
    <div className="flex flex-wrap gap-2">
      <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={async (e) => {
        const file = e.target.files?.[0]
        if (file) {
          try { await onImport(file) } catch (err) { alert(err.message) }
        }
        e.target.value = ''
      }} />
      <button onClick={() => fileRef.current?.click()} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors cursor-pointer">
        ↑ {importLabel}
      </button>
      <button onClick={onExport} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded-lg transition-colors cursor-pointer">
        ↓ JSON 내보내기
      </button>
      <button onClick={onSample} className="px-3 py-1.5 border border-gray-700 hover:border-gray-600 text-gray-500 hover:text-gray-400 text-xs rounded-lg transition-colors cursor-pointer">
        📎 {sampleLabel}
      </button>
    </div>
  )
}

/* ─── Sub-editors ─── */


/* ─── Resume Sub-editors (defined outside to avoid remount on state change) ─── */

function EducationEditor({ item, onChange, onRemove }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex justify-between items-start gap-2">
        <div className="grid grid-cols-2 gap-2 flex-1 sm:grid-cols-3">
          <Field label="학교" value={item.school} onChange={(v) => onChange({ ...item, school: v })} />
          <Field label="학위" value={item.degree} onChange={(v) => onChange({ ...item, degree: v })} />
          <Field label="기간" value={item.period} onChange={(v) => onChange({ ...item, period: v })} />
        </div>
        <button onClick={onRemove} className="shrink-0 mt-5 px-2 py-1 text-red-400 hover:text-red-300 cursor-pointer">✕</button>
      </div>
    </div>
  )
}

function WorkEditor({ item, onChange, onRemove }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
      <div className="flex justify-between items-start gap-2">
        <div className="grid grid-cols-2 gap-2 flex-1 sm:grid-cols-3">
          <Field label="회사" value={item.company} onChange={(v) => onChange({ ...item, company: v })} />
          <Field label="직함" value={item.title} onChange={(v) => onChange({ ...item, title: v })} />
          <Field label="기간" value={item.period} onChange={(v) => onChange({ ...item, period: v })} />
        </div>
        <button onClick={onRemove} className="shrink-0 mt-5 px-2 py-1 text-red-400 hover:text-red-300 cursor-pointer">✕</button>
      </div>
      <Field label="설명 (마크다운)" value={item.description} onChange={(v) => onChange({ ...item, description: v })} rows={2} />
      {item.leaveNote !== undefined && (
        <Field label="퇴사 사유" value={item.leaveNote || ''} onChange={(v) => onChange({ ...item, leaveNote: v })} />
      )}
    </div>
  )
}

function ActivityEditor({ item, onChange, onRemove }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex justify-between items-start gap-2">
        <div className="grid grid-cols-2 gap-2 flex-1 sm:grid-cols-3">
          <Field label="연도" value={item.year} onChange={(v) => onChange({ ...item, year: v })} className="w-24" />
          <Field label="카테고리" value={item.category} onChange={(v) => onChange({ ...item, category: v })} />
          <Field label="내용" value={item.summary} onChange={(v) => onChange({ ...item, summary: v })} />
        </div>
        <button onClick={onRemove} className="shrink-0 mt-5 px-2 py-1 text-red-400 hover:text-red-300 cursor-pointer">✕</button>
      </div>
    </div>
  )
}

/* ─── Resume Section ─── */

function ResumeSection() {
  const [config, setConfig] = useState(loadResumeConfig)
  const [toast, setToast] = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleSave = () => { saveResumeConfig(config); flash('이력서 저장 완료') }
  const handleReset = () => { if (confirm('초기화하시겠습니까?')) { resetResumeConfig(); setConfig(loadResumeConfig()); flash('초기화 완료') } }

  const updateItem = (key, index, updated) => { const arr = [...config[key]]; arr[index] = updated; setConfig({ ...config, [key]: arr }) }
  const removeItem = (key, index) => setConfig({ ...config, [key]: config[key].filter((_, i) => i !== index) })

  const addEducation = () => setConfig({ ...config, education: [...config.education, { school: '', degree: '', period: '' }] })
  const addWork = () => setConfig({ ...config, work: [...config.work, { company: '', title: '', period: '', description: '' }] })
  const addActivity = () => setConfig({ ...config, activities: [...config.activities, { year: '', category: '', summary: '' }] })

  const sampleResume = {
    education: [
      { school: '서울대학교 컴퓨터공학과', degree: '학사', period: '2014 - 2018' },
    ],
    work: [
      { company: '테크 기업 A', title: 'ML 엔지니어', period: '2020 - 현재', description: '추천 시스템 개발 및 운영' },
      { company: '스타트업 B', title: '데이터 사이언티스트', period: '2018 - 2020', description: '데이터 파이프라인 구축' },
    ],
    activities: [
      { year: '2023', category: '발표', summary: 'AI 컨퍼런스 - 대규모 언어 모델 활용 사례' },
    ],
    selfIntro: '## 소개\n\n안녕하세요, ML 엔지니어입니다.\n\n**핵심 역량:**\n- 머신러닝 모델 설계 및 배포\n- 데이터 파이프라인 구축\n- A/B 테스트 설계',
  }

  const handleImport = async (file) => {
    const data = await importJson(file)
    if (typeof data !== 'object' || Array.isArray(data)) throw new Error('올바른 이력서 JSON 형식이 아닙니다')
    setConfig({ ...config, ...data })
    flash('가져오기 완료 — 저장 버튼을 눌러주세요')
  }

  return (
    <div>
      <SectionHeader title="이력서" description="학력, 경력, 활동 내역 및 자기소개를 관리합니다" />
      <ActionBar>
        <SaveButton onClick={handleSave} />
        <ResetButton onClick={handleReset} />
        <div className="flex-1" />
        <ImportExportBar
          onImport={handleImport}
          onExport={() => downloadJson(config, 'resume.json')}
          onSample={() => downloadJson(sampleResume, 'resume-sample.json')}
        />
      </ActionBar>

      {/* Education */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-accent">학력</h3>
          <button onClick={addEducation} className="text-xs text-accent hover:text-accent-light cursor-pointer">+ 추가</button>
        </div>
        <div className="space-y-2">
          {config.education.map((item, i) => (
            <EducationEditor key={i} item={item} onChange={(u) => updateItem('education', i, u)} onRemove={() => removeItem('education', i)} />
          ))}
          {config.education.length === 0 && <p className="text-xs text-gray-600 py-2">항목이 없습니다</p>}
        </div>
      </div>

      {/* Work */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-accent">경력</h3>
          <button onClick={addWork} className="text-xs text-accent hover:text-accent-light cursor-pointer">+ 추가</button>
        </div>
        <div className="space-y-2">
          {config.work.map((item, i) => (
            <WorkEditor key={i} item={item} onChange={(u) => updateItem('work', i, u)} onRemove={() => removeItem('work', i)} />
          ))}
          {config.work.length === 0 && <p className="text-xs text-gray-600 py-2">항목이 없습니다</p>}
        </div>
      </div>

      {/* Activities */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-semibold text-accent">활동</h3>
          <button onClick={addActivity} className="text-xs text-accent hover:text-accent-light cursor-pointer">+ 추가</button>
        </div>
        <div className="space-y-2">
          {config.activities.map((item, i) => (
            <ActivityEditor key={i} item={item} onChange={(u) => updateItem('activities', i, u)} onRemove={() => removeItem('activities', i)} />
          ))}
          {config.activities.length === 0 && <p className="text-xs text-gray-600 py-2">항목이 없습니다</p>}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-accent mb-3">자기소개 (마크다운)</h3>
        <AutoTextarea
          value={config.selfIntro}
          onChange={(v) => setConfig({ ...config, selfIntro: v })}
          minRows={4}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white font-mono resize-y focus:outline-none focus:border-accent transition-colors"
        />
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── Hero Section ─── */

function HeroSection() {
  const [config, setConfig] = useState(loadHeroConfig)
  const [toast, setToast] = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const update = (key, value) => setConfig({ ...config, [key]: value })

  const handleSave = () => { saveHeroConfig(config); flash('히어로 저장 완료') }
  const handleReset = () => { if (confirm('초기화하시겠습니까?')) { resetHeroConfig(); setConfig(loadHeroConfig()); flash('초기화 완료') } }

  return (
    <div>
      <SectionHeader title="히어로" description="메인 화면 상단 영역을 설정합니다" />
      <ActionBar>
        <SaveButton onClick={handleSave} />
        <ResetButton onClick={handleReset} />
      </ActionBar>
      <div className="space-y-4 max-w-4xl">
        <Field label="태그라인" value={config.tagline} onChange={(v) => update('tagline', v)} />
        <Field label="헤드라인" value={config.headline} onChange={(v) => update('headline', v)} />
        <Field label="서브타이틀" value={config.subtitle} onChange={(v) => update('subtitle', v)} rows={2} />
        <Field label="CTA 텍스트" value={config.ctaText} onChange={(v) => update('ctaText', v)} />
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── AuthGate Section ─── */

function AuthGateSection() {
  const [config, setConfig] = useState(loadAuthGateConfig)
  const [toast, setToast] = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const update = (key, value) => setConfig({ ...config, [key]: value })

  const handleSave = () => { saveAuthGateConfig(config); flash('접속 화면 저장 완료') }
  const handleReset = () => { if (confirm('초기화하시겠습니까?')) { resetAuthGateConfig(); setConfig(loadAuthGateConfig()); flash('초기화 완료') } }

  return (
    <div>
      <SectionHeader title="접속 화면" description="방문자 인증 화면의 텍스트를 설정합니다" />
      <ActionBar>
        <SaveButton onClick={handleSave} />
        <ResetButton onClick={handleReset} />
      </ActionBar>
      <div className="space-y-4 max-w-4xl">
        <Field label="태그라인" value={config.tagline} onChange={(v) => update('tagline', v)} />
        <Field label="헤드라인 (줄바꿈: \\n)" value={config.headline} onChange={(v) => update('headline', v)} />
        <Field label="서브타이틀" value={config.subtitle} onChange={(v) => update('subtitle', v)} />
        <Field label="버튼 텍스트" value={config.buttonText} onChange={(v) => update('buttonText', v)} />
        <Field label="연락 안내 메시지" value={config.contactMessage} onChange={(v) => update('contactMessage', v)} />
        <Field label="연락 이메일" value={config.contactEmail} onChange={(v) => update('contactEmail', v)} />
        <Field label="연락 힌트" value={config.contactHint} onChange={(v) => update('contactHint', v)} />
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── Contact Section ─── */

function ContactSection() {
  const [config, setConfig] = useState(loadContactConfig)
  const [toast, setToast] = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const update = (key, value) => setConfig({ ...config, [key]: value })

  const handleSave = () => { saveContactConfig(config); flash('연락처 저장 완료') }
  const handleReset = () => { if (confirm('초기화하시겠습니까?')) { resetContactConfig(); setConfig(loadContactConfig()); flash('초기화 완료') } }

  return (
    <div>
      <SectionHeader title="연락처" description="하단 연락처 영역의 내용을 설정합니다" />
      <ActionBar>
        <SaveButton onClick={handleSave} />
        <ResetButton onClick={handleReset} />
      </ActionBar>
      <div className="space-y-4 max-w-4xl">
        <Field label="제목" value={config.heading} onChange={(v) => update('heading', v)} />
        <Field label="메시지" value={config.message} onChange={(v) => update('message', v)} rows={2} />
        <Field label="이메일" value={config.email} onChange={(v) => update('email', v)} />
        <Field label="LinkedIn URL" value={config.linkedinUrl} onChange={(v) => update('linkedinUrl', v)} />
        <Field label="LinkedIn 라벨" value={config.linkedinLabel} onChange={(v) => update('linkedinLabel', v)} />
        <Field label="저작권 문구" value={config.copyright} onChange={(v) => update('copyright', v)} />
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── Token Manager ─── */

function formatDate(ts) {
  return new Date(ts).toLocaleString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function parseBrowser(ua) {
  if (!ua) return '알 수 없음'
  if (ua.includes('Edg/')) return 'Edge'
  if (ua.includes('Chrome/')) return 'Chrome'
  if (ua.includes('Firefox/')) return 'Firefox'
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari'
  return '기타'
}

function parseOS(ua) {
  if (!ua) return ''
  if (ua.includes('Windows')) return 'Windows'
  if (ua.includes('Mac OS')) return 'macOS'
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS'
  if (ua.includes('Android')) return 'Android'
  if (ua.includes('Linux')) return 'Linux'
  return ''
}

function TokensSection() {
  const [tokens, setTokens] = useState(getAccessTokens)
  const [label, setLabel] = useState('')
  const [expMode, setExpMode] = useState('days') // 'days' or 'datetime'
  const [expDays, setExpDays] = useState(7)
  const [expDatetime, setExpDatetime] = useState('')
  const [expandedToken, setExpandedToken] = useState(null)
  const [toast, setToast] = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const refresh = () => setTokens(getAccessTokens())

  const copyToken = (token) => {
    navigator.clipboard.writeText(token).then(() => flash('토큰이 클립보드에 복사되었습니다'))
  }

  const handleCreate = () => {
    if (!label.trim()) return
    let expiresAt
    if (expMode === 'datetime' && expDatetime) {
      // datetime-local gives local time string, parse as KST
      expiresAt = new Date(expDatetime).getTime()
      if (isNaN(expiresAt) || expiresAt <= Date.now()) {
        flash('만료 시점이 현재보다 미래여야 합니다')
        return
      }
    } else {
      expiresAt = Date.now() + expDays * 24 * 60 * 60 * 1000
    }
    const token = createAccessToken(label.trim(), expiresAt)
    setLabel('')
    refresh()
    navigator.clipboard.writeText(token).then(() => flash('토큰 생성 및 복사 완료'))
  }

  const handleRevoke = (id) => { if (confirm('이 토큰을 폐기하시겠습니까?')) { revokeAccessToken(id); refresh() } }
  const handleExpire = (id) => { if (confirm('이 토큰을 즉시 만료하시겠습니까?')) { forceExpireToken(id); refresh() } }

  const getStatus = (t) => {
    if (t.revoked) return { text: '폐기됨', cls: 'text-gray-500' }
    if (new Date(t.expiresAt) < new Date()) return { text: '만료', cls: 'text-red-400' }
    return { text: '활성', cls: 'text-green-400' }
  }

  return (
    <div>
      <SectionHeader title="접속 토큰" description="방문자에게 발급할 접속 토큰을 관리합니다" />

      <div className="bg-gray-900 rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-accent mb-3">새 토큰 생성</h3>
        <div className="space-y-3">
          <Field label="라벨 (예: 홍길동)" value={label} onChange={setLabel} className="max-w-xs" />
          <div>
            <label className="block text-xs text-gray-500 mb-2">만료 설정</label>
            <div className="flex gap-2 mb-2">
              <button
                onClick={() => setExpMode('days')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${expMode === 'days' ? 'bg-accent text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                일 수
              </button>
              <button
                onClick={() => setExpMode('datetime')}
                className={`px-3 py-1.5 text-xs rounded-lg transition-colors cursor-pointer ${expMode === 'datetime' ? 'bg-accent text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >
                날짜·시간 지정
              </button>
            </div>
            {expMode === 'days' ? (
              <div className="flex items-end gap-2">
                <Field label="" value={expDays} type="number" onChange={(v) => setExpDays(parseInt(v) || 1)} className="w-24" />
                <span className="text-xs text-gray-500 pb-2.5">일 후 만료</span>
              </div>
            ) : (
              <input
                type="datetime-local"
                value={expDatetime}
                onChange={(e) => setExpDatetime(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors"
              />
            )}
          </div>
          <button onClick={handleCreate} className="px-4 py-2 bg-accent hover:bg-accent-light text-white text-sm font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap">생성</button>
        </div>
      </div>

      <div className="space-y-3">
        {tokens.length === 0 && <p className="text-gray-600 text-sm py-4 text-center">발급된 토큰이 없습니다</p>}
        {tokens.map((t) => {
          const status = getStatus(t)
          const isActive = !t.revoked && new Date(t.expiresAt) >= new Date()
          const logs = getAccessLogForToken(t.id)
          const isExpanded = expandedToken === t.id

          return (
            <div key={t.id} className="bg-gray-900 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{t.label}</span>
                    <span className={`text-xs ${status.cls}`}>{status.text}</span>
                  </div>
                  <p className="text-xs text-gray-500 font-mono mt-1 truncate">{t.token}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    생성: {formatDate(t.createdAt)} · 만료: {formatDate(t.expiresAt)}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => copyToken(t.token)} className="px-2 py-1 text-xs text-accent hover:text-accent-light border border-gray-700 rounded-lg cursor-pointer">복사</button>
                  {logs.length > 0 && (
                    <button onClick={() => setExpandedToken(isExpanded ? null : t.id)} className="px-2 py-1 text-xs text-gray-400 hover:text-white border border-gray-700 rounded-lg cursor-pointer">
                      로그 {logs.length}
                    </button>
                  )}
                  {isActive && (
                    <button onClick={() => handleExpire(t.id)} className="px-2 py-1 text-xs text-yellow-400 hover:text-yellow-300 border border-gray-700 rounded-lg cursor-pointer">만료</button>
                  )}
                  {!t.revoked && (
                    <button onClick={() => handleRevoke(t.id)} className="px-2 py-1 text-xs text-red-400 hover:text-red-300 border border-gray-700 rounded-lg cursor-pointer">폐기</button>
                  )}
                </div>
              </div>

              {isExpanded && logs.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-800 space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-gray-500">
                      <span>{formatDate(log.accessedAt)}</span>
                      <span>{parseBrowser(log.userAgent)} · {parseOS(log.userAgent)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── Account Section ─── */

function AccountSection({ onLogout }) {
  const envAdmin = isEnvAdmin()
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(false)

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setError('')

    if (!currentPw) { setError('현재 패스코드를 입력하세요'); return }
    if (newPw.length < 8) { setError('새 패스코드는 최소 8자 이상이어야 합니다'); return }
    if (newPw !== confirmPw) { setError('새 패스코드가 일치하지 않습니다'); return }

    setLoading(true)
    const ok = await verifyAdminPasscode(currentPw)
    if (!ok) { setError('현재 패스코드가 일치하지 않습니다'); setLoading(false); return }

    await setupAdminPasscode(newPw)
    setCurrentPw('')
    setNewPw('')
    setConfirmPw('')
    flash('패스코드 변경 완료')
    setLoading(false)
  }

  const handleResetAccount = async () => {
    if (!confirm('관리자 계정을 초기화하시겠습니까?\n초기화 후 다시 패스코드를 설정해야 합니다.')) return
    resetAdminPasscode()
    onLogout()
  }

  return (
    <div>
      <SectionHeader title="관리자 계정" description="패스코드 변경 및 계정 초기화" />

      <div className="max-w-md space-y-6">
        {envAdmin && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
            <p className="text-green-400 text-sm font-medium">빌드타임 인증 활성</p>
            <p className="text-gray-400 text-xs mt-1">환경변수(VITE_ADMIN_SALT, VITE_ADMIN_HASH)로 관리자 인증이 설정되어 있습니다. 패스코드 변경은 .env 파일을 수정한 후 다시 빌드하세요.</p>
            <p className="text-gray-500 text-xs mt-2 font-mono">node scripts/gen-admin-hash.mjs</p>
          </div>
        )}

        {!envAdmin && (
          <>
            <div className="bg-gray-900 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-accent mb-4">패스코드 변경</h3>
              <form onSubmit={handleChangePassword} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">현재 패스코드</label>
                  <input type="password" value={currentPw} onChange={(e) => { setCurrentPw(e.target.value); setError('') }} autoComplete="current-password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">새 패스코드</label>
                  <input type="password" value={newPw} onChange={(e) => { setNewPw(e.target.value); setError('') }} placeholder="8자 이상" autoComplete="new-password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">새 패스코드 확인</label>
                  <input type="password" value={confirmPw} onChange={(e) => { setConfirmPw(e.target.value); setError('') }} autoComplete="new-password"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent transition-colors" />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-accent hover:bg-accent-light disabled:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors cursor-pointer">
                  {loading ? '처리 중...' : '패스코드 변경'}
                </button>
              </form>
            </div>

            <div className="bg-gray-900 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-red-400 mb-2">계정 초기화</h3>
              <p className="text-xs text-gray-500 mb-4">관리자 계정을 완전히 삭제합니다. 초기화 후 새 패스코드를 다시 설정해야 합니다.</p>
              <button onClick={handleResetAccount}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm rounded-lg transition-colors cursor-pointer">
                계정 초기화
              </button>
            </div>
          </>
        )}

        {!envAdmin && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
            <p className="text-yellow-400 text-sm font-medium">보안 권장사항</p>
            <p className="text-gray-400 text-xs mt-1">현재 로컬 스토리지 기반 인증입니다. 보안 강화를 위해 빌드타임 인증으로 전환하세요:</p>
            <p className="text-gray-500 text-xs mt-2 font-mono">node scripts/gen-admin-hash.mjs</p>
            <p className="text-gray-500 text-xs">생성된 값을 .env에 추가 후 재빌드</p>
          </div>
        )}
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── Projects Section ─── */

function ProjectsSection() {
  const [data, setData] = useState(loadProjects)
  const [toast, setToast] = useState('')
  const [expanded, setExpanded] = useState({})

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const toggleProject = (gi, pi) => {
    const key = `${gi}-${pi}`
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = () => { saveProjects(data); flash('프로젝트 저장 완료') }
  const handleReset = () => { if (confirm('초기화하시겠습니까?')) { resetProjects(); setData(loadProjects()); flash('초기화 완료') } }

  const handleImport = async (file) => {
    const imported = await importJson(file)
    setData(imported)
    flash('가져오기 완료 — 저장 버튼을 눌러주세요')
  }

  return (
    <div>
      <SectionHeader title="프로젝트" description="Featured Projects 섹션에 표시될 프로젝트를 관리합니다" />
      <ActionBar>
        <SaveButton onClick={handleSave} />
        <ResetButton onClick={handleReset} />
        <div className="flex-1" />
        <ImportExportBar
          onImport={handleImport}
          onExport={() => downloadJson(data, 'projects.json')}
          onSample={() => downloadJson(defaultProjects, 'projects-sample.json')}
        />
      </ActionBar>
      <div className="space-y-6">
        {data.groups?.map((group, gi) => (
          <div key={gi} className="bg-gray-900 rounded-xl p-5 md:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-accent font-mono text-xs">Group {gi + 1}</span>
              <span className="text-white font-semibold text-sm flex-1 truncate">{group.title}</span>
              <button onClick={() => setData({ ...data, groups: data.groups.filter((_, i) => i !== gi) })} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">삭제</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="그룹 제목" value={group.title} onChange={(v) => { const g = [...data.groups]; g[gi] = { ...group, title: v }; setData({ ...data, groups: g }) }} />
              <Field label="그룹 부제" value={group.subtitle} onChange={(v) => { const g = [...data.groups]; g[gi] = { ...group, subtitle: v }; setData({ ...data, groups: g }) }} />
            </div>

            <div className="space-y-3">
              <p className="text-xs text-gray-500 font-medium">프로젝트 {group.projects?.length || 0}개</p>
              {group.projects?.map((p, pi) => {
                const isOpen = expanded[`${gi}-${pi}`]
                return (
                  <div key={pi} className="bg-gray-800/50 rounded-lg border border-gray-700/50 overflow-hidden">
                    {/* Header — always visible */}
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-800/80 transition-colors"
                      onClick={() => toggleProject(gi, pi)}
                    >
                      <svg className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                      {p.badge && <span className="text-[10px] font-mono text-accent bg-accent/10 px-1.5 py-0.5 rounded shrink-0">{p.badge}</span>}
                      <span className="text-sm font-medium text-white truncate flex-1">{p.title || '새 프로젝트'}</span>
                      <button onClick={(e) => { e.stopPropagation(); const g = [...data.groups]; g[gi] = { ...group, projects: group.projects.filter((_, i) => i !== pi) }; setData({ ...data, groups: g }) }} className="text-xs text-red-400 hover:text-red-300 cursor-pointer shrink-0">✕</button>
                    </div>

                    {/* Body — collapsible */}
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 space-y-4">
                        {/* 기본 정보 */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-2">기본 정보</p>
                          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            <Field label="배지" value={p.badge || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, badge: v }; setData({ ...data, groups: g }) }} />
                            <Field label="배지타입" value={p.badgeType || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, badgeType: v }; setData({ ...data, groups: g }) }} />
                            <Field label="제목" value={p.title || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, title: v }; setData({ ...data, groups: g }) }} />
                            <Field label="부제" value={p.subtitle || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, subtitle: v }; setData({ ...data, groups: g }) }} />
                          </div>
                        </div>

                        {/* 스토리 */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-2">스토리</p>
                          <div className="space-y-3">
                            <Field label="Problem — 문제 정의" value={p.problem || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, problem: v }; setData({ ...data, groups: g }) }} rows={3} />
                            <Field label="Solution — 해결 방안" value={p.solution || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, solution: v }; setData({ ...data, groups: g }) }} rows={3} />
                            <Field label="Collab — 이해관계자 협업" value={p.collaboration || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, collaboration: v }; setData({ ...data, groups: g }) }} rows={3} />
                            <Field label="Result — 최종 결과" value={p.result || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, result: v }; setData({ ...data, groups: g }) }} rows={3} />
                          </div>
                        </div>

                        {/* 부가 정보 */}
                        <div>
                          <p className="text-xs text-gray-500 font-medium mb-2">부가 정보</p>
                          <Field label="인사이트" value={p.insight || ''} onChange={(v) => { const g = [...data.groups]; g[gi].projects[pi] = { ...p, insight: v }; setData({ ...data, groups: g }) }} rows={3} />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            <button onClick={() => { const g = [...data.groups]; g[gi] = { ...group, projects: [...(group.projects || []), { id: `p-${Date.now()}`, badge: '', badgeType: 'ai', title: '', subtitle: '', problem: '', solution: '', collaboration: '', result: '', insight: '', metrics: [], highlights: [], fullWidth: false }] }; setData({ ...data, groups: g }); setExpanded(prev => ({ ...prev, [`${gi}-${(group.projects || []).length}`]: true })) }} className="text-xs text-accent hover:text-accent-light cursor-pointer">+ 프로젝트 추가</button>
          </div>
        ))}
        <button onClick={() => setData({ ...data, groups: [...(data.groups || []), { title: '', subtitle: '', projects: [] }] })} className="px-4 py-2 border border-accent text-accent hover:bg-accent/10 text-sm rounded-lg transition-colors cursor-pointer">+ 그룹 추가</button>
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── About Section ─── */

function AboutSection() {
  const [config, setConfig] = useState(loadAboutConfig)
  const [toast, setToast] = useState('')
  const [skillInput, setSkillInput] = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }
  const update = (key, value) => setConfig({ ...config, [key]: value })

  const handleSave = () => { saveAboutConfig(config); flash('소개 저장 완료') }
  const handleReset = () => { if (confirm('초기화하시겠습니까?')) { resetAboutConfig(); setConfig(loadAboutConfig()); flash('초기화 완료') } }

  const addSkill = () => {
    if (!skillInput.trim()) return
    const skills = [...(config.skills || []), { label: skillInput.trim(), category: 'default' }]
    setConfig({ ...config, skills })
    setSkillInput('')
  }

  const removeSkill = (i) => {
    setConfig({ ...config, skills: config.skills.filter((_, idx) => idx !== i) })
  }

  return (
    <div>
      <SectionHeader title="소개" description="About 섹션의 내용을 설정합니다" />
      <ActionBar>
        <SaveButton onClick={handleSave} />
        <ResetButton onClick={handleReset} />
      </ActionBar>
      <div className="space-y-4 max-w-4xl">
        <Field label="섹션 헤딩" value={config.heading || ''} onChange={(v) => update('heading', v)} rows={2} />
        <div>
          <label className="block text-xs text-gray-500 mb-1">바이오 (마크다운)</label>
          <AutoTextarea
            value={config.bio || ''}
            onChange={(v) => update('bio', v)}
            minRows={4}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white font-mono resize-y focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-2">스킬 태그</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {(config.skills || []).map((s, i) => {
              const label = typeof s === 'string' ? s : s.label
              return (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
                  {label}
                  <button onClick={() => removeSkill(i)} className="text-gray-500 hover:text-red-400 cursor-pointer">✕</button>
                </span>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())} placeholder="스킬 이름 입력 후 Enter" className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent" />
            <button onClick={addSkill} className="px-3 py-2 bg-accent text-white text-sm rounded-lg cursor-pointer">추가</button>
          </div>
        </div>
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── Achievements Section ─── */

function AchievementsSection() {
  const [config, setConfig] = useState(loadAchievementsConfig)
  const [toast, setToast] = useState('')

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2000) }

  const handleSave = () => { saveAchievementsConfig(config); flash('핵심 성과 저장 완료') }
  const handleReset = () => { if (confirm('초기화하시겠습니까?')) { resetAchievementsConfig(); setConfig(loadAchievementsConfig()); flash('초기화 완료') } }

  const items = config.items || []

  const updateItem = (i, updated) => {
    const arr = [...items]; arr[i] = updated
    setConfig({ ...config, items: arr })
  }

  const removeItem = (i) => setConfig({ ...config, items: items.filter((_, idx) => idx !== i) })

  const addItem = () => setConfig({ ...config, items: [...items, { icon: '🎯', iconBg: '#1f2937', title: '', description: '' }] })

  return (
    <div>
      <SectionHeader title="핵심 성과" description="Achievements 섹션에 표시될 성과 카드를 관리합니다" />
      <ActionBar>
        <SaveButton onClick={handleSave} />
        <ResetButton onClick={handleReset} />
        <button onClick={addItem} className="px-4 py-2 border border-accent text-accent hover:bg-accent/10 text-sm rounded-lg transition-colors cursor-pointer">+ 성과 추가</button>
      </ActionBar>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-gray-900 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-lg">{item.icon}</span>
              <button onClick={() => removeItem(i)} className="text-xs text-red-400 hover:text-red-300 cursor-pointer">삭제</button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Field label="아이콘 (이모지)" value={item.icon} onChange={(v) => updateItem(i, { ...item, icon: v })} />
              <Field label="배경색" value={item.iconBg || '#1f2937'} onChange={(v) => updateItem(i, { ...item, iconBg: v })} />
              <Field label="제목" value={item.title} onChange={(v) => updateItem(i, { ...item, title: v })} />
            </div>
            <Field label="설명" value={item.description} onChange={(v) => updateItem(i, { ...item, description: v })} rows={2} />
          </div>
        ))}
        {items.length === 0 && <p className="text-xs text-gray-600 py-4 text-center">항목이 없습니다</p>}
      </div>
      <Toast message={toast} />
    </div>
  )
}

/* ─── Main Admin ─── */

const SECTION_MAP = {
  projects: ProjectsSection,
  resume: ResumeSection,
  about: AboutSection,
  achievements: AchievementsSection,
  hero: HeroSection,
  authgate: AuthGateSection,
  contact: ContactSection,
  tokens: TokensSection,
  account: AccountSection,
}

export default function Admin({ onLogout, onViewPortfolio }) {
  const [activeSection, setActiveSection] = useState('projects')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => { clearAdminSession(); onLogout() }

  const ActiveComponent = SECTION_MAP[activeSection]
  const sectionProps = activeSection === 'account' ? { onLogout: handleLogout } : {}

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-gray-900/80 border-r border-gray-800 sticky top-0 h-screen">
        <div className="p-4 border-b border-gray-800">
          <h1 className="text-lg font-bold">관리자</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {NAV_ITEMS.map((group) => (
            <div key={group.group} className="mb-1">
              <p className="px-4 py-2 text-xs text-gray-600 font-medium uppercase tracking-wider">{group.group}</p>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-2.5 transition-colors cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-accent/10 text-accent border-r-2 border-accent'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800 space-y-1">
          {onViewPortfolio && (
            <button onClick={onViewPortfolio} className="w-full px-3 py-2 text-sm text-accent hover:bg-accent/10 rounded-lg transition-colors cursor-pointer">
              포트폴리오 보기
            </button>
          )}
          <button onClick={handleLogout} className="w-full px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800/50 rounded-lg transition-colors cursor-pointer">
            로그아웃
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur border-b border-gray-800">
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-400 hover:text-white p-1 cursor-pointer">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              {mobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              }
            </svg>
          </button>
          <h1 className="text-sm font-bold">관리자</h1>
          <div className="flex items-center gap-3">
            {onViewPortfolio && <button onClick={onViewPortfolio} className="text-xs text-accent cursor-pointer">보기</button>}
            <button onClick={handleLogout} className="text-xs text-gray-400 hover:text-red-400 cursor-pointer">로그아웃</button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-800 bg-gray-900 pb-2">
            {NAV_ITEMS.map((group) => (
              <div key={group.group}>
                <p className="px-4 py-2 text-xs text-gray-600 font-medium">{group.group}</p>
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setActiveSection(item.id); setMobileMenuOpen(false) }}
                    className={`w-full text-left px-6 py-2.5 text-sm flex items-center gap-2 cursor-pointer ${
                      activeSection === item.id ? 'text-accent bg-accent/10' : 'text-gray-400'
                    }`}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 p-6 md:p-8 pt-20 md:pt-8">
        <ActiveComponent {...sectionProps} />
      </main>
    </div>
  )
}
