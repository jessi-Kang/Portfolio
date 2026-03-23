import QRCode from 'qrcode'
import { createAccessToken } from './crypto'

const SITE_URL = 'https://jessi-kang.com'

function esc(t) { return (t || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function md(t) {
  if (!t) return ''
  return esc(t).replace(/^[-•◦‣]\s*/gm, '• ').replace(/#{1,4}\s*/g, '').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>')
}

export async function exportPortfolioPDF({ resume, projects, achievements, hero, about, contact }) {
  // Token
  let tokenValue = ''
  try {
    const expiry = new Date(Date.now() + 10 * 86400000)
    tokenValue = createAccessToken('PDF Export', expiry.toISOString())
  } catch { tokenValue = '' }

  const qrDataUrl = await QRCode.toDataURL(SITE_URL, { width: 140, margin: 1, color: { dark: '#3b82f6', light: '#ffffff' } })

  const s = [] // sections

  // Header
  s.push(`<div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:1.5px solid #e5e7eb;margin-bottom:16px;">
    <div style="flex:1;">
      <div style="font-size:22px;font-weight:700;color:#111;margin-bottom:5px;">${esc(hero?.headline?.replace(/\n/g, ', ') || 'PM Portfolio')}</div>
      <div style="font-size:11px;color:#888;margin-bottom:10px;">${esc(hero?.subtitle || '')}</div>
      <div style="font-size:10px;color:#3b82f6;margin-bottom:3px;">${SITE_URL}</div>
      ${tokenValue ? `<div style="font-size:9px;color:#999;">Access Token: <b style="color:#333;letter-spacing:1px;">${esc(tokenValue)}</b> &nbsp;(10일 후 만료)</div>` : ''}
      ${contact?.email ? `<div style="font-size:9px;color:#999;margin-top:2px;">Contact: ${esc(contact.email)}</div>` : ''}
    </div>
    <img src="${qrDataUrl}" style="width:80px;height:80px;" />
  </div>`)

  // About
  if (about?.bio) {
    s.push(`<div style="margin-bottom:14px;"><div style="font-size:14px;font-weight:700;color:#3b82f6;margin-bottom:5px;">About</div>
      <div style="font-size:10px;color:#444;line-height:1.7;">${md(about.bio)}</div></div>`)
  }

  // Skills
  if (about?.skills?.length > 0) {
    const tags = about.skills.map(sk => {
      const label = typeof sk === 'string' ? sk : sk.label
      return `<span style="display:inline-block;font-size:9px;color:#555;background:#f3f4f6;border-radius:10px;padding:2px 8px;margin:2px 3px 2px 0;">${esc(label)}</span>`
    }).join('')
    s.push(`<div style="margin-bottom:14px;">${tags}</div>`)
  }

  // Achievements
  if (achievements?.items?.length > 0) {
    const items = achievements.items.map(it =>
      `<div style="margin-bottom:6px;"><b style="font-size:10px;color:#222;">${esc(it.icon||'')} ${esc(it.title)}</b>
      <div style="font-size:9px;color:#555;line-height:1.6;margin-top:2px;">${md(it.description)}</div></div>`
    ).join('')
    s.push(`<div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #eee;">
      <div style="font-size:14px;font-weight:700;color:#3b82f6;margin-bottom:6px;">Key Achievements</div>${items}</div>`)
  }

  // Featured Projects
  if (projects?.groups?.length > 0) {
    let html = projects.groups.map(g => {
      const pHtml = (g.projects||[]).map(p => {
        let parts = []
        if (p.problem) parts.push(`<div><span style="color:#3b82f6;font-weight:600;">Problem</span> ${md(p.problem)}</div>`)
        if (p.solution) parts.push(`<div><span style="color:#3b82f6;font-weight:600;">Solution</span> ${md(p.solution)}</div>`)
        if (p.result) parts.push(`<div style="color:#3b82f6;"><b>Result</b> ${md(p.result)}</div>`)
        if (p.insight) parts.push(`<div style="color:#888;font-style:italic;">💡 ${md(p.insight)}</div>`)
        const highlights = (p.highlights||[]).map(h => `<span style="color:#3b82f6;font-weight:700;">${esc(h.value)}</span> <span style="color:#999;font-size:8px;">${esc(h.label)}</span>`).join('&nbsp;&nbsp;')
        return `<div style="margin-bottom:10px;padding:8px;background:#fafafa;border-radius:6px;border:1px solid #eee;">
          <div style="font-size:10px;font-weight:600;color:#222;margin-bottom:3px;">${esc(p.title)}</div>
          ${p.subtitle ? `<div style="font-size:8px;color:#999;margin-bottom:4px;">${esc(p.subtitle)}</div>` : ''}
          ${highlights ? `<div style="font-size:9px;margin-bottom:4px;">${highlights}</div>` : ''}
          <div style="font-size:8px;color:#555;line-height:1.6;">${parts.join('')}</div>
        </div>`
      }).join('')
      return `<div style="margin-bottom:12px;">
        <div style="font-size:11px;font-weight:700;color:#222;margin-bottom:2px;">${esc(g.title)}</div>
        <div style="font-size:8px;color:#999;margin-bottom:6px;">${esc(g.subtitle||'')}</div>${pHtml}</div>`
    }).join('')
    s.push(`<div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #eee;">
      <div style="font-size:14px;font-weight:700;color:#3b82f6;margin-bottom:8px;">Featured Projects</div>${html}</div>`)
  }

  // Work Experience
  if (resume?.work?.length > 0) {
    const html = resume.work.filter(w => w.company).map(job => {
      const pList = (job.projects||[]).map(p => {
        const meta = [p.period, p.role, p.team].filter(Boolean).join(' · ')
        const res = p.result ? `<div style="color:#3b82f6;font-size:8px;">${md(p.result)}</div>` : ''
        return `<div style="margin-bottom:3px;"><span style="font-size:9px;color:#333;">· ${esc(p.title)}</span>
          ${meta ? `<div style="font-size:7.5px;color:#aaa;margin-left:10px;">${esc(meta)}</div>` : ''}${res}</div>`
      }).join('')
      const other = job.otherProjects ? `<div style="margin-top:4px;font-size:8px;color:#aaa;"><b>Other:</b> ${md(job.otherProjects)}</div>` : ''
      return `<div style="margin-bottom:12px;">
        <div style="font-size:11px;font-weight:700;color:#222;">${esc(job.company)}</div>
        <div style="font-size:8px;color:#888;">${esc(job.title)} | ${esc(job.period)}</div>
        ${job.leaveNote ? `<div style="font-size:7.5px;color:#bbb;">${esc(job.leaveNote)}</div>` : ''}
        <div style="margin-top:4px;padding-left:6px;">${pList}</div>${other}</div>`
    }).join('')
    s.push(`<div style="margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid #eee;">
      <div style="font-size:14px;font-weight:700;color:#3b82f6;margin-bottom:8px;">Work Experience</div>${html}</div>`)
  }

  // Education
  if (resume?.education?.length > 0) {
    const html = resume.education.filter(e => e.school).map(e =>
      `<div style="margin-bottom:4px;"><b style="font-size:10px;color:#222;">${esc(e.school)}</b>
      ${e.degree ? `<div style="font-size:8px;color:#888;">${esc(e.degree)} | ${esc(e.period)}</div>` : ''}</div>`
    ).join('')
    s.push(`<div style="margin-bottom:10px;"><div style="font-size:14px;font-weight:700;color:#3b82f6;margin-bottom:5px;">Education</div>${html}</div>`)
  }

  // Activities
  if (resume?.activities?.length > 0) {
    const html = resume.activities.filter(a => a.summary).map(a =>
      `<div style="font-size:9px;color:#444;margin-bottom:3px;">${esc(a.year||'')} ${esc(a.category||'')} — ${esc(a.summary)}</div>`
    ).join('')
    s.push(`<div style="margin-bottom:10px;"><div style="font-size:14px;font-weight:700;color:#3b82f6;margin-bottom:5px;">Activities</div>${html}</div>`)
  }

  // Render HTML → Canvas → PDF (page-split)
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:595px;padding:40px;box-sizing:border-box;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans KR","Apple SD Gothic Neo","Malgun Gothic",sans-serif;color:#333;line-height:1.5;background:#fff;'
  container.innerHTML = s.join('')
  document.body.appendChild(container)

  const html2canvas = (await import('html2canvas-pro')).default
  const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' })
  document.body.removeChild(container)

  const { jsPDF } = await import('jspdf')
  const imgW = 595 // A4 pt width
  const imgH = 842 // A4 pt height
  const pageContentH = imgH - 30 // leave space for footer

  const canvasW = canvas.width
  const canvasH = canvas.height
  const ratio = imgW / canvasW
  const totalH = canvasH * ratio
  const pages = Math.ceil(totalH / pageContentH)

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  for (let i = 0; i < pages; i++) {
    if (i > 0) doc.addPage()
    const srcY = (i * pageContentH / ratio)
    const srcH = Math.min(pageContentH / ratio, canvasH - srcY)

    const pageCanvas = document.createElement('canvas')
    pageCanvas.width = canvasW
    pageCanvas.height = srcH
    const ctx = pageCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, srcY, canvasW, srcH, 0, 0, canvasW, srcH)

    const pageImg = pageCanvas.toDataURL('image/png')
    doc.addImage(pageImg, 'PNG', 0, 0, imgW, srcH * ratio)

    // Footer
    doc.setFontSize(7).setTextColor(180, 180, 180)
    doc.text(`${SITE_URL} — Page ${i + 1}/${pages}`, imgW / 2, imgH - 12, { align: 'center' })
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
