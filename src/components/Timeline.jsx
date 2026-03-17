import { motion } from 'framer-motion'
import SectionWrapper from './ui/SectionWrapper'
import { loadCaseStudies } from '../data/caseStudies'

export default function Timeline() {
  const studies = loadCaseStudies()
  const hasContent = studies.some((s) => s.title)

  if (!hasContent) return null

  const scrollToCase = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <SectionWrapper id="timeline" className="overflow-visible">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">Journey</h2>

      {/* Desktop: horizontal */}
      <div className="hidden md:block overflow-x-auto pb-4 -mx-6 px-6 overflow-y-visible">
        <div className="flex items-center justify-center min-w-max gap-0 py-2">
          {studies.map((study, index) => (
            <div key={study.id} className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToCase(study.id)}
                className="flex flex-col items-center gap-3 px-10 cursor-pointer group"
              >
                <div className="w-20 h-20 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-3xl group-hover:bg-accent/30 transition-colors">
                  {study.icon}
                </div>
                <div className="text-center">
                  <p className="text-white font-semibold text-base">{study.title}</p>
                  <p className="text-gray-500 text-xs">{study.period}</p>
                </div>
              </motion.button>
              {index < studies.length - 1 && (
                <div className="w-24 h-0.5 bg-gradient-to-r from-accent to-accent/30" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile: vertical */}
      <div className="md:hidden flex flex-col items-center gap-0">
        {studies.map((study, index) => (
          <div key={study.id} className="flex flex-col items-center">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollToCase(study.id)}
              className="flex items-center gap-4 cursor-pointer group w-full max-w-xs"
            >
              <div className="w-14 h-14 shrink-0 rounded-full bg-accent/20 border-2 border-accent flex items-center justify-center text-2xl group-hover:bg-accent/30 transition-colors">
                {study.icon}
              </div>
              <div className="text-left">
                <p className="text-white font-semibold text-sm">{study.title}</p>
                <p className="text-gray-500 text-xs">{study.period}</p>
              </div>
            </motion.button>
            {index < studies.length - 1 && (
              <div className="w-0.5 h-8 bg-gradient-to-b from-accent to-accent/30 ml-0" />
            )}
          </div>
        ))}
      </div>
    </SectionWrapper>
  )
}
