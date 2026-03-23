import { useState } from 'react'
import MarkdownRenderer from './ui/MarkdownRenderer'

const BADGE_STYLES = {
  ai: 'bg-emerald-500/10 text-emerald-400',
  data: 'bg-blue-500/10 text-blue-400',
  ux: 'bg-rose-500/10 text-rose-400',
  ops: 'bg-amber-500/10 text-amber-400',
  default: 'bg-gray-800 text-gray-400',
}

const PROCESS_TABS = [
  { key: 'problem', label: 'Problem' },
  { key: 'solution', label: 'Solution' },
  { key: 'collaboration', label: 'Collab' },
]

function ProcessTabs({ project }) {
  const availableTabs = PROCESS_TABS.filter((t) => project[t.key])
  const [active, setActive] = useState(availableTabs[0]?.key || 'problem')

  if (availableTabs.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-hide">
        {availableTabs.map((tab, i) => (
          <div key={tab.key} className="flex items-center">
            {i > 0 && <span className="text-gray-600 text-[10px] mx-1 select-none">&rarr;</span>}
            <button
              onClick={() => setActive(tab.key)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
                active === tab.key
                  ? 'text-white bg-gray-800/60'
                  : 'text-gray-500 hover:text-gray-400'
              }`}
            >
              {tab.label}
            </button>
          </div>
        ))}
      </div>

      <div className="text-sm md:text-[15px] leading-relaxed text-gray-300">
        <MarkdownRenderer content={project[active]} />
      </div>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-800 my-5 md:my-6" />
}

export default function ProjectCard({ project }) {
  const badgeCls = BADGE_STYLES[project.badgeType] || BADGE_STYLES.default
  const hasProcess = project.problem || project.solution || project.collaboration
  const hasResult = !!project.result
  const hasHighlights = project.highlights && project.highlights.length > 0
  const hasInsight = !!project.insight
  const hasMetrics = project.metrics && project.metrics.length > 0

  return (
    <div
      className="h-full flex flex-col bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5"
    >
      {/* Header: Badge + Title + Subtitle + Inline Highlights */}
      <div className="mb-1">
        <span className={`inline-block text-[11px] font-mono font-medium tracking-wider uppercase px-2.5 py-1 rounded mb-4 ${badgeCls}`}>
          {project.badge}
        </span>
        <h3 className="text-lg md:text-xl font-bold text-white mb-2 leading-snug">{project.title}</h3>
        <p className="text-sm text-gray-500">{project.subtitle}</p>

        {/* Inline highlights */}
        {hasHighlights && (
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
            {project.highlights.map((h, i) => (
              <span key={i} className="text-sm">
                <span className="font-bold text-accent">{h.value}</span>
                <span className="text-gray-500 ml-1.5 text-xs">{h.label}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Process Tabs (Problem → Solution → Collab) */}
      {hasProcess && (
        <div className="flex-1">
          <Divider />
          <ProcessTabs project={project} />
        </div>
      )}

      {/* Legacy description fallback */}
      {!hasProcess && !hasResult && project.description && (
        <div className="flex-1">
          <Divider />
          <div className="text-sm md:text-base text-gray-400 leading-relaxed"><MarkdownRenderer content={project.description} /></div>
        </div>
      )}

      {/* Result Box — accent highlight with insight integrated */}
      {hasResult && (
        <div className="mt-5 bg-accent/8 border border-accent/20 rounded-xl p-4 md:p-5 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            <span className="text-xs font-mono text-accent/80 uppercase tracking-wider font-medium">Result</span>
          </div>

          {/* Result content */}
          <div className="text-sm leading-relaxed text-gray-200">
            <MarkdownRenderer content={project.result} />
          </div>

          {/* Insight inside result box */}
          {hasInsight && (
            <div className="pt-2 border-t border-accent/10">
              <div className="flex gap-2 items-start">
                <svg className="w-3.5 h-3.5 text-accent/50 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                </svg>
                <div className="text-xs text-gray-400 leading-relaxed italic">
                  <MarkdownRenderer content={project.insight} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Metrics tags */}
      {hasMetrics && (
        <div className="flex flex-wrap gap-1.5 mt-auto pt-4">
          {project.metrics.map((m, i) => (
            <span key={i} className="text-[11px] px-2 py-0.5 text-gray-500 bg-gray-800/50 rounded">
              {m}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
