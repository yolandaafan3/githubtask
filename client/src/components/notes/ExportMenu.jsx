import { useState, useRef, useEffect } from 'react'
import { exportAsMarkdown, exportAsPDF } from '../../utils/exportNote'

export default function ExportMenu({ note }) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState(null) // 'pdf' | 'md' | null
  const menuRef = useRef(null)

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function handleExport(type) {
    if (!note) return
    setExporting(type)
    setOpen(false)
    try {
      if (type === 'md') {
        exportAsMarkdown(note)
      } else {
        await exportAsPDF(note)
      }
    } catch (err) {
      console.error('Error exportando:', err)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(o => !o)}
        disabled={!!exporting || !note}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
        title="Exportar nota"
      >
        {exporting ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            <span>Exportando…</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exportar</span>
            <svg className="w-3 h-3 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-1">
            <button
              onClick={() => handleExport('md')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <span className="text-lg">📝</span>
              <div>
                <div className="font-medium">Markdown (.md)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Archivo de texto con formato</div>
              </div>
            </button>
            <button
              onClick={() => handleExport('pdf')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <span className="text-lg">📄</span>
              <div>
                <div className="font-medium">PDF (.pdf)</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Documento listo para compartir</div>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}