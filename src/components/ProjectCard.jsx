import { useState } from 'react'
import { motion } from 'framer-motion'

const BADGE_STYLES = {
  ai: 'bg-emerald-500/10 text-emerald-400',
  data: 'bg-blue-500/10 text-blue-400',
  ux: 'bg-rose-500/10 text-rose-400',
  ops: 'bg-amber-500/10 text-amber-400',
  default: 'bg-gray-800 text-gray-400',
}

const TABS = [
  { key: 'problem', label: 'Problem', color: 'text-red-400', activeBg: 'bg-red-400/10', border: 'border-red-400/40' },
  { key: 'solution', label: 'Solution', color: 'text-blue-400', activeBg: 'bg-blue-400/10', border: 'border-blue-400/40' },
  { key: 'collaboration', label: 'Collab', color: 'text-purple-400', activeBg: 'bg-purple-400/10', border: 'border-purple-400/40' },
  { key: 'result', label: 'Result', color: 'text-accent', activeBg: 'bg-accent/10', border: 'border-accent/40' },
]

function StoryTabs({ project }) {
  const availableTabs = TABS.filter((t) => project[t.key])
  const [active, setActive] = useState(availableTabs[0]?.key || 'problem')

  if (availableTabs.length === 0) return null

  const currentTab = TABS.find((t) => t.key === active) || TABS[0]

  return (
    <div className="mb-4">
      {/* Tab buttons */}
      <div className="flex gap-1 mb-3 overflow-x-auto">
        {availableTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
              active === tab.key
                ? `${tab.activeBg} ${tab.color} ${tab.border} border`
                : 'text-gray-500 hover:text-gray-300 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <p className={`text-sm md:text-[15px] leading-relaxed ${currentTab.color.replace('/80', '')} opacity-90`}>
        {project[active]}
      </p>
    </div>
  )
}

export default function ProjectCard({ project }) {
  const badgeCls = BADGE_STYLES[project.badgeType] || BADGE_STYLES.default
  const hasStory = project.problem || project.solution || project.collaboration || project.result

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`bg-gray-900 border border-gray-800 rounded-2xl p-5 md:p-6 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 ${
        project.fullWidth ? 'col-span-full' : ''
      }`}
    >
      {/* Badge */}
      <span className={`inline-block text-[11px] font-mono font-medium tracking-wider uppercase px-2.5 py-1 rounded mb-3 ${badgeCls}`}>
        {project.badge}
      </span>

      {/* Title */}
      <h3 className="text-lg md:text-xl font-bold text-white mb-1 leading-snug">{project.title}</h3>
      <p className="text-sm text-gray-500 mb-4">{project.subtitle}</p>

      {/* Tabbed Story Flow */}
      {hasStory && <StoryTabs project={project} />}

      {/* Legacy description fallback */}
      {!hasStory && project.description && (
        <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-4">{project.description}</p>
      )}

      {/* Highlights (big numbers) */}
      {project.highlights && project.highlights.length > 0 && (
        <div className={`grid gap-2 mb-4 ${
          project.highlights.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' :
          project.highlights.length === 3 ? 'grid-cols-3' :
          project.highlights.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {project.highlights.map((h, i) => (
            <div key={i} className="bg-gray-800/60 rounded-xl p-2.5 text-center">
              <div className="text-lg sm:text-xl font-bold text-accent">{h.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{h.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Insight */}
      {project.insight && (
        <div className="flex gap-2.5 items-start bg-accent/5 border border-accent/10 rounded-lg px-3.5 py-3">
          <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          <p className="text-sm text-accent/80 leading-relaxed">{project.insight}</p>
        </div>
      )}

      {/* Metrics tags */}
      {project.metrics && project.metrics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.metrics.map((m, i) => (
            <span key={i} className="inline-flex items-center text-xs px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full">
              {m}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
