import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ScrollToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-gray-800/80 backdrop-blur border border-gray-700 hover:border-accent text-gray-400 hover:text-accent flex items-center justify-center transition-colors cursor-pointer shadow-lg"
          aria-label="Scroll to top"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
