import { motion } from 'framer-motion'
import SectionWrapper from './ui/SectionWrapper'

const JOURNEY = [
  { year: '2025', org: 'LINE AI Friend', field: 'AI', color: '#4ade80', current: true, emoji: '🤖', companyId: 'exp-0' },
  { year: '2024', org: 'LINE Wallet', field: 'ML Recommendation', color: '#34d399', emoji: '💳', companyId: 'exp-0' },
  { year: '2020', org: 'LINE Demaecan', field: 'Logistics (ML)', color: '#2dd4bf', emoji: '🛵', companyId: 'exp-0' },
  { year: '2018', org: '29CM', field: 'Fashion · Commerce', color: '#38bdf8', emoji: '👗', companyId: 'exp-1' },
  { year: '2016', org: 'NHN EDU', field: 'EdTech', color: '#60a5fa', emoji: '📚', companyId: 'exp-2' },
  { year: '2015', org: 'Yello Travel', field: 'Travel', color: '#818cf8', emoji: '✈️', companyId: 'exp-3' },
  { year: '2014', org: 'April Rain', field: 'Startup', color: '#a78bfa', emoji: '💼', companyId: 'exp-4' },
  { year: '2013', org: 'Coupang', field: 'E-commerce', color: '#8b5cf6', emoji: '📦', companyId: 'exp-5' },
  { year: '2011', org: 'SK Planet', field: 'Location-based Ads', color: '#6366f1', emoji: '📍', companyId: 'exp-6' },
  { year: '2010', org: 'team interface', field: 'UX Consulting', color: '#4f46e5', emoji: '🎨', companyId: 'exp-7' },
]

const JOURNEY_DESKTOP = [...JOURNEY].reverse()
const COLS = 5

function scrollToCompany(companyId) {
  const el = document.getElementById(companyId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-1', 'ring-accent/40', 'rounded-xl')
    setTimeout(() => el.classList.remove('ring-1', 'ring-accent/40', 'rounded-xl'), 2000)
  }
}

function DesktopItem({ item, i }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3, delay: i * 0.04 }}
      className="flex flex-col items-center text-center cursor-pointer group"
      onClick={() => scrollToCompany(item.companyId)}
    >
      <div
        className="w-3 h-3 rounded-full border-2 mb-3 relative z-10 group-hover:scale-150 transition-transform"
        style={{
          borderColor: item.color,
          backgroundColor: item.current ? item.color : '#030712',
          boxShadow: item.current ? `0 0 10px ${item.color}60` : 'none',
        }}
      />
      <span className="text-[11px] font-mono text-gray-500 mb-1">{item.year}</span>
      <span className="text-[11px] font-semibold text-white leading-tight mb-1 group-hover:text-accent transition-colors">
        <span className="mr-0.5">{item.emoji}</span>
        {item.org}
      </span>
      <span
        className="text-[9px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
        style={{ backgroundColor: item.color + '15', color: item.color }}
      >
        {item.field}
      </span>
      {item.current && (
        <span className="text-[9px] font-bold text-accent mt-1 tracking-wider">NOW</span>
      )}
    </motion.div>
  )
}

// SVG path for S-curve connecting two rows
function SPath({ rowWidth, rowGap, cols }) {
  const itemW = rowWidth / cols
  const startX = rowWidth - itemW / 2 // right end of row 1
  const endX = rowWidth - itemW / 2   // right end of row 2 (visually left because reversed)
  const midY = rowGap / 2

  return (
    <svg
      className="absolute left-[5%] pointer-events-none"
      style={{ top: '100%', width: '90%', height: rowGap }}
      viewBox={`0 0 ${rowWidth} ${rowGap}`}
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d={`M ${startX} 0 C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${rowGap}`}
        stroke="#1f2937"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  )
}

export default function Journey() {
  const rows = []
  for (let i = 0; i < JOURNEY_DESKTOP.length; i += COLS) {
    rows.push(JOURNEY_DESKTOP.slice(i, i + COLS))
  }

  return (
    <SectionWrapper id="journey">
      <p className="text-accent text-xs font-mono tracking-widest uppercase mb-2">Journey</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10">Career Journey</h2>

      {/* Mobile */}
      <div className="md:hidden relative max-w-md mx-auto">
        <div className="absolute left-[11px] top-3 bottom-3 w-px bg-gray-800" />
        {JOURNEY.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: i <= 1 ? 0 : 0.15, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: i <= 1 ? 0.4 : 0.8 + i * 0.05, delay: i <= 1 ? i * 0.04 : 0, ease: 'easeOut' }}
            className="relative pl-9 py-3 cursor-pointer"
            onClick={() => scrollToCompany(item.companyId)}
          >
            <div
              className="absolute left-[5px] top-[18px] w-[13px] h-[13px] rounded-full border-2"
              style={{
                borderColor: item.color,
                backgroundColor: item.current ? item.color : 'transparent',
                boxShadow: item.current ? `0 0 8px ${item.color}60` : 'none',
              }}
            />
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-gray-500 shrink-0 w-10">{item.year}</span>
              <span className="text-base font-semibold text-white">{item.org}</span>
              {item.current && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-accent/20 text-accent">NOW</span>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1">
              <span className="w-10 shrink-0" />
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                style={{ backgroundColor: item.color + '18', color: item.color }}
              >
                <span>{item.emoji}</span>
                {item.field}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: S-shape with smooth curve */}
      <div className="hidden md:block max-w-4xl mx-auto">
        {rows.map((row, ri) => {
          const isReversed = ri % 2 === 1
          const items = isReversed ? [...row].reverse() : row

          return (
            <div key={ri} className="relative" style={{ marginBottom: ri < rows.length - 1 ? '48px' : 0 }}>
              {/* Horizontal line through dots */}
              <div className="absolute top-[6px] left-[10%] right-[10%] h-px bg-gray-800" />

              {/* S-curve connector to next row */}
              {ri < rows.length - 1 && (
                <SPath rowWidth={800} rowGap={48} cols={COLS} />
              )}

              <div className="flex justify-between items-start px-[5%]">
                {items.map((item, ci) => {
                  const globalIdx = ri * COLS + (isReversed ? row.length - 1 - ci : ci)
                  return (
                    <div key={ci} style={{ width: `${100 / COLS}%` }}>
                      <DesktopItem item={item} i={globalIdx} />
                    </div>
                  )
                })}
                {Array.from({ length: COLS - row.length }).map((_, ci) => (
                  <div key={`e-${ci}`} style={{ width: `${100 / COLS}%` }} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </SectionWrapper>
  )
}
