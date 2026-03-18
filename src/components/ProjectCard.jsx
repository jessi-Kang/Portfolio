import { motion } from 'framer-motion'

const BADGE_STYLES = {
  ai: 'bg-emerald-500/10 text-emerald-400',
  data: 'bg-blue-500/10 text-blue-400',
  ux: 'bg-rose-500/10 text-rose-400',
  ops: 'bg-amber-500/10 text-amber-400',
  default: 'bg-gray-800 text-gray-400',
}

const STEP_ICONS = {
  problem: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
  ),
  solution: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  collaboration: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  ),
  result: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
}

const STEP_LABELS = {
  problem: 'Problem',
  solution: 'Solution',
  collaboration: 'Collaboration',
  result: 'Result',
}

const STEP_COLORS = {
  problem: 'text-red-400/80',
  solution: 'text-blue-400/80',
  collaboration: 'text-purple-400/80',
  result: 'text-accent',
}

function StoryStep({ type, text }) {
  if (!text) return null
  return (
    <div className="flex gap-3 items-start">
      <div className={`shrink-0 mt-0.5 ${STEP_COLORS[type]}`}>
        {STEP_ICONS[type]}
      </div>
      <div className="min-w-0">
        <span className={`text-[11px] font-mono uppercase tracking-wider ${STEP_COLORS[type]}`}>
          {STEP_LABELS[type]}
        </span>
        <p className="text-[13px] md:text-sm text-gray-400 leading-relaxed mt-0.5">{text}</p>
      </div>
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
      <span className={`inline-block text-[10px] font-mono font-medium tracking-wider uppercase px-2.5 py-1 rounded mb-3 ${badgeCls}`}>
        {project.badge}
      </span>

      {/* Title */}
      <h3 className="text-base md:text-lg font-bold text-white mb-1 leading-snug">{project.title}</h3>
      <p className="text-xs text-gray-500 mb-4">{project.subtitle}</p>

      {/* Structured Story Flow */}
      {hasStory && (
        <div className="space-y-3 mb-4">
          <StoryStep type="problem" text={project.problem} />
          <StoryStep type="solution" text={project.solution} />
          <StoryStep type="collaboration" text={project.collaboration} />
          <StoryStep type="result" text={project.result} />
        </div>
      )}

      {/* Legacy description fallback */}
      {!hasStory && project.description && (
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{project.description}</p>
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
              <div className="text-base sm:text-lg font-bold text-accent">{h.value}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{h.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Insight */}
      {project.insight && (
        <div className="flex gap-2.5 items-start bg-accent/5 border border-accent/10 rounded-lg px-3 py-2.5">
          <svg className="w-4 h-4 text-accent shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          <p className="text-xs text-accent/80 leading-relaxed">{project.insight}</p>
        </div>
      )}

      {/* Metrics tags */}
      {project.metrics && project.metrics.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {project.metrics.map((m, i) => (
            <span key={i} className="inline-flex items-center text-[11px] px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full">
              {m}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  )
}
