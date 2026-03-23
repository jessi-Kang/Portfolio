import QRCode from 'qrcode'
import { createAccessToken } from './crypto'

const SITE_URL = 'https://jessi-kang.com'

function esc(text) {
  if (!text) return ''
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function md2html(text) {
  if (!text) return ''
  return esc(text)
    .replace(/^[-•◦‣]\s*/gm, '• ')
    .replace(/#{1,4}\s*/g, '')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
}

export async function exportPortfolioPDF({ resume, projects, achievements, hero, about, contact }) {
  // Generate 10-day token
  let tokenValue = ''
  try {
    const expiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    tokenValue = createAccessToken('PDF Export', expiry.toISOString())
  } catch (e) {
    console.warn('Token creation failed:', e)
    tokenValue = ''
  }

  // QR Code
  const qrDataUrl = await QRCode.toDataURL(SITE_URL, { width: 120, margin: 1, color: { dark: '#3b82f6', light: '#ffffff' } })

  // Build HTML content
  const sections = []

  // ─── Header ───
  sections.push(`
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
      <div style="flex:1;">
        <h1 style="font-size:20px;font-weight:700;color:#111;margin:0 0 6px;">${esc(hero?.headline?.replace(/\n/g, ', ') || 'PM Portfolio')}</h1>
        <p style="font-size:10px;color:#888;margin:0 0 10px;">${esc(hero?.subtitle || '')}</p>
        <p style="font-size:9px;margin:2px 0;"><a href="${SITE_URL}" style="color:#3b82f6;text-decoration:none;">${SITE_URL}</a></p>
        ${tokenValue ? `<p style="font-size:8px;color:#999;margin:2px 0;">Access Token: <strong style="color:#333;">${esc(tokenValue)}</strong> (10일 후 만료)</p>` : ''}
        ${contact?.email ? `<p style="font-size:8px;color:#999;margin:2px 0;">Contact: ${esc(contact.email)}</p>` : ''}
      </div>
      <img src="${qrDataUrl}" style="width:70px;height:70px;" />
    </div>
    <hr style="border:none;border-top:1px solid #ddd;margin:10px 0 16px;">
  `)

  // ─── About ───
  if (about?.bio) {
    sections.push(`
      <h2 style="font-size:13px;color:#3b82f6;margin:0 0 6px;">About</h2>
      <p style="font-size:9px;color:#555;line-height:1.6;margin:0 0 12px;">${md2html(about.bio)}</p>
    `)
  }

  // ─── Key Achievements ───
  if (achievements?.items?.length > 0) {
    let items = achievements.items.map(item =>
      `<div style="margin-bottom:6px;">
        <strong style="font-size:9px;color:#222;">${esc(item.icon || '')} ${esc(item.title)}</strong>
        <div style="font-size:8px;color:#666;margin-top:2px;line-height:1.5;">${md2html(item.description)}</div>
      </div>`
    ).join('')
    sections.push(`
      <h2 style="font-size:13px;color:#3b82f6;margin:0 0 6px;">Key Achievements</h2>
      ${items}
      <hr style="border:none;border-top:1px solid #eee;margin:12px 0;">
    `)
  }

  // ─── Featured Projects ───
  if (projects?.groups?.length > 0) {
    let groupsHtml = projects.groups.map(group => {
      let projectsHtml = (group.projects || []).map(p => {
        let parts = []
        if (p.problem) parts.push(`<div style="margin-bottom:4px;"><span style="color:#3b82f6;font-weight:600;">[Problem]</span> ${md2html(p.problem)}</div>`)
        if (p.solution) parts.push(`<div style="margin-bottom:4px;"><span style="color:#3b82f6;font-weight:600;">[Solution]</span> ${md2html(p.solution)}</div>`)
        if (p.collaboration) parts.push(`<div style="margin-bottom:4px;"><span style="color:#3b82f6;font-weight:600;">[Collab]</span> ${md2html(p.collaboration)}</div>`)
        if (p.result) parts.push(`<div style="margin-bottom:4px;color:#3b82f6;"><strong>[Result]</strong> ${md2html(p.result)}</div>`)
        if (p.insight) parts.push(`<div style="color:#999;font-style:italic;">💡 ${md2html(p.insight)}</div>`)
        return `
          <div style="margin-bottom:8px;padding-left:8px;border-left:2px solid #e5e7eb;">
            <strong style="font-size:9px;color:#222;">${esc(p.title)}</strong>
            <div style="font-size:7.5px;color:#666;line-height:1.5;margin-top:3px;">${parts.join('')}</div>
          </div>`
      }).join('')
      return `
        <div style="margin-bottom:10px;">
          <strong style="font-size:10px;color:#222;">${esc(group.title)}</strong>
          <div style="font-size:7.5px;color:#999;margin:2px 0 6px;">${esc(group.subtitle || '')}</div>
          ${projectsHtml}
        </div>`
    }).join('')
    sections.push(`
      <h2 style="font-size:13px;color:#3b82f6;margin:0 0 8px;">Featured Projects</h2>
      ${groupsHtml}
      <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
    `)
  }

  // ─── Work Experience ───
  if (resume?.work?.length > 0) {
    let workHtml = resume.work.filter(w => w.company).map(job => {
      let projectsList = (job.projects || []).map(p => {
        let detail = [p.period, p.role, p.team].filter(Boolean).join(' · ')
        let resultLine = p.result ? `<div style="color:#3b82f6;font-size:7px;margin-top:1px;">${md2html(p.result)}</div>` : ''
        return `<div style="margin-bottom:4px;">
          <span style="font-size:8px;color:#333;">· ${esc(p.title)}</span>
          ${detail ? `<div style="font-size:7px;color:#aaa;margin-left:8px;">${esc(detail)}</div>` : ''}
          ${resultLine}
        </div>`
      }).join('')

      let otherHtml = ''
      if (job.otherProjects) {
        otherHtml = `<div style="margin-top:4px;font-size:7px;color:#aaa;"><strong>Other Tasks:</strong><br>${md2html(job.otherProjects)}</div>`
      }

      return `
        <div style="margin-bottom:12px;">
          <strong style="font-size:10px;color:#222;">${esc(job.company)}</strong>
          <div style="font-size:7.5px;color:#888;margin:2px 0;">${esc(job.title)} | ${esc(job.period)}</div>
          ${job.leaveNote ? `<div style="font-size:7px;color:#bbb;">${esc(job.leaveNote)}</div>` : ''}
          <div style="margin-top:4px;padding-left:6px;">${projectsList}</div>
          ${otherHtml}
        </div>`
    }).join('')
    sections.push(`
      <h2 style="font-size:13px;color:#3b82f6;margin:0 0 8px;">Work Experience</h2>
      ${workHtml}
      <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
    `)
  }

  // ─── Education ───
  if (resume?.education?.length > 0) {
    let eduHtml = resume.education.filter(e => e.school).map(edu =>
      `<div style="margin-bottom:4px;">
        <strong style="font-size:9px;color:#222;">${esc(edu.school)}</strong>
        ${edu.degree ? `<div style="font-size:8px;color:#888;">${esc(edu.degree)} | ${esc(edu.period)}</div>` : ''}
      </div>`
    ).join('')
    sections.push(`
      <h2 style="font-size:13px;color:#3b82f6;margin:0 0 6px;">Education</h2>
      ${eduHtml}
    `)
  }

  // ─── Activities ───
  if (resume?.activities?.length > 0) {
    let actHtml = resume.activities.filter(a => a.summary).map(act =>
      `<div style="font-size:8px;color:#555;margin-bottom:3px;">${esc(act.year || '')} ${esc(act.category || '')} — ${esc(act.summary)}</div>`
    ).join('')
    sections.push(`
      <h2 style="font-size:13px;color:#3b82f6;margin:6px 0 6px;">Activities</h2>
      ${actHtml}
    `)
  }

  // ─── Skills ───
  if (about?.skills?.length > 0) {
    const skillLabels = about.skills.map(s => typeof s === 'string' ? s : s.label).join(' · ')
    sections.push(`
      <h2 style="font-size:13px;color:#3b82f6;margin:10px 0 4px;">Skills</h2>
      <p style="font-size:8px;color:#555;">${esc(skillLabels)}</p>
    `)
  }

  // Create hidden container
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;left:-9999px;top:0;width:515px;font-family:-apple-system,BlinkMacSystemFont,"Noto Sans KR","Apple SD Gothic Neo",sans-serif;color:#333;line-height:1.5;'
  container.innerHTML = sections.join('')
  document.body.appendChild(container)

  // Generate PDF using html() method — uses browser font rendering
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4', putOnlyUsedFonts: true })

  await new Promise((resolve, reject) => {
    doc.html(container, {
      callback: (d) => resolve(d),
      x: 40,
      y: 40,
      width: 515,
      windowWidth: 515,
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
      },
    })
  })

  document.body.removeChild(container)

  // Footer on each page
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7).setTextColor(180, 180, 180)
    doc.text(`${SITE_URL} — Page ${i}/${pageCount}`, 297, 830, { align: 'center' })
  }

  // Download
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
