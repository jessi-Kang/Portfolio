export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'Translation service not configured' })
  }

  try {
    const { texts, targetLang } = req.body
    if (!texts?.length || !targetLang) {
      return res.status(400).json({ error: 'Missing texts or targetLang' })
    }

    // Batch texts into a single Claude call
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
        messages: [
          {
            role: 'user',
            content: `Translate the following Korean texts to ${targetLang}. Keep the same tone (professional portfolio). Preserve any markdown formatting, numbers, metrics, company names, and technical terms. Return ONLY a JSON array of translated strings in the same order, no explanations.

${numberedTexts}`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[translate] Claude API error:', err)
      return res.status(502).json({ error: 'Translation API error' })
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || '[]'

    // Parse JSON array from response
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    const translations = jsonMatch ? JSON.parse(jsonMatch[0]) : texts

    return res.status(200).json({ translations })
  } catch (e) {
    console.error('[translate] Error:', e)
    return res.status(500).json({ error: 'Translation failed' })
  }
}
