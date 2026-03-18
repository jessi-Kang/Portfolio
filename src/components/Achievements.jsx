import { useState } from 'react'
import { motion } from 'framer-motion'
import SectionWrapper from './ui/SectionWrapper'
import { loadAchievementsConfig } from '../utils/crypto'

export default function Achievements() {
  const [config] = useState(loadAchievementsConfig)

  if (!config.items || config.items.length === 0) return null

  return (
    <SectionWrapper id="achievements">
      <p className="text-accent text-xs font-mono tracking-widest uppercase mb-2">Key Achievements</p>
      <h2 className="text-2xl md:text-3xl font-bold mb-12">핵심 성과</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
        {config.items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors"
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3"
              style={{ background: item.iconBg || '#1f2937' }}
            >
              {item.icon}
            </div>
            <h4 className="text-sm font-bold text-white mb-1.5 leading-snug">{item.title}</h4>
            <p className="text-xs text-gray-500 leading-relaxed">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  )
}
