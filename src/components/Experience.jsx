import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SectionWrapper from './ui/SectionWrapper'
import MarkdownRenderer from './ui/MarkdownRenderer'
import { loadResumeConfig } from '../utils/crypto'

function ProjectAccordion({ projects }) {
  const [openIdx, setOpenIdx] = useState(null)
  const toggle = (j) => setOpenIdx((prev) => (prev === j ? null : j))

  return (
    <div className="mt-3 space-y-1">
      {projects.map((p, j) => (
        <div key={j}>
          <button
            onClick={() => toggle(j)}
            className="w-full flex items-start gap-2 text-left py-1.5 group cursor-pointer"
          >
            <svg
              className={`w-3 h-3 text-gray-600 shrink-0 mt-1 transition-transform ${openIdx === j ? 'rotate-90' : ''}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-snug">{p.title}</span>
          </button>

          <AnimatePresence>
            {openIdx === j && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="pl-5 pb-3 space-y-1.5">
                  <p className="text-xs text-gray-500">
                    {p.period}{p.role && ` · ${p.role}`}{p.team && ` · ${p.team}`}
                  </p>
                  {p.summary && (
                    <div className="text-xs text-gray-400 leading-relaxed">
                      <MarkdownRenderer content={p.summary} />
                    </div>
                  )}
                  {p.result && (
                    <div className="text-xs text-accent/80 leading-relaxed">
                      <MarkdownRenderer content={p.result} />
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}

export default function Experience() {
  const [resume] = useState(loadResumeConfig)
  const [openCompany, setOpenCompany] = useState(null)
  const hasWork = resume.work?.some((w) => w.company)

  if (!hasWork) return null

  const toggleCompany = (i) => setOpenCompany((prev) => (prev === i ? null : i))

  return (
    <SectionWrapper id="experience">
      <p className="text-accent text-xs font-mono tracking-widest uppercase mb-2">Experience</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-12">경력사항</h2>

      <div className="max-w-3xl mx-auto relative">
        {/* Timeline line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-gray-800" />

        <div className="space-y-10">
          {resume.work.filter((w) => w.company).map((job, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="relative pl-8"
            >
              {/* Dot */}
              <div className={`absolute left-[0px] top-[7px] w-[13px] h-[13px] rounded-full border-2 ${
                i === 0
                  ? 'bg-accent border-accent'
                  : 'bg-gray-950 border-accent/60'
              }`} />

              {/* Period */}
              <p className="text-xs font-mono text-gray-500 mb-1">{job.period}</p>

              {/* Company & Title */}
              <h3 className="text-lg md:text-xl font-bold text-white">{job.company}</h3>
              <p className="text-sm text-accent font-medium mb-1">{job.title}</p>

              {/* Leave note */}
              {job.leaveNote && (
                <span className="inline-block text-[11px] font-mono text-gray-500 bg-gray-800 px-2 py-0.5 rounded mt-1 mb-2">
                  {job.leaveNote}
                </span>
              )}

              {/* Description (markdown) */}
              {job.description && (
                <div className="mt-3 text-sm text-gray-400 leading-relaxed">
                  <MarkdownRenderer content={job.description} />
                </div>
              )}

              {/* Projects accordion */}
              {job.projects?.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => toggleCompany(i)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-accent transition-colors cursor-pointer"
                  >
                    <span className="text-[10px]">{openCompany === i ? '▾' : '▸'}</span>
                    <span className="font-medium">프로젝트 상세 {job.projects.length}건</span>
                  </button>

                  <AnimatePresence>
                    {openCompany === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 pl-2 border-l border-gray-800/60">
                          <ProjectAccordion projects={job.projects} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
