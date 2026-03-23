import { useState } from 'react'
import MarkdownRenderer from './ui/MarkdownRenderer'

const BADGE_STYLES = {
  ai: 'bg-emerald-500/10 text-emerald-400',
  data: 'bg-blue-500/10 text-blue-400',
  ux: 'bg-rose-500/10 text-rose-400',
  ops: 'bg-amber-500/10 text-amber-400',
  default: 'bg-gray-800 text-gray-400',
}

const TABS = [
  { key: 'problem', label: 'Problem' },
  { key: 'solution', label: 'Solution' },
  { key: 'collaboration', label: 'Collab' },
  { key: 'result', label: 'Result' },
]

function StoryTabs({ project }) {
  const availableTabs = TABS.filter((t) => project[t.key])
  // Default to 'result' if available
  const defaultTab = availableTabs.find((t) => t.key === 'result')?.key || availableTabs[0]?.key || 'problem'
  const [active, setActive] = useState(defaultTab)

  if (availableTabs.length === 0) return null

  const isResult = active === 'result'

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide">
        {availableTabs.map((tab, i) => (
          <div key={tab.key} className="flex items-center">
            {i > 0 && <span className="text-gray-600 text-[10px] mx-1 select-none">&rarr;</span>}
            <button
              onClick={() => setActive(tab.key)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                active === tab.key
                  ? tab.key === 'result'
                    ? 'text-accent bg-accent/10'
                    : 'text-white bg-gray-800/60'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          </div>
        ))}
      </div>

      {/* Tab content */}
      {isResult ? (
        <div className="space-y-3">
          {/* Highlights summary inside result */}
          {project.highlights && project.highlights.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {project.highlights.map((h, i) => (
                <span key={i} className="text-sm">
                  <span className="font-bold text-accent">{h.value}</span>
                  <span className="text-gray-500 ml-1.5 text-xs">{h.label}</span>
                </span>
              ))}
            </div>
          )}

          {/* Result detail */}
          <div className="text-sm md:text-[15px] leading-relaxed text-gray-200">
            <MarkdownRenderer content={project.result} />
          </div>

          {/* Insight */}
          {project.insight && (
            <div className="pt-2 border-t border-gray-700/50 flex gap-2 items-start">
              <svg className="w-3.5 h-3.5 text-accent/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              <div className="text-xs text-gray-500 leading-relaxed italic">
                <MarkdownRenderer content={project.insight} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm md:text-[15px] leading-relaxed text-gray-300">
          <MarkdownRenderer content={project[active]} />
        </div>
      )}
    </div>
  )
}

export default function ProjectCard({ project }) {
  const badgeCls = BADGE_STYLES[project.badgeType] || BADGE_STYLES.default
  const hasStory = project.problem || project.solution || project.collaboration || project.result

  return (
    <div
      className="h-full flex flex-col bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
    >
      {/* Header: Badge + Title + Subtitle */}
      <div className="mb-1">
        <span className={`inline-block text-[11px] font-mono font-medium tracking-wider uppercase px-2.5 py-1 rounded mb-4 ${badgeCls}`}>
          {project.badge}
        </span>
        <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug">{project.title}</h3>
        <p className="text-sm text-gray-500">{project.subtitle}</p>
      </div>

      {/* Story Box — the entire flow in a contained box */}
      {hasStory && (
        <div className="flex-1 mt-5 bg-gray-800/30 border border-gray-800/60 rounded-xl p-4 md:p-5">
          <StoryTabs project={project} />
        </div>
      )}

      {/* Legacy description fallback */}
      {!hasStory && project.description && (
        <div className="flex-1 mt-5">
          <div className="text-sm md:text-base text-gray-400 leading-relaxed"><MarkdownRenderer content={project.description} /></div>
        </div>
      )}
    </div>
  )
}
