import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionWrapper from './ui/SectionWrapper'
import MarkdownRenderer from './ui/MarkdownRenderer'
import { loadResumeConfig } from '../utils/crypto'

export default function Experience() {
  const [resume] = useState(loadResumeConfig)
  const hasWork = resume.work?.some((w) => w.company)

  if (!hasWork) return null

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
              <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${
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
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  )
}
