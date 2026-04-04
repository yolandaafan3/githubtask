export default function StatsCard({ icon, label, value, sub, color = 'blue', trend }) {

  const colors = {
    blue:   { bg: 'bg-blue-500/10',   border: 'border-blue-500/20',   text: 'text-blue-400'   },
    green:  { bg: 'bg-green-500/10',  border: 'border-green-500/20',  text: 'text-green-400'  },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/20', text: 'text-purple-400' },
    yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', text: 'text-yellow-400' },
    red:    { bg: 'bg-red-500/10',    border: 'border-red-500/20',    text: 'text-red-400'    },
  }

  const c = colors[color] || colors.blue

  return (
    <div className={`bg-github-card border ${c.border} rounded-xl p-5 flex items-start gap-4`}>
      {/* Icono */}
      <div className={`${c.bg} ${c.border} border rounded-xl p-3 shrink-0`}>
        <span className={`${c.text} text-xl`}>{icon}</span>
      </div>

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        <p className="text-github-muted text-xs mb-1">{label}</p>
        <p className="text-white text-2xl font-bold leading-none mb-1">
          {value ?? <span className="text-github-muted text-lg">—</span>}
        </p>
        {sub && <p className="text-github-muted text-xs truncate">{sub}</p>}
        {trend !== undefined && (
          <p className={`text-xs mt-1 font-medium ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last week
          </p>
        )}
      </div>
    </div>
  )
}