import { useState } from 'react'
import { motion } from 'framer-motion'
import TypingAnimation from './ui/TypingAnimation'
import { loadHeroConfig, loadResumeConfig } from '../utils/crypto'
import { loadProjects } from '../data/projects'

export default function Hero() {
  const [hero] = useState(loadHeroConfig)
  const projectData = loadProjects()
  const hasProjects = projectData.groups?.some((g) => g.projects?.some((p) => p.title))
  const resume = loadResumeConfig()
  const hasResume =
    resume.education?.some((e) => e.school) ||
    resume.work?.some((w) => w.company) ||
    resume.activities?.some((a) => a.summary) ||
    !!resume.selfIntro

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Auto-compute stats from real data
  const workYears = (() => {
    const work = resume.work?.filter((w) => w.company && w.period) || []
    let months = 0
    work.forEach((w) => {
      const parts = w.period.split('~').map((s) => s.trim())
      const start = parts[0]?.match(/(\d{4})\.(\d{1,2})/)
      const end = parts[1]?.match(/(\d{4})\.(\d{1,2})/)
      if (start) {
        const sy = +start[1], sm = +start[2]
        const ey = end ? +end[1] : new Date().getFullYear()
        const em = end ? +end[2] : new Date().getMonth() + 1
        months += (ey - sy) * 12 + (em - sm)
      }
    })
    return Math.floor(months / 12)
  })()
  const totalProjects = resume.work?.reduce((sum, w) => sum + (w.projects?.length || 0), 0) || 0
  const totalCompanies = resume.work?.filter((w) => w.company).length || 0
  const stats = hero.stats?.length > 0 ? hero.stats : [
    { num: `${workYears}+`, label: 'Years Experience' },
    { num: `${totalProjects}+`, label: 'Projects' },
    { num: `${totalCompanies}`, label: 'Companies' },
  ]

  return (
    <section className="relative min-h-[100dvh] flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-accent text-sm md:text-base font-medium tracking-wider uppercase mb-6"
      >
        {hero.tagline}
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl"
      >
        {hero.headline.includes('\n') ? (
          <>
            {hero.headline.split('\n')[0]}
            <br />
            <span className="text-accent">{hero.headline.split('\n').slice(1).join('\n')}</span>
          </>
        ) : (
          hero.headline
        )}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-6 text-gray-400 text-base md:text-lg max-w-2xl"
      >
        {hero.subtitle}
      </motion.p>

      {/* Stats */}
      {stats.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-10 flex gap-6 md:gap-12 flex-wrap justify-center"
        >
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-white">{stat.num}</div>
              <div className="text-xs text-gray-500 tracking-wide mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      )}

      {/* CTA Buttons */}
      {(hasProjects || hasResume) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex items-center gap-3 flex-wrap justify-center"
        >
          {hasProjects && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollTo('projects')}
              className="px-8 py-3 bg-accent hover:bg-accent-light text-white font-medium rounded-full transition-colors cursor-pointer"
            >
              Projects
            </motion.button>
          )}
          {hasResume && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => scrollTo('experience')}
              className="px-8 py-3 border border-gray-700 hover:border-accent text-gray-300 hover:text-accent font-medium rounded-full transition-colors cursor-pointer"
            >
              Experience
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 md:bottom-10"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2"
        >
          <div className="w-1 h-2 bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
