import QRCode from 'qrcode'
import { createAccessToken } from './crypto'

const SITE_URL = 'https://jessi-kang.com'

function esc(t) { return (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function md(t) {
  if (!t) return ''
  return esc(t).replace(/^[-•◦‣]\s*/gm, '• ').replace(/#{1,4}\s*/g, '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')
}
const h2 = (text) => `<div style="font-size:13px;font-weight:700;color:#3b82f6;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #e5e7eb;">${text}</div>`
const h3 = (text) => `<div style="font-size:10.5px;font-weight:700;color:#222;margin:10px 0 4px;">${text}</div>`
const meta = (text) => `<div style="font-size:8px;color:#999;margin-bottom:4px;">${esc(text)}</div>`
const body = (text) => `<div style="font-size:8.5px;color:#444;line-height:1.7;margin-bottom:4px;">${md(text)}</div>`
const accent = (text) => `<div style="font-size:8.5px;color:#3b82f6;line-height:1.7;margin-bottom:4px;">${md(text)}</div>`
const divider = () => '<div style="border-top:1px solid #f0f0f0;margin:8px 0;"></div>'

export async function exportPortfolioPDF({ resume, projects, achievements, hero, about, contact }) {
  let tokenValue = ''
  try {
    const expiry = new Date(Date.now() + 10 * 86400000)
    tokenValue = createAccessToken('PDF Export', expiry.toISOString())
  } catch { tokenValue = '' }

  const qrDataUrl = await QRCode.toDataURL(SITE_URL, { width: 140, margin: 1, color: { dark: '#3b82f6', light: '#ffffff' } })

  const s = []

  // ─── Header ───
  const headlineText = hero?.headline ? hero.headline.split('\n').join(' / ') : 'PM Portfolio'
  s.push(`<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:12px;border-bottom:2px solid #3b82f6;margin-bottom:16px;">
    <div style="flex:1;padding-right:16px;">
      <div style="font-size:18px;font-weight:700;color:#111;margin-bottom:4px;">${esc(headlineText)}</div>
      <div style="font-size:9.5px;color:#666;margin-bottom:8px;line-height:1.5;">${esc(hero?.subtitle || '')}</div>
      <div style="font-size:9px;color:#3b82f6;">${SITE_URL}</div>
      ${tokenValue ? `<div style="font-size:8px;color:#999;margin-top:3px;">Token: <b style="color:#333;">${esc(tokenValue)}</b> (10일 후 만료)</div>` : ''}
      ${contact?.email ? `<div style="font-size:8px;color:#999;margin-top:2px;">${esc(contact.email)}</div>` : ''}
    </div>
    <img src="${qrDataUrl}" style="width:72px;height:72px;flex-shrink:0;" />
  </div>`)

  // ─── About + Skills ───
  if (about?.bio) {
    s.push(`${h2('About')}<div style="font-size:9px;color:#444;line-height:1.7;margin-bottom:6px;">${md(about.bio)}</div>`)
  }
  if (about?.skills?.length > 0) {
    const tags = about.skills.map(sk => esc(typeof sk === 'string' ? sk : sk.label)).join(' · ')
    s.push(`<div style="font-size:8px;color:#888;margin-bottom:12px;">${tags}</div>`)
  }

  // ─── Key Achievements ───
  if (achievements?.items?.length > 0) {
    s.push(h2('Key Achievements'))
    achievements.items.forEach(it => {
      s.push(`<div style="margin-bottom:8px;">
        <div style="font-size:9.5px;font-weight:600;color:#222;">${esc(it.icon||'')} ${esc(it.title)}</div>
        <div style="font-size:8px;color:#555;line-height:1.6;margin-top:2px;">${md(it.description)}</div>
      </div>`)
    })
  }

  // ─── Featured Projects ───
  if (projects?.groups?.length > 0) {
    s.push(h2('Featured Projects'))
    projects.groups.forEach(g => {
      s.push(h3(g.title))
      if (g.subtitle) s.push(meta(g.subtitle))
      ;(g.projects||[]).forEach(p => {
        s.push(`<div style="margin:6px 0 10px;padding:8px 10px;background:#fafbfc;border:1px solid #eee;border-radius:4px;page-break-inside:avoid;">`)
        s.push(`<div style="font-size:9.5px;font-weight:600;color:#222;margin-bottom:2px;">${esc(p.title)}</div>`)
        if (p.subtitle) s.push(`<div style="font-size:7.5px;color:#999;margin-bottom:5px;">${esc(p.subtitle)}</div>`)
        // Highlights
        if (p.highlights?.length > 0) {
          const hl = p.highlights.map(h => `<span style="color:#3b82f6;font-weight:700;font-size:9px;">${esc(h.value)}</span> <span style="font-size:7.5px;color:#999;">${esc(h.label)}</span>`).join('&nbsp;&nbsp;&nbsp;')
          s.push(`<div style="margin-bottom:5px;">${hl}</div>`)
        }
        if (p.problem) s.push(`<div style="font-size:8px;color:#555;line-height:1.6;margin-bottom:3px;"><span style="color:#3b82f6;font-weight:600;">Problem</span> ${md(p.problem)}</div>`)
        if (p.solution) s.push(`<div style="font-size:8px;color:#555;line-height:1.6;margin-bottom:3px;"><span style="color:#3b82f6;font-weight:600;">Solution</span> ${md(p.solution)}</div>`)
        if (p.collaboration) s.push(`<div style="font-size:8px;color:#555;line-height:1.6;margin-bottom:3px;"><span style="color:#3b82f6;font-weight:600;">Collab</span> ${md(p.collaboration)}</div>`)
        if (p.result) s.push(`<div style="font-size:8px;color:#3b82f6;line-height:1.6;margin-bottom:3px;"><b>Result</b> ${md(p.result)}</div>`)
        if (p.insight) s.push(`<div style="font-size:7.5px;color:#888;font-style:italic;margin-top:3px;">💡 ${md(p.insight)}</div>`)
        s.push('</div>')
      })
    })
  }

  // ─── Work Experience ───
  if (resume?.work?.length > 0) {
    s.push(h2('Work Experience'))
    resume.work.filter(w => w.company).forEach(job => {
      s.push(`<div style="margin-bottom:14px;page-break-inside:avoid;">`)
      s.push(`<div style="display:flex;align-items:baseline;gap:8px;margin-bottom:2px;">
        <span style="font-size:11px;font-weight:700;color:#222;">${esc(job.company)}</span>
        <span style="font-size:8px;color:#999;">${esc(job.period)}</span>
      </div>`)
      s.push(`<div style="font-size:8px;color:#3b82f6;margin-bottom:4px;">${esc(job.title)}</div>`)
      if (job.leaveNote) s.push(`<div style="font-size:7px;color:#bbb;margin-bottom:4px;">${esc(job.leaveNote)}</div>`)

      // Projects list
      ;(job.projects||[]).forEach(p => {
        s.push(`<div style="margin:4px 0;padding-left:10px;border-left:2px solid #e5e7eb;">`)
        s.push(`<div style="font-size:8.5px;font-weight:600;color:#333;">${esc(p.title)}</div>`)
        const detail = [p.period, p.role, p.team].filter(Boolean).join(' · ')
        if (detail) s.push(`<div style="font-size:7px;color:#aaa;">${esc(detail)}</div>`)
        if (p.result) s.push(`<div style="font-size:7.5px;color:#3b82f6;margin-top:1px;">${md(p.result)}</div>`)
        s.push('</div>')
      })

      // Other tasks
      if (job.otherProjects) {
        s.push(`<div style="margin-top:6px;padding-left:10px;border-left:2px solid #f0f0f0;">
          <div style="font-size:7.5px;font-weight:600;color:#aaa;margin-bottom:2px;">Other Tasks</div>
          <div style="font-size:7px;color:#999;line-height:1.5;">${md(job.otherProjects)}</div>
        </div>`)
      }
      s.push('</div>')
    })
  }

  // ─── Education ───
  if (resume?.education?.length > 0) {
    s.push(h2('Education'))
    resume.education.filter(e => e.school).forEach(e => {
      s.push(`<div style="margin-bottom:4px;">
        <span style="font-size:10px;font-weight:600;color:#222;">${esc(e.school)}</span>
        ${e.degree ? `<span style="font-size:8px;color:#888;margin-left:6px;">${esc(e.degree)} | ${esc(e.period)}</span>` : ''}
      </div>`)
    })
  }

  // ─── Activities ───
  if (resume?.activities?.length > 0) {
    s.push(h2('Activities'))
    resume.activities.filter(a => a.summary).forEach(a => {
      s.push(`<div style="font-size:8.5px;color:#444;margin-bottom:3px;"><b>${esc(a.year||'')}</b> ${esc(a.category||'')} — ${esc(a.summary)}</div>`)
    })
  }

  // ─── Render ───
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:0;top:0;width:595px;padding:36px 40px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#333;line-height:1.5;background:#fff;z-index:99999;pointer-events:none;overflow:visible;'
  container.innerHTML = s.join('')
  document.body.appendChild(container)

  await new Promise(r => setTimeout(r, 300))

  const html2canvas = (await import('html2canvas-pro')).default
  const canvas = await html2canvas(container, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    height: container.scrollHeight,
    windowHeight: container.scrollHeight,
  })
  document.body.removeChild(container)

  const { jsPDF } = await import('jspdf')
  const imgW = 595
  const imgH = 842
  const footerH = 24
  const pageContentH = imgH - footerH

  const canvasW = canvas.width
  const canvasH = canvas.height
  const ratio = imgW / canvasW
  const totalH = canvasH * ratio
  const pages = Math.ceil(totalH / pageContentH)

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  for (let i = 0; i < pages; i++) {
    if (i > 0) doc.addPage()
    const srcY = Math.floor(i * pageContentH / ratio)
    const srcH = Math.min(Math.floor(pageContentH / ratio), canvasH - srcY)
    if (srcH <= 0) break

    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvasW
    pageCanvas.height = srcH
    const ctx = pageCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, srcY, canvasW, srcH, 0, 0, canvasW, srcH)

    doc.addImage(pageCanvas.toDataURL('image/png'), 'PNG', 0, 0, imgW, srcH * ratio)
    doc.setFontSize(7).setTextColor(180, 180, 180)
    doc.text(`${SITE_URL}  —  Page ${i + 1}/${pages}`, imgW / 2, imgH - 10, { align: 'center' })
  }

  const blob = doc.output('blob')
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'JihyunKang_PM_Resume.pdf'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)

  return tokenValue
}
