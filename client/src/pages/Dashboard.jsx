import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, GitBranch, CircleDot, CheckCircle, Star, RefreshCw } from 'lucide-react'
import { format, subWeeks } from 'date-fns'
import {
  fetchUserRepos,
  fetchAllIssuesForStats,
  fetchRecentActivity,
  fetchCommitActivity,
} from '../api/github'
import { useAuthStore } from '../store/authStore'
import { useRepoStore } from '../store/repoStore'
import StatsCard     from '../components/dashboard/StatsCard'
import ActivityFeed  from '../components/dashboard/ActivityFeed'
import CommitChart   from '../components/dashboard/CommitChart'
import TopRepos      from '../components/dashboard/TopRepos'
import RecentIssues  from '../components/dashboard/RecentIssues'
import UserProfile   from '../components/dashboard/UserProfile'
import Spinner       from '../components/ui/Spinner'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Share2, Check } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const user = useAuthStore(state => state.user)
  const { repos, setRepos } = useRepoStore()

  const [activity, setActivity]       = useState([])
  const [issues, setIssues]           = useState([])
  const [commitData, setCommitData]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard(isRefresh = false) {
    isRefresh ? setRefreshing(true) : setLoading(true)

    try {
      // Carga repos si aún no están en el store
      let currentRepos = repos
      if (currentRepos.length === 0) {
        currentRepos = await fetchUserRepos()
        setRepos(currentRepos)
      }

      // Carga el resto en paralelo
      const [activityData, issuesData] = await Promise.all([
        fetchRecentActivity(user.login),
        fetchAllIssuesForStats(currentRepos),
      ])

      setActivity(activityData)
      setIssues(issuesData)

      // Carga estadísticas de commits del repo más activo
      if (currentRepos.length > 0) {
        const topRepo = currentRepos[0]
        const rawCommits = await fetchCommitActivity(topRepo.owner.login, topRepo.name)
        if (rawCommits && rawCommits.length > 0) {
          // Toma las últimas 12 semanas y formatea para la gráfica
          const last12 = rawCommits.slice(-12).map((week, i) => ({
            week: format(subWeeks(new Date(), 12 - i), 'MMM d'),
            commits: week.total,
          }))
          setCommitData(last12)
        }
      }
    } catch (err) {
      console.error('Dashboard load error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // ── Métricas calculadas ──────────────────────────────────

  const totalStars   = repos.reduce((sum, r) => sum + r.stargazers_count, 0)
  const openIssues   = issues.filter(i => i.state === 'open').length
  const closedIssues = issues.filter(i => i.state === 'closed').length
  const topRepos     = [...repos].sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  const recentIssues = [...issues].sort((a, b) =>
    new Date(b.updated_at) - new Date(a.updated_at)
  )
  const [copied, setCopied] = useState(false)

  // Ratio de issues resueltos
  const resolveRate = issues.length > 0
    ? Math.round((closedIssues / issues.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Spinner size="lg" text="Loading your dashboard..." />
      </div>
    )
  }
  function handleCopyPortfolio() {
  const url = `${window.location.origin}/u/${user?.login}`
  navigator.clipboard.writeText(url)
  setCopied(true)
  setTimeout(() => setCopied(false), 2000)
}

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard size={24} className="text-github-accent" />
            Dashboard
          </h1>
          <p className="text-github-muted text-sm mt-1">
            Welcome back,{' '}
            <span className="text-white font-medium">{user?.name || user?.login}</span>
            {' '}— here's what's going on.
          </p>
        </div>

        <button
          onClick={() => loadDashboard(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-github-card border border-github-border text-github-muted hover:text-white text-sm transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <button
  onClick={handleCopyPortfolio}
  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-github-card border border-github-border text-github-muted hover:text-white text-sm transition-colors"
  title={`Your portfolio: /u/${user?.login}`}
>
  {copied
    ? <><Check size={14} className="text-green-400" /> Copied!</>
    : <><Share2 size={14} /> Share portfolio</>
  }
</button>

      {/* ── Stats cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard
          icon="📁"
          label="Total Repositories"
          value={repos.length}
          sub={`${repos.filter(r => !r.private).length} public · ${repos.filter(r => r.private).length} private`}
          color="blue"
        />
        <StatsCard
          icon="🟢"
          label="Open Issues"
          value={openIssues}
          sub="Across your top repositories"
          color="green"
        />
        <StatsCard
          icon="✅"
          label="Closed Issues"
          value={closedIssues}
          sub={`${resolveRate}% resolution rate`}
          color="purple"
        />
        <StatsCard
          icon="⭐"
          label="Total Stars"
          value={totalStars}
          sub={`Across ${repos.length} repositories`}
          color="yellow"
        />
      </div>

      {/* ── Fila principal ─────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Columna izquierda — 2/3 del ancho */}
        <div className="xl:col-span-2 space-y-6">

          {/* Gráfica de commits */}
          <div className="bg-github-card border border-github-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-white font-semibold text-sm">Commit Activity</h2>
                <p className="text-github-muted text-xs mt-0.5">
                  Last 12 weeks · {repos[0]?.name || 'top repository'}
                </p>
              </div>
              {commitData.length > 0 && (
                <span className="text-xs text-github-muted">
                  {commitData.reduce((s, w) => s + w.commits, 0)} total commits
                </span>
              )}
            </div>
            <CommitChart data={commitData} />
          </div>

          {/* Issues recientes */}
          <div className="bg-github-card border border-github-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <CircleDot size={15} className="text-green-400" />
                Recent Issues
              </h2>
              <button
                onClick={() => navigate('/repos')}
                className="text-xs text-github-blue hover:text-blue-300 transition-colors"
              >
                View all repos →
              </button>
            </div>
            <RecentIssues issues={recentIssues} />
          </div>

          {/* Repositorios más activos */}
          <div className="bg-github-card border border-github-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-semibold text-sm flex items-center gap-2">
                <GitBranch size={15} className="text-github-accent" />
                Active Repositories
              </h2>
              <button
                onClick={() => navigate('/repos')}
                className="text-xs text-github-blue hover:text-blue-300 transition-colors"
              >
                View all →
              </button>
            </div>
            <TopRepos repos={topRepos} />
          </div>
        </div>

        {/* Columna derecha — 1/3 del ancho */}
        <div className="space-y-6">

          {/* Perfil */}
          <UserProfile user={user} totalStars={totalStars} />

          {/* Resumen rápido */}
          <div className="bg-github-card border border-github-border rounded-xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <CheckCircle size={15} className="text-github-accent" />
              Quick Summary
            </h2>
            <div className="space-y-3">
              {[
                {
                  label: 'Most used language',
                  value: getMostUsedLanguage(repos),
                  color: 'text-yellow-400',
                },
                {
                  label: 'Most active repo',
                  value: topRepos[0]?.name || '—',
                  color: 'text-blue-400',
                },
                {
                  label: 'Issues this week',
                  value: getIssuesThisWeek(issues),
                  color: 'text-green-400',
                },
                {
                  label: 'Avg issues per repo',
                  value: repos.length
                    ? Math.round(issues.length / Math.min(repos.length, 5))
                    : 0,
                  color: 'text-purple-400',
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-github-muted text-xs">{label}</span>
                  <span className={`text-xs font-semibold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actividad reciente */}
          <div className="bg-github-card border border-github-border rounded-xl p-5">
            <h2 className="text-white font-semibold text-sm mb-4">
              Recent Activity
            </h2>
            <ActivityFeed events={activity} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Helpers locales ──────────────────────────────────────────

function getMostUsedLanguage(repos) {
  const counts = {}
  for (const repo of repos) {
    if (repo.language) counts[repo.language] = (counts[repo.language] || 0) + 1
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
  return sorted[0]?.[0] || '—'
}

function getIssuesThisWeek(issues) {
  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
  return issues.filter(i => new Date(i.updated_at) > oneWeekAgo).length
}