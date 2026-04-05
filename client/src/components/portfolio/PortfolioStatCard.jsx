export default function PortfolioStatCard({ icon, label, value, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-500/10   border-blue-500/20   text-blue-400',
    green:  'bg-green-500/10  border-green-500/20  text-green-400',
    yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
  }

  return (
    <div className={`${colors[color]} border rounded-xl p-4 text-center`}>
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-white text-xl font-bold">{value ?? '—'}</p>
      <p className="text-xs mt-0.5 opacity-70">{label}</p>
    </div>
  )
}