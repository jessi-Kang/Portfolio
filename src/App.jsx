import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Hero from './components/Hero'
import About from './components/About'
import Journey from './components/Journey'
import Projects from './components/Projects'
import Experience from './components/Experience'
import Achievements from './components/Achievements'
import Resume from './components/Resume'
import Contact from './components/Contact'
import Admin from './components/Admin'
import AuthGate from './components/AuthGate'
import AdminLogin from './components/AdminLogin'
import ScrollToTop from './components/ui/ScrollToTop'
import { isAdminSessionValid, ADMIN_PATH } from './utils/crypto'
import { syncFromCloud, isCloudEnabled } from './utils/db'

function TokenExpiryBanner({ expiresAt }) {
  const [visible, setVisible] = useState(true)

  if (!expiresAt || !visible) return null

  const expiryDate = new Date(expiresAt)
  const now = Date.now()
  const diffMs = expiresAt - now
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  let remaining
  if (diffDays > 0) {
    remaining = `${diffDays}d ${diffHours}h`
  } else if (diffHours > 0) {
    remaining = `${diffHours}h`
  } else {
    const diffMin = Math.max(1, Math.floor(diffMs / (1000 * 60)))
    remaining = `${diffMin}m`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -40, opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-900/90 backdrop-blur-md border-b border-gray-800/60 text-sm"
      >
        <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <span className="text-gray-400">
          Access expires: <span className="text-white font-medium">{expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-accent ml-1.5">({remaining} left)</span>
        </span>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-600 hover:text-gray-300 ml-1 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  )
}

function App() {
  const adminHash = `#${ADMIN_PATH}`
  const [isAdmin, setIsAdmin] = useState(window.location.hash === adminHash)
  // Visitor auth is memory-only: refresh = re-auth required
  const [visitorAuth, setVisitorAuth] = useState(false)
  const [tokenExpiresAt, setTokenExpiresAt] = useState(null)
  const [adminAuth, setAdminAuth] = useState(isAdminSessionValid)
  const [cloudReady, setCloudReady] = useState(!isCloudEnabled)

  useEffect(() => {
    if (isCloudEnabled) {
      syncFromCloud().finally(() => setCloudReady(true))
    }
  }, [])

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === adminHash)
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [adminHash])

  if (!cloudReady) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 text-sm animate-pulse">Loading...</div>
      </div>
    )
  }

  if (isAdmin) {
    if (!adminAuth) {
      return <AdminLogin onSuccess={() => setAdminAuth(true)} />
    }
    return <Admin onLogout={() => setAdminAuth(false)} onViewPortfolio={() => { setVisitorAuth(true); window.location.hash = '' }} />
  }

  if (!visitorAuth) {
    return (
      <AuthGate
        onSuccess={(expiresAt) => {
          setTokenExpiresAt(expiresAt)
          setVisitorAuth(true)
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <TokenExpiryBanner expiresAt={tokenExpiresAt} />
      <Hero />
      <About />
      <Journey />
      <Achievements />
      <Projects />
      <Experience />
      <Resume />
      <Contact />
      <ScrollToTop />
    </div>
  )
}

export default App
