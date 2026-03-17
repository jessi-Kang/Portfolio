import { db, hasConfig } from './firebase'
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore'

const COLLECTION = 'site'

// --- Low-level Firestore helpers ---

export async function cloudGet(docId) {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, COLLECTION, docId))
    return snap.exists() ? snap.data() : null
  } catch (e) {
    console.warn('[Firestore] read failed:', docId, e)
    return null
  }
}

export async function cloudSet(docId, data) {
  if (!db) return
  try {
    await setDoc(doc(db, COLLECTION, docId), data)
  } catch (e) {
    console.warn('[Firestore] write failed:', docId, e)
  }
}

export async function cloudDelete(docId) {
  if (!db) return
  try {
    await deleteDoc(doc(db, COLLECTION, docId))
  } catch (e) {
    console.warn('[Firestore] delete failed:', docId, e)
  }
}

// --- Sync map: Firestore doc ID → localStorage key ---

const SYNC_MAP = {
  hero: 'portfolio_hero_config',
  authgate: 'portfolio_authgate_config',
  resume: 'portfolio_resume_config',
  contact: 'portfolio_contact_config',
  case_studies: 'portfolio_case_studies',
  tokens: 'portfolio_access_tokens',
  access_log: 'portfolio_access_log',
}

// Array-type docs store data wrapped as { items: [...] }
const ARRAY_DOCS = new Set(['case_studies', 'tokens', 'access_log'])

/**
 * Pull all data from Firestore → localStorage cache.
 * Called once on app mount.
 */
export async function syncFromCloud() {
  if (!hasConfig) return

  const results = await Promise.all(
    Object.entries(SYNC_MAP).map(async ([docId, localKey]) => {
      const data = await cloudGet(docId)
      if (data) {
        const value = ARRAY_DOCS.has(docId) ? data.items : data
        localStorage.setItem(localKey, JSON.stringify(value))
      }
      return { docId, found: !!data }
    }),
  )

  return results
}

export { hasConfig as isCloudEnabled }
