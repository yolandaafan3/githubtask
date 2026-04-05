import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * Exporta una nota como archivo Markdown (.md)
 */
export function exportAsMarkdown(note) {
  const filename = `${slugify(note.title)}.md`
  const header = `# ${note.title}\n\n> Repositorio: ${note.repo_name || 'Sin repositorio'}\n> Fecha: ${formatDate(note.updated_at || note.created_at)}\n\n---\n\n`
  const content = header + (note.content || '')

  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, filename)
}

/**
 * Exporta una nota como PDF usando el contenido Markdown renderizado en un div oculto
 */
export async function exportAsPDF(note) {
  // Crear contenedor temporal para renderizar el markdown
  const container = document.createElement('div')
  container.style.cssText = `
    position: fixed;
    top: -9999px;
    left: -9999px;
    width: 794px;
    padding: 48px;
    background: white;
    color: #1a1a1a;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 14px;
    line-height: 1.7;
    box-sizing: border-box;
  `

  // Importar marked dinámicamente
  const { marked } = await import('marked')

  const headerHTML = `
    <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px;">
      <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #111827;">${escapeHtml(note.title)}</h1>
      <div style="color: #6b7280; font-size: 12px; display: flex; gap: 16px;">
        <span>📁 ${escapeHtml(note.repo_name || 'Sin repositorio')}</span>
        <span>📅 ${formatDate(note.updated_at || note.created_at)}</span>
      </div>
    </div>
  `

  const bodyHTML = marked(note.content || '')

  container.innerHTML = `
    <style>
      h1, h2, h3, h4 { color: #111827; margin: 1.2em 0 0.5em; }
      h1 { font-size: 22px; } h2 { font-size: 18px; } h3 { font-size: 15px; }
      p { margin: 0.75em 0; }
      code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-family: monospace; }
      pre { background: #f3f4f6; padding: 12px 16px; border-radius: 6px; overflow-x: auto; }
      pre code { background: none; padding: 0; }
      blockquote { border-left: 3px solid #d1d5db; margin: 0; padding-left: 16px; color: #6b7280; }
      ul, ol { padding-left: 24px; }
      li { margin: 4px 0; }
      a { color: #3b82f6; }
      table { border-collapse: collapse; width: 100%; }
      th, td { border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left; }
      th { background: #f9fafb; font-weight: 600; }
      hr { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }
      img { max-width: 100%; }
    </style>
    ${headerHTML}
    <div>${bodyHTML}</div>
    <div style="margin-top: 48px; padding-top: 12px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 11px; text-align: center;">
      Exportado desde GithubTask · ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
    </div>
  `

  document.body.appendChild(container)

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = pageWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    let yOffset = 0
    let remainingHeight = imgHeight

    // Paginar si el contenido es más largo que una página
    while (remainingHeight > 0) {
      pdf.addImage(imgData, 'PNG', 0, -yOffset, imgWidth, imgHeight)
      remainingHeight -= pageHeight
      yOffset += pageHeight
      if (remainingHeight > 0) pdf.addPage()
    }

    pdf.save(`${slugify(note.title)}.pdf`)
  } finally {
    document.body.removeChild(container)
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function slugify(text = 'nota') {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 60) || 'nota'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    year: 'numeric', month: 'long', day: 'numeric',
  })
}

function escapeHtml(text = '') {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}