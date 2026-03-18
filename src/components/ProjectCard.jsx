import { motion } from 'framer-motion'
import MarkdownRenderer from './ui/MarkdownRenderer'

const BADGE_STYLES = {
  ai: 'bg-emerald-500/10 text-emerald-400',
  data: 'bg-blue-500/10 text-blue-400',
  ux: 'bg-rose-500/10 text-rose-400',
  ops: 'bg-amber-500/10 text-amber-400',
  default: 'bg-gray-800 text-gray-400',
}

export default function ProjectCard({ project }) {
  const badgeCls = BADGE_STYLES[project.badgeType] || BADGE_STYLES.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
      className={`bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-accent/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-accent/5 ${
        project.fullWidth ? 'col-span-full' : ''
      }`}
    >
      {/* Badge */}
      <span className={`inline-block text-[10px] font-mono font-medium tracking-wider uppercase px-2.5 py-1 rounded mb-4 ${badgeCls}`}>
        {project.badge}
      </span>

      {/* Title */}
      <h3 className="text-lg font-bold text-white mb-1 leading-snug">{project.title}</h3>
      <p className="text-sm text-gray-500 mb-3">{project.subtitle}</p>

      {/* Description */}
      <div className="text-sm text-gray-400 leading-relaxed mb-4">
        <MarkdownRenderer content={project.description} />
      </div>

      {/* Highlights (big numbers) */}
      {project.highlights && project.highlights.length > 0 && (
        <div className={`grid gap-3 mb-4 ${
          project.highlights.length >= 4 ? 'grid-cols-2 sm:grid-cols-4' :
          project.highlights.length === 3 ? 'grid-cols-3' :
          project.highlights.length === 2 ? 'grid-cols-2' : 'grid-cols-1'
        }`}>
          {project.highlights.map((h, i) => (
            <div key={i} className="bg-gray-800/60 rounded-xl p-3 text-center">
              <div className="text-xl sm:text-2xl font-bold text-accent">{h.value}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{h.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Metrics tags */}
      {project.metrics && project.metrics.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
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
