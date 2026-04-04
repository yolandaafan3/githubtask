import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  return (
    <div className="bg-github-card border border-github-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-github-muted text-xs mb-1">{label}</p>
      <p className="text-white text-sm font-semibold">
        {payload[0].value} commits
      </p>
    </div>
  )
}

export default function CommitChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-github-muted text-sm">
        Not enough commit data yet
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#1f6feb" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#1f6feb" stopOpacity={0}   />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#30363d" vertical={false} />

        <XAxis
          dataKey="week"
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />

        <YAxis
          tick={{ fill: '#8b949e', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
        />

        <Tooltip content={<CustomTooltip />} />

        <Area
          type="monotone"
          dataKey="commits"
          stroke="#1f6feb"
          strokeWidth={2}
          fill="url(#commitGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#1f6feb', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}