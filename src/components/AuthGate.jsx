import { useState } from 'react'
import { motion } from 'framer-motion'
import { verifyAccessToken, recordAccess, loadAuthGateConfig, ADMIN_PATH } from '../utils/crypto'

export default function AuthGate({ onSuccess }) {
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const config = loadAuthGateConfig()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!token.trim()) return
    setLoading(true)
    setError('')

    await new Promise((r) => setTimeout(r, 300))

    if (token.trim().toLowerCase() === '#admin') {
      window.location.hash = ADMIN_PATH
      setLoading(false)
      return
    }

    const result = verifyAccessToken(token.trim())
    if (result) {
      recordAccess(result.id, result.label)
      onSuccess(result.expiresAt)
    } else {
      setError('유효하지 않거나 만료된 접속 토큰입니다.')
    }
    setLoading(false)
  }

  const headlineParts = config.headline.split('\n')

  return (
    <div className="relative min-h-screen bg-gray-950 flex flex-col items-center justify-center px-6 text-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-transparent pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative text-accent text-sm md:text-base font-medium tracking-wider uppercase mb-6"
      >
        {config.tagline}
      </motion.p>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="relative text-3xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl"
      >
        {headlineParts.length > 1 ? (
          <>
            {headlineParts[0]}
            <br />
            <span className="text-accent">{headlineParts.slice(1).join('\n')}</span>
          </>
        ) : (
          config.headline
        )}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="relative mt-4 text-gray-400 text-base md:text-lg max-w-2xl"
      >
        {config.subtitle}
      </motion.p>

      {/* Auth Card - input only */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="relative w-full max-w-md mt-12"
      >
        <div className="bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 border border-gray-800/60 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              value={token}
              onChange={(e) => { setToken(e.target.value); setError('') }}
              placeholder="접속 토큰을 입력하세요"
              autoFocus
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-gray-800/80 border border-gray-700/60 rounded-xl px-4 py-3.5 text-white text-center tracking-widest font-mono focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50 placeholder:text-gray-600 placeholder:tracking-normal placeholder:font-sans transition-colors"
            />

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <motion.button
              type="submit"
              disabled={loading || !token.trim()}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3.5 bg-accent hover:bg-accent-light disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-colors cursor-pointer"
            >
              {loading ? '확인 중...' : config.buttonText}
            </motion.button>
          </form>
        </div>

        {/* Contact info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center space-y-2"
        >
          <p className="text-gray-500 text-sm">
            {config.contactMessage}
          </p>
          <a
            href={`mailto:${config.contactEmail}?subject=포트폴리오 접속 토큰 요청`}
            className="inline-flex items-center gap-2 text-accent hover:text-accent-light text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            {config.contactEmail}
          </a>
          <p className="text-gray-600 text-xs">{config.contactHint}</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
