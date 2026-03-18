import { readFileSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Load .env manually so non-VITE_ vars (like ANTHROPIC_API_KEY) are available
function loadDotEnv() {
  try {
    const envPath = resolve(process.cwd(), '.env')
    const content = readFileSync(envPath, 'utf-8')
    for (const line of content.split('\n')) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx === -1) continue
      const key = trimmed.slice(0, eqIdx).trim()
      const value = trimmed.slice(eqIdx + 1).trim()
      if (!process.env[key]) process.env[key] = value
    }
  } catch {}
}
loadDotEnv()

// Dev-only middleware to proxy /api/translate to Claude API
function translatePlugin() {
  return {
    name: 'translate-api',
    configureServer(server) {
      server.middlewares.use('/api/translate', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405)
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', async () => {
          try {
            const apiKey = process.env.ANTHROPIC_API_KEY
            if (!apiKey) {
              res.writeHead(500, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify({ error: 'ANTHROPIC_API_KEY not set' }))
              return
            }

            const { texts, targetLang } = JSON.parse(body)
            const numberedTexts = texts.map((t, i) => `[${i}] ${t}`).join('\n')

            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 4096,
                messages: [{
                  role: 'user',
                  content: `Translate the following Korean texts to ${targetLang}. Keep the same tone (professional portfolio). Preserve any markdown formatting, numbers, metrics, company names, and technical terms. Return ONLY a JSON array of translated strings in the same order, no explanations.\n\n${numberedTexts}`,
                }],
              }),
            })

            const data = await response.json()
            const content = data.content?.[0]?.text || '[]'
            const jsonMatch = content.match(/\[[\s\S]*\]/)
            const translations = jsonMatch ? JSON.parse(jsonMatch[0]) : texts

            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ translations }))
          } catch (e) {
            console.error('[translate]', e)
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Translation failed' }))
          }
        })
      })
    },
  }
}

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), translatePlugin()],
})
