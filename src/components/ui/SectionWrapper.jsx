import { motion } from 'framer-motion'

export default function SectionWrapper({ children, className = '', id }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`px-5 py-14 sm:py-20 md:px-12 lg:px-24 ${className}`}
    >
      {children}
    </motion.section>
  )
}
