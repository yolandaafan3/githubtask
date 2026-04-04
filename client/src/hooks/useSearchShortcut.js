import { useEffect } from 'react'
import { useSearchStore } from '../store/searchStore'

export function useSearchShortcut() {
  const { open, isOpen, close } = useSearchStore()

  useEffect(() => {
    function onKey(e) {
      // Cmd+K en Mac, Ctrl+K en Linux/Windows
      const isMac     = navigator.platform.toUpperCase().includes('MAC')
      const modifier  = isMac ? e.metaKey : e.ctrlKey

      if (modifier && e.key === 'k') {
        e.preventDefault()
        isOpen ? close() : open()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])
}