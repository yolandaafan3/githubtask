import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  MapPin,
  Link as LinkIcon,
  Star,
  GitFork,
  GitBranch,
  Share2,
  Check,
  Building,
  Calendar,
} from 'lucide-react'

import { fetchPublicProfile } from '../api/portfolio'
import { formatDate } from '../utils/helpers'
import LanguageBar from '../components/portfolio/LanguageBar'
import PublicRepoCard from '../components/portfolio/PublicRepoCard'
import PortfolioStatCard from '../components/portfolio/PortfolioStatCard'
import Spinner from '../components/ui/Spinner'

export default function PublicPortfolio() {
  const { username } = useParams()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [username])

  async function loadProfile() {
    setLoading(true)
    setError('')
    try {
      const data = await fetchPublicProfile(username)
      setProfile(data)
    } catch (err) {
      setError(
        err.message === 'USER_NOT_FOUND'
          ? `User "${username}" not found on GitHub.`
          : 'Failed to load profile.'
      )
    } finally {
      setLoading(false)
    }
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-github-dark flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-github-dark flex flex-col items-center justify-center gap-4">
        <h1 className="text-white text-2xl">Profile not found</h1>
        <p className="text-github-muted">{error}</p>
        <Link to="/" className="text-github-blue">Go back</Link>
      </div>
    )
  }

  if (!profile) return null

  const { user, repos, stats } = profile

  return (
    <div className="min-h-screen bg-github-dark">

      {/* HEADER */}
      <div className="border-b border-github-border p-6 flex justify-between">
        <Link to="/" className="text-white font-bold">GithubTask</Link>

        <button onClick={handleShare} className="text-sm text-github-muted">
          {copied ? 'Copied!' : 'Share'}
        </button>
      </div>

      {/* PROFILE */}
      <div className="max-w-5xl mx-auto p-6 flex gap-6 flex-wrap">

        <img
          src={user.avatar_url}
          className="w-24 h-24 rounded-xl"
        />

        <div>
          <h1 className="text-white text-2xl font-bold">
            {user.name || user.login}
          </h1>

          <p className="text-github-blue">@{user.login}</p>

          {/* GitHub */}
          <a
            href={user.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-github-muted mt-2 inline-block"
          >
            View on GitHub
          </a>

          {/* Bio */}
          {user.bio && (
            <p className="text-github-text mt-2">{user.bio}</p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-github-muted">

            {user.company && (
              <span className="flex items-center gap-1">
                <Building size={12} /> {user.company}
              </span>
            )}

            {user.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {user.location}
              </span>
            )}

            {user.blog && (
              <a
                href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <LinkIcon size={12} /> {user.blog}
              </a>
            )}

            {/* Twitter SIN lucide */}
            {user.twitter_username && (
              <a
                href={`https://twitter.com/${user.twitter_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1"
              >
                <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                  <path d="M23.643 4.937..." />
                </svg>
                @{user.twitter_username}
              </a>
            )}

            {user.created_at && (
              <span className="flex items-center gap-1">
                <Calendar size={12} />
                {formatDate(user.created_at)}
              </span>
            )}

          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="max-w-5xl mx-auto p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <PortfolioStatCard label="Repos" value={stats.totalRepos} />
        <PortfolioStatCard label="Stars" value={stats.totalStars} />
        <PortfolioStatCard label="Forks" value={stats.totalForks} />
        <PortfolioStatCard label="Followers" value={user.followers} />
      </div>

      {/* LANGUAGES */}
      {stats.topLanguages?.length > 0 && (
        <div className="max-w-5xl mx-auto p-6">
          <LanguageBar languages={stats.topLanguages} />
        </div>
      )}

      {/* REPOS */}
      <div className="max-w-5xl mx-auto p-6 grid md:grid-cols-2 gap-4">
        {repos.map(repo => (
          <PublicRepoCard key={repo.id} repo={repo} />
        ))}
      </div>
        {/* CTA — invita al visitante a crear su propio portafolio */}
<div className="bg-gradient-to-r from-github-blue/10 to-github-accent/10 border border-github-blue/20 rounded-2xl p-8 text-center">
  <div className="w-12 h-12 rounded-2xl bg-github-accent/20 border border-github-accent/30 flex items-center justify-center mx-auto mb-4">
    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  </div>

  <h3 className="text-white text-lg font-bold mb-2">
    Create your own portfolio
  </h3>

  <p className="text-github-muted text-sm mb-5 max-w-md mx-auto">
    GithubTask gives you a Kanban board, notes, global issue management
    and a public portfolio page — all connected to your GitHub account.
  </p>

  <Link
    to="/login"
    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-github-accent hover:bg-green-600 text-white text-sm font-semibold transition-colors"
  >
    Get started free →
  </Link>
</div>

{/* Footer */}
<div className="text-center text-github-muted text-xs py-4 border-t border-github-border">
  Portfolio powered by{' '}
  <Link to="/" className="text-github-blue hover:text-blue-300 transition-colors">
    GithubTask
  </Link>
  {' '}· Data from GitHub API
</div>
    </div>
  )
}