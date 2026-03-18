import { createContext, useContext, useState, useCallback } from 'react'

const I18nContext = createContext()

export const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
]

const CACHE_KEY = 'portfolio_i18n_cache'

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') } catch { return {} }
}
function saveCache(c) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)) } catch {}
}

// Skip these elements when collecting text
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'SVG', 'PATH', 'CODE', 'PRE', 'NOSCRIPT'])
const MIN_TEXT_LEN = 2

function collectTextNodes(root) {
  const nodes = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (SKIP_TAGS.has(node.parentElement?.tagName)) return NodeFilter.FILTER_REJECT
      const text = node.textContent.trim()
      if (text.length < MIN_TEXT_LEN) return NodeFilter.FILTER_REJECT
      // Skip if only numbers/symbols/english technical terms
      if (/^[\d\s.+\-→%,/:;@#!?()[\]{}|&=<>]+$/.test(text)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  while (walker.nextNode()) nodes.push(walker.currentNode)
  return nodes
}

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState('ko')
  const [cache, setCache] = useState(loadCache)
  const [translating, setTranslating] = useState(false)
  const [originals, setOriginals] = useState(new Map()) // node → original text

  const setLang = useCallback((code) => {
    setLangState(code)
  }, [])

  const translatePage = useCallback(async (targetLang) => {
    if (targetLang === 'ko') {
      // Restore originals
      originals.forEach((original, node) => {
        if (node.parentElement) node.textContent = original
      })
      setOriginals(new Map())
      setLangState('ko')
      return
    }

    setTranslating(true)
    setLangState(targetLang)

    try {
      const container = document.querySelector('[data-portfolio-content]')
      if (!container) { setTranslating(false); return }

      const textNodes = collectTextNodes(container)
      const nodeMap = new Map() // original text → [nodes]
      const newOriginals = new Map()

      textNodes.forEach((node) => {
        // Use stored original if we already translated this node, else current text
        const original = originals.get(node) || node.textContent.trim()
        newOriginals.set(node, original)
        if (!nodeMap.has(original)) nodeMap.set(original, [])
        nodeMap.get(original).push(node)
      })

      setOriginals(newOriginals)

      // Find texts that need translation (not in cache)
      const allTexts = [...nodeMap.keys()]
      const uncached = allTexts.filter((t) => !cache[`${targetLang}:${t}`])

      if (uncached.length > 0) {
        // Batch translate via API
        const langName = targetLang === 'en' ? 'English' : '日本語'
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ texts: uncached, targetLang: langName }),
        })

        if (response.ok) {
          const { translations } = await response.json()
          const newCache = { ...cache }
          uncached.forEach((text, i) => {
            if (translations[i]) {
              newCache[`${targetLang}:${text}`] = translations[i]
            }
          })
          setCache(newCache)
          saveCache(newCache)

          // Apply all translations
          allTexts.forEach((original) => {
            const translated = newCache[`${targetLang}:${original}`]
            if (translated) {
              nodeMap.get(original)?.forEach((node) => {
                if (node.parentElement) node.textContent = translated
              })
            }
          })
        }
      } else {
        // All cached, apply directly
        allTexts.forEach((original) => {
          const translated = cache[`${targetLang}:${original}`]
          if (translated) {
            nodeMap.get(original)?.forEach((node) => {
              if (node.parentElement) node.textContent = translated
            })
          }
        })
      }
    } catch (e) {
      console.warn('[i18n] Translation failed:', e)
    } finally {
      setTranslating(false)
    }
  }, [cache, originals])

  return (
    <I18nContext.Provider value={{ lang, setLang, translatePage, translating }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
