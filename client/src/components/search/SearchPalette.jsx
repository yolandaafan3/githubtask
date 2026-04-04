import { useEffect, useRef } from 'react'
import { Search, Command, ArrowUp, ArrowDown, CornerDownLeft, X } from 'lucide-react'
import { useSearchStore } from '../../store/searchStore'
import { useGlobalSearch } from '../../hooks/useGlobalSearch'
import SearchResult from './SearchResult'

export default function SearchPalette() {
  const {
    isOpen, close,
    query, setQuery,
    results, loading,
    selectedIndex, moveDown, moveUp, setSelectedIndex,
  } = useSearchStore()

  const { getFlatResults, goToResult } = useGlobalSearch()
  const inputRef = useRef(null)
  const flat = getFlatResults()
  const total = flat.length

  const hasResults = total > 0
  const isEmpty    = !loading && query.trim() && !hasResults

  // Focus al input cuando abre
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 50)
  }, [isOpen])

  // Navegación con teclado
  useEffect(() => {
    if (!isOpen) return

    function onKey(e) {
      if (e.key === 'ArrowDown')  { e.preventDefault(); moveDown(total) }
      if (e.key === 'ArrowUp')    { e.preventDefault(); moveUp(total)   }
      if (e.key === 'Enter' && flat[selectedIndex]) {
        e.preventDefault()
        goToResult(flat[selectedIndex])
      }
      if (e.key === 'Escape') close()
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, flat, selectedIndex, total])

  if (!isOpen) return null

  // Agrupa resultados por tipo para mostrar headers
  const sections = [
    { label: 'Repositories', items: results.repos,  type: 'repo'  },
    { label: 'Issues',       items: results.issues, type: 'issue' },
    { label: 'Notes',        items: results.notes,  type: 'note'  },
  ].filter(s => s.items.length > 0)

  // Calcula el índice global de cada item para saber si está seleccionado
  let globalIndex = 0

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">

      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={close}
      />

      {/* Paleta */}
      <div className="relative w-full max-w-2xl bg-github-card border border-github-border rounded-2xl shadow-2xl overflow-hidden">

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-github-border">
          <Search size={18} className="text-github-muted shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search repositories, issues, notes..."
            className="flex-1 bg-transparent text-white text-sm placeholder-github-muted focus:outline-none"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-github-border border-t-github-blue rounded-full animate-spin shrink-0" />
          )}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="text-github-muted hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-github-dark border border-github-border text-github-muted text-xs">
            Esc
          </kbd>
        </div>

        {/* Resultados */}
        <div className="max-h-[60vh] overflow-y-auto py-2">

          {/* Estado vacío inicial */}
          {!query.trim() && (
            <div className="flex flex-col items-center justify-center py-12 text-github-muted">
              <Search size={32} className="mb-3 opacity-20" />
              <p className="text-sm">Start typing to search</p>
              <p className="text-xs mt-1 opacity-60">Repos, issues and notes — all in one place</p>
            </div>
          )}

          {/* Sin resultados */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center py-12 text-github-muted">
              <p className="text-sm">No results for <span className="text-white">"{query}"</span></p>
              <p className="text-xs mt-1 opacity-60">Try a different search term</p>
            </div>
          )}

          {/* Secciones de resultados */}
          {sections.map(section => (
            <div key={section.type} className="mb-2">
              {/* Header de sección */}
              <p className="px-6 py-1.5 text-xs font-semibold text-github-muted uppercase tracking-wider">
                {section.label}
              </p>

              {section.items.map(item => {
                const currentIndex = globalIndex++
                const isSelected   = currentIndex === selectedIndex

                return (
                  <SearchResult
                    key={`${section.type}-${item.id}`}
                    item={{ type: section.type, data: item }}
                    isSelected={isSelected}
                    onHover={() => setSelectedIndex(currentIndex)}
                    onSelect={() => goToResult({ type: section.type, data: item })}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Footer con shortcuts */}
        {hasResults && (
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-github-border bg-github-dark/50">
            <div className="flex items-center gap-4 text-xs text-github-muted">
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-github-card border border-github-border">
                  <ArrowUp size={10} />
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-github-card border border-github-border">
                  <ArrowDown size={10} />
                </kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-github-card border border-github-border">
                  <CornerDownLeft size={10} />
                </kbd>
                Open
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-1.5 py-0.5 rounded bg-github-card border border-github-border text-xs">
                  Esc
                </kbd>
                Close
              </span>
            </div>
            <span className="text-xs text-github-muted">
              {total} result{total !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}