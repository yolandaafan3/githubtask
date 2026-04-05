const LANG_COLORS = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python:     '#3572A5',
  Rust:       '#dea584',
  Go:         '#00ADD8',
  Java:       '#b07219',
  CSS:        '#563d7c',
  HTML:       '#e34c26',
  Ruby:       '#701516',
  Swift:      '#ffac45',
  Kotlin:     '#A97BFF',
  'C++':      '#f34b7d',
  C:          '#555555',
  PHP:        '#4F5D95',
  Shell:      '#89e051',
  Dart:       '#00B4AB',
  Scala:      '#c22d40',
  Elixir:     '#6e4a7e',
}

export default function LanguageBar({ languages }) {
  if (!languages || languages.length === 0) return null

  const total = languages.reduce((s, l) => s + l.count, 0)

  return (
    <div className="space-y-3">
      {/* Barra de progreso combinada */}
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5">
        {languages.map(({ lang, count }) => (
          <div
            key={lang}
            className="h-full rounded-full transition-all"
            style={{
              width:           `${(count / total) * 100}%`,
              backgroundColor: LANG_COLORS[lang] || '#8b949e',
            }}
            title={`${lang}: ${Math.round((count / total) * 100)}%`}
          />
        ))}
      </div>

      {/* Leyenda */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {languages.map(({ lang, count }) => (
          <div key={lang} className="flex items-center gap-1.5 text-xs text-github-muted">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: LANG_COLORS[lang] || '#8b949e' }}
            />
            <span className="text-github-text">{lang}</span>
            <span>{Math.round((count / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}