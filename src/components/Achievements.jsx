import { useState } from 'react'
import SectionWrapper from './ui/SectionWrapper'
import MarkdownRenderer from './ui/MarkdownRenderer'
import { loadAchievementsConfig } from '../utils/crypto'

function scrollToProject(linkTo) {
  if (!linkTo) return
  const el = document.getElementById(`project-${linkTo}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    el.classList.add('ring-1', 'ring-accent/40', 'rounded-2xl')
    setTimeout(() => el.classList.remove('ring-1', 'ring-accent/40', 'rounded-2xl'), 2000)
  }
}

export default function Achievements() {
  const [config] = useState(loadAchievementsConfig)

  if (!config.items || config.items.length === 0) return null

  return (
    <SectionWrapper id="achievements">
      <p className="text-accent text-xs font-mono tracking-widest uppercase mb-2">Achievements</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-10">Key Achievements</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
        {config.items.map((item, i) => (
          <div
            key={i}
            onClick={() => scrollToProject(item.linkTo)}
            className={`flex items-start gap-3 md:gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 ${item.linkTo ? 'cursor-pointer' : ''}`}
          >
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-lg md:text-xl shrink-0"
              style={{ background: item.iconBg || '#1f2937' }}
            >
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-white mb-1 leading-snug">{item.title}</h4>
              <div className="text-sm text-gray-400 leading-relaxed"><MarkdownRenderer content={item.description} /></div>
              {item.linkTo && (
                <p className="text-[10px] text-accent/50 mt-2 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
                  </svg>
                  View project
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
