import { motion } from 'framer-motion'
import SectionWrapper from './ui/SectionWrapper'

const JOURNEY = [
  { year: '2011', org: 'SK Planet', field: '위치기반 광고', color: '#6366f1' },
  { year: '2013', org: 'Coupang', field: '쇼핑 서비스', color: '#8b5cf6' },
  { year: '2014', org: 'April Rain', field: '비즈니스', color: '#a78bfa' },
  { year: '2015', org: 'Yello Travel', field: '여행', color: '#818cf8' },
  { year: '2016', org: 'NHN EDU', field: '교육', color: '#60a5fa' },
  { year: '2018', org: '29CM', field: '패션 · 쇼핑', color: '#38bdf8' },
  { year: '2020', org: 'LINE Demaecan', field: '물류 (ML)', color: '#2dd4bf' },
  { year: '2024', org: 'LINE Wallet', field: '추천 모델 (ML)', color: '#34d399' },
  { year: '2025', org: 'LINE AI Friend', field: 'AI', color: '#4ade80' },
]

export default function Journey() {
  return (
    <SectionWrapper id="journey">
      <p className="text-accent text-xs font-mono tracking-widest uppercase mb-2">Career Journey</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-10">커리어 여정</h2>

      {/* Mobile: vertical */}
      <div className="md:hidden relative max-w-sm mx-auto">
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-800" />
        {JOURNEY.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative pl-7 py-2.5 flex items-start gap-2"
          >
            {/* Dot - vertically centered with first line */}
            <div
              className="absolute left-[3px] top-[15px] w-[9px] h-[9px] rounded-full border-2 shrink-0"
              style={{ borderColor: item.color, backgroundColor: i === JOURNEY.length - 1 ? item.color : 'transparent' }}
            />
            {/* Year */}
            <span className="text-[11px] font-mono text-gray-500 shrink-0 leading-5 w-8">{item.year}</span>
            {/* Content */}
            <div className="min-w-0">
              <span className="text-[13px] font-semibold text-white leading-5 block">{item.org}</span>
              <span
                className="text-[10px] font-medium px-1.5 py-px rounded-full inline-block mt-1"
                style={{ backgroundColor: item.color + '18', color: item.color }}
              >
                {item.field}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop: horizontal */}
      <div className="hidden md:block relative">
        {/* Timeline line */}
        <div className="absolute top-4 left-0 right-0 h-px bg-gray-800" />

        <div className="flex justify-between items-start">
          {JOURNEY.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.06 }}
              className="flex flex-col items-center text-center relative"
              style={{ width: `${100 / JOURNEY.length}%` }}
            >
              {/* Dot */}
              <div
                className="w-[10px] h-[10px] rounded-full border-2 mb-3 relative z-10"
                style={{
                  borderColor: item.color,
                  backgroundColor: i === JOURNEY.length - 1 ? item.color : '#030712',
                }}
              />

              {/* Year */}
              <span className="text-xs font-mono text-gray-500 mb-1">{item.year}</span>

              {/* Field badge */}
              <span
                className="text-[9px] font-medium px-1.5 py-0.5 rounded-full mb-1 whitespace-nowrap"
                style={{ backgroundColor: item.color + '18', color: item.color }}
              >
                {item.field}
              </span>

              {/* Org */}
              <span className="text-[10px] text-gray-400 leading-tight">{item.org}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
