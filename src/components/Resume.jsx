import { motion } from 'framer-motion'
import SectionWrapper from './ui/SectionWrapper'
import MarkdownRenderer from './ui/MarkdownRenderer'
import { loadResumeConfig } from '../utils/crypto'

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
}

export default function Resume() {
  const resume = loadResumeConfig()
  const hasEducation = resume.education?.some((e) => e.school)
  const hasWork = resume.work?.some((w) => w.company)
  const hasActivities = resume.activities?.some((a) => a.summary)
  const hasSelfIntro = !!resume.selfIntro

  if (!hasEducation && !hasWork && !hasActivities && !hasSelfIntro) return null

  return (
    <SectionWrapper id="resume">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Resume</h2>

      <div className="max-w-3xl mx-auto space-y-12">
        {/* Education */}
        {hasEducation && (
          <motion.div {...fadeUp}>
            <h3 className="text-lg font-bold text-accent mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342" />
              </svg>
              학력
            </h3>
            <div className="space-y-3">
              {resume.education.filter((e) => e.school).map((edu, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold">{edu.school}</p>
                    {edu.degree && <p className="text-gray-400 text-sm">{edu.degree}</p>}
                  </div>
                  <span className="text-gray-500 text-sm shrink-0">{edu.period}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Work */}
        {hasWork && (
          <motion.div {...fadeUp}>
            <h3 className="text-lg font-bold text-accent mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              경력
            </h3>
            <div className="space-y-3">
              {resume.work.filter((w) => w.company).map((job, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white font-semibold">{job.company}</p>
                      <p className="text-accent text-sm">{job.title}</p>
                    </div>
                    <span className="text-gray-500 text-sm shrink-0">{job.period}</span>
                  </div>
                  {job.description && (
                    <div className="text-gray-400 text-sm mt-2 leading-relaxed"><MarkdownRenderer content={job.description} /></div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Activities */}
        {hasActivities && (
          <motion.div {...fadeUp}>
            <h3 className="text-lg font-bold text-accent mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              활동
            </h3>
            <div className="space-y-2">
              {resume.activities.filter((a) => a.summary).map((act, i) => (
                <div key={i} className="bg-gray-900 rounded-xl p-4 flex items-start gap-4">
                  <span className="text-gray-500 text-sm shrink-0 w-12">{act.year}</span>
                  <span className="text-accent text-sm shrink-0 min-w-[60px]">{act.category}</span>
                  <p className="text-gray-300 text-sm">{act.summary}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Self Introduction */}
        {resume.selfIntro && (
          <motion.div {...fadeUp}>
            <h3 className="text-lg font-bold text-accent mb-4 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
              자기소개
            </h3>
            <div className="bg-gray-900 rounded-xl p-6">
              <MarkdownRenderer content={resume.selfIntro} />
            </div>
          </motion.div>
        )}
      </div>
    </SectionWrapper>
  )
}
