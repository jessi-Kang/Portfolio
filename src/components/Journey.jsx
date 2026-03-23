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
]

function scrollToCompany(companyId) {
  const el = document.getElementById(companyId)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-1', 'ring-accent/40', 'rounded-xl')
    setTimeout(() => el.classList.remove('ring-1', 'ring-accent/40', 'rounded-xl'), 2000)
  }
}

// Desktop uses chronological (old→new), mobile uses reverse (new→old)
const JOURNEY_DESKTOP = [...JOURNEY].reverse()

export default function Journey() {
  return (
    <SectionWrapper id="journey">
      <p className="text-accent text-xs font-mono tracking-widest uppercase mb-2">Journey</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-8 md:mb-10">Career Journey</h2>

      {/* Mobile: vertical, newest first — older items fade in on scroll */}
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
            {/* Dot */}
            <div
              className={`absolute left-[5px] top-[18px] w-[13px] h-[13px] rounded-full border-2`}
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

      {/* Desktop: horizontal, oldest→newest */}
      <div className="hidden md:block relative">
        {/* Timeline line */}
        <div className="absolute top-5 left-0 right-0 h-px bg-gray-800" />

        <div className="flex justify-between items-start">
          {JOURNEY_DESKTOP.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="flex flex-col items-center text-center relative cursor-pointer hover:scale-105 transition-transform"
              style={{ width: `${100 / JOURNEY_DESKTOP.length}%` }}
              onClick={() => scrollToCompany(item.companyId)}
            >
              {/* Dot */}
              <div
                className="w-[11px] h-[11px] rounded-full border-2 mb-3 relative z-10"
                style={{
                  borderColor: item.color,
                  backgroundColor: item.current ? item.color : '#030712',
                  boxShadow: item.current ? `0 0 8px ${item.color}60` : 'none',
                }}
              />

              {/* Year */}
              <span className="text-xs font-mono text-gray-500 mb-1.5">{item.year}</span>

              {/* Org */}
              <span className="text-xs font-semibold text-white leading-tight mb-1">
                <span className="mr-0.5">{item.emoji}</span>
                {item.org}
              </span>

              {/* Field badge */}
              <span
                className="text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap"
                style={{ backgroundColor: item.color + '18', color: item.color }}
              >
                {item.field}
              </span>

              {/* Current indicator */}
              {item.current && (
                <span className="text-[9px] font-bold text-accent mt-1.5 tracking-wider">NOW</span>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
