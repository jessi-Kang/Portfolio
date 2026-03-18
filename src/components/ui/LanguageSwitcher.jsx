import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useI18n, LANGUAGES } from '../../utils/i18n'

export default function LanguageSwitcher() {
  const { lang, translatePage, translating } = useI18n()
  const [open, setOpen] = useState(false)
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0]

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800/80 backdrop-blur border border-gray-700 hover:border-accent text-sm text-gray-300 hover:text-accent transition-colors cursor-pointer shadow-lg"
        disabled={translating}
      >
        {translating ? (
          <span className="animate-spin w-3.5 h-3.5 border-2 border-gray-500 border-t-accent rounded-full" />
        ) : (
          <span className="text-xs">{current.flag}</span>
        )}
        <span className="text-xs font-medium">{current.label}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-1 bg-gray-800/95 backdrop-blur border border-gray-700 rounded-lg overflow-hidden shadow-xl min-w-[120px]"
          >
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => {
                  setOpen(false)
                  if (l.code !== lang) translatePage(l.code)
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-gray-700/50 transition-colors cursor-pointer ${
                  l.code === lang ? 'text-accent' : 'text-gray-300'
                }`}
              >
                <span>{l.flag}</span>
                <span>{l.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
