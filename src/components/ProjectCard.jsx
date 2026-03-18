import { useState } from 'react'

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
  const [active, setActive] = useState(availableTabs[0]?.key || 'problem')

  if (availableTabs.length === 0) return null

  return (
    <div>
      {/* Tab buttons */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto scrollbar-hide">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors cursor-pointer whitespace-nowrap ${
              active === tab.key
                ? 'text-white bg-gray-800/60'
                : 'text-gray-500 hover:text-gray-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <p className="text-sm md:text-[15px] leading-relaxed text-gray-300">
        {project[active]}
      </p>
    </div>
  )
}

function Divider() {
  return <div className="border-t border-gray-800 my-5 md:my-6" />
}

export default function ProjectCard({ project }) {
  const badgeCls = BADGE_STYLES[project.badgeType] || BADGE_STYLES.default
  const hasStory = project.problem || project.solution || project.collaboration || project.result
  const hasHighlights = project.highlights && project.highlights.length > 0
  const hasInsight = !!project.insight
  const hasMetrics = project.metrics && project.metrics.length > 0

  return (
    <div
      className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 ${
        project.fullWidth ? 'col-span-full' : ''
      }`}
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

      {/* Story Tabs */}
      {hasStory && (
        <>
          <Divider />
          <StoryTabs project={project} />
        </>
      )}

      {/* Legacy description fallback */}
      {!hasStory && project.description && (
        <>
          <Divider />
          <p className="text-sm md:text-base text-gray-400 leading-relaxed">{project.description}</p>
        </>
      )}

      {/* Insight */}
      {hasInsight && (
        <div className="mt-5 flex gap-2.5 items-start">
          <svg className="w-3.5 h-3.5 text-accent/60 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed italic">{project.insight}</p>
        </div>
      )}

      {/* Metrics tags */}
      {hasMetrics && (
        <div className="flex flex-wrap gap-1.5 mt-4">
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
