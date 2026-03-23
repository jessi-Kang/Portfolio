import QRCode from 'qrcode'
import { createAccessToken } from './crypto'

const SITE_URL = 'https://jessi-kang.com'
const PAGE_W = 595 // A4 width in pt
const PAGE_H = 842 // A4 height in pt
const MARGIN = 40
const COL_W = PAGE_W - MARGIN * 2

export async function exportPortfolioPDF({ resume, projects, achievements, hero, about, contact }) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })

  // Load Korean font (Pretendard — lightweight, good Korean/Latin coverage)
  let koreanFontLoaded = false
  try {
    const fontUrl = 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/public/static/Pretendard-Regular.otf'
    const resp = await fetch(fontUrl)
    if (resp.ok) {
      const buf = await resp.arrayBuffer()
      const bytes = new Uint8Array(buf)
      let binary = ''
      const chunk = 8192
      for (let i = 0; i < bytes.length; i += chunk) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
      }
      const base64 = btoa(binary)
      doc.addFileToVFS('Pretendard.otf', base64)
      doc.addFont('Pretendard.otf', 'Pretendard', 'normal')
      doc.setFont('Pretendard')
      koreanFontLoaded = true
    }
  } catch (e) {
    console.warn('Font load failed:', e)
  }
  if (!koreanFontLoaded) {
    // Fallback: use Helvetica (Korean characters may not render)
    doc.setFont('Helvetica')
  }

  let y = MARGIN

  const checkPage = (need = 40) => {
    if (y + need > PAGE_H - MARGIN) {
      doc.addPage()
      y = MARGIN
    }
  }

  const heading = (text, size = 14) => {
    checkPage(30)
    doc.setFontSize(size).setTextColor(59, 130, 246)
    doc.text(text, MARGIN, y)
    y += size + 6
    doc.setTextColor(51, 51, 51)
  }

  const subheading = (text, size = 11) => {
    checkPage(20)
    doc.setFontSize(size).setTextColor(30, 30, 30)
    doc.text(text, MARGIN, y)
    y += size + 4
  }

  const bodyText = (text, indent = 0, size = 9) => {
    if (!text) return
    doc.setFontSize(size).setTextColor(80, 80, 80)
    const clean = text.replace(/^[-•◦‣]\s*/gm, '· ').replace(/#{1,4}\s*/g, '')
    const lines = doc.splitTextToSize(clean, COL_W - indent)
    lines.forEach((line) => {
      checkPage(12)
      doc.text(line, MARGIN + indent, y)
      y += 11
    })
  }

  const accentText = (text, indent = 0, size = 9) => {
    if (!text) return
    doc.setFontSize(size).setTextColor(59, 130, 246)
    const clean = text.replace(/^[-•◦‣]\s*/gm, '· ').replace(/#{1,4}\s*/g, '')
    const lines = doc.splitTextToSize(clean, COL_W - indent)
    lines.forEach((line) => {
      checkPage(12)
      doc.text(line, MARGIN + indent, y)
      y += 11
    })
    doc.setTextColor(80, 80, 80)
  }

  const separator = () => {
    checkPage(10)
    doc.setDrawColor(220, 220, 220).setLineWidth(0.5)
    doc.line(MARGIN, y, PAGE_W - MARGIN, y)
    y += 8
  }

  // ─── Page 1: Header with QR + Token ───
  // Generate 10-day token
  let tokenValue = ''
  try {
    const token = createAccessToken('PDF Export', 10)
    tokenValue = token.value
  } catch {
    tokenValue = '(토큰 생성 실패)'
  }

  // QR Code
  const qrDataUrl = await QRCode.toDataURL(SITE_URL, { width: 100, margin: 1, color: { dark: '#3b82f6', light: '#ffffff' } })
  doc.addImage(qrDataUrl, 'PNG', PAGE_W - MARGIN - 80, MARGIN, 80, 80)

  // Title area
  doc.setFontSize(22).setTextColor(30, 30, 30)
  doc.text(hero?.headline?.replace(/\n/g, ', ') || 'PM Portfolio', MARGIN, y + 10)
  y += 28
  doc.setFontSize(10).setTextColor(100, 100, 100)
  doc.text(hero?.subtitle || '', MARGIN, y)
  y += 18
  doc.setFontSize(9).setTextColor(59, 130, 246)
  doc.text(`${SITE_URL}`, MARGIN, y)
  y += 14
  doc.setFontSize(8).setTextColor(100, 100, 100)
  doc.text(`Access Token: ${tokenValue}  (expires in 10 days)`, MARGIN, y)
  y += 14

  if (contact?.email) {
    doc.setFontSize(8).setTextColor(100, 100, 100)
    doc.text(`Contact: ${contact.email}`, MARGIN, y)
    y += 14
  }

  separator()

  // ─── About ───
  if (about?.bio) {
    heading('About')
    bodyText(about.bio)
    y += 4
  }

  // ─── Key Achievements ───
  if (achievements?.items?.length > 0) {
    heading('Key Achievements')
    achievements.items.forEach((item) => {
      checkPage(20)
      subheading(`${item.icon || ''} ${item.title}`, 10)
      bodyText(item.description, 8)
      y += 2
    })
  }

  separator()

  // ─── Featured Projects ───
  if (projects?.groups?.length > 0) {
    heading('Featured Projects')
    projects.groups.forEach((group) => {
      subheading(`${group.title}`, 11)
      if (group.subtitle) {
        doc.setFontSize(8).setTextColor(120, 120, 120)
        doc.text(group.subtitle, MARGIN + 4, y)
        y += 12
      }
      group.projects?.forEach((p) => {
        checkPage(30)
        subheading(`  ${p.title}`, 10)
        if (p.problem) bodyText(`[Problem] ${p.problem}`, 10, 8)
        if (p.solution) bodyText(`[Solution] ${p.solution}`, 10, 8)
        if (p.collaboration) bodyText(`[Collab] ${p.collaboration}`, 10, 8)
        if (p.result) accentText(`[Result] ${p.result}`, 10, 8)
        if (p.insight) {
          doc.setFontSize(8).setTextColor(130, 130, 130)
          const insightLines = doc.splitTextToSize(`💡 ${p.insight}`, COL_W - 14)
          insightLines.forEach((line) => { checkPage(10); doc.text(line, MARGIN + 14, y); y += 10 })
        }
        y += 4
      })
      y += 4
    })
  }

  separator()

  // ─── Work Experience ───
  if (resume?.work?.length > 0) {
    heading('Work Experience')
    resume.work.filter((w) => w.company).forEach((job) => {
      checkPage(30)
      subheading(`${job.company}`, 11)
      doc.setFontSize(8).setTextColor(100, 100, 100)
      doc.text(`${job.title} | ${job.period}`, MARGIN + 4, y)
      y += 12
      if (job.leaveNote) {
        doc.setFontSize(7).setTextColor(150, 150, 150)
        doc.text(job.leaveNote, MARGIN + 4, y)
        y += 10
      }

      job.projects?.forEach((p) => {
        checkPage(16)
        doc.setFontSize(9).setTextColor(60, 60, 60)
        doc.text(`· ${p.title}`, MARGIN + 8, y)
        y += 11
        if (p.period || p.role) {
          doc.setFontSize(7).setTextColor(140, 140, 140)
          doc.text(`${p.period || ''}${p.role ? ' · ' + p.role : ''}${p.team ? ' · ' + p.team : ''}`, MARGIN + 14, y)
          y += 9
        }
        if (p.result) accentText(p.result, 14, 7)
      })

      if (job.otherProjects) {
        checkPage(16)
        doc.setFontSize(8).setTextColor(140, 140, 140)
        doc.text('Other Tasks:', MARGIN + 8, y)
        y += 10
        bodyText(job.otherProjects, 12, 7)
      }
      y += 6
    })
  }

  separator()

  // ─── Education ───
  if (resume?.education?.length > 0) {
    heading('Education')
    resume.education.filter((e) => e.school).forEach((edu) => {
      checkPage(16)
      doc.setFontSize(10).setTextColor(40, 40, 40)
      doc.text(`${edu.school}`, MARGIN, y)
      y += 13
      if (edu.degree) {
        doc.setFontSize(8).setTextColor(100, 100, 100)
        doc.text(`${edu.degree} | ${edu.period}`, MARGIN + 4, y)
        y += 11
      }
    })
  }

  // ─── Skills ───
  if (about?.skills?.length > 0) {
    heading('Skills')
    const skillLabels = about.skills.map((s) => typeof s === 'string' ? s : s.label).join(' · ')
    bodyText(skillLabels)
    y += 4
  }

  // ─── Footer ───
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(7).setTextColor(180, 180, 180)
    doc.text(`${SITE_URL} — Page ${i}/${pageCount}`, PAGE_W / 2, PAGE_H - 20, { align: 'center' })
  }

  doc.save('Jessi_Kang_PM_Portfolio.pdf')
  return tokenValue
}
