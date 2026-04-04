import { Users, GitBranch, Star, MapPin, Link, Twitter } from 'lucide-react'

export default function UserProfile({ user, totalStars }) {
  if (!user) return null

  return (
    <div className="bg-github-card border border-github-border rounded-xl p-5">

      {/* Avatar y nombre */}
      <div className="flex items-start gap-4 mb-4">
        <img
          src={user.avatar_url}
          alt={user.login}
          className="w-16 h-16 rounded-2xl ring-2 ring-github-border"
        />
        <div className="min-w-0">
          <h3 className="text-white font-bold text-lg leading-tight">
            {user.name || user.login}
          </h3>
          <p className="text-github-blue text-sm">@{user.login}</p>
          {user.bio && (
            <p className="text-github-muted text-xs mt-1 leading-relaxed line-clamp-2">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { icon: <GitBranch size={13} />, value: user.public_repos, label: 'Repos' },
          { icon: <Users size={13} />, value: user.followers, label: 'Followers' },
          { icon: <Star size={13} />, value: totalStars, label: 'Stars' },
        ].map(({ icon, value, label }) => (
          <div key={label} className="bg-github-dark rounded-lg px-3 py-2 text-center border border-github-border">
            <div className="flex items-center justify-center gap-1 text-github-muted mb-1">
              {icon}
            </div>
            <p className="text-white font-bold text-sm">{value ?? '—'}</p>
            <p className="text-github-muted text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Info extra */}
      <div className="space-y-1.5 text-xs text-github-muted">
        {user.location && (
          <span className="flex items-center gap-2">
            <MapPin size={12} className="shrink-0" /> {user.location}
          </span>
        )}

        {user.blog && (
          <a
            href={user.blog.startsWith('http') ? user.blog : `https://${user.blog}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Link size={12} className="shrink-0" />
            <span className="truncate">{user.blog}</span>
          </a>
        )}

        {user.twitter_username && (
          <a
            href={`https://twitter.com/${user.twitter_username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <Twitter size={12} className="shrink-0" />
            @{user.twitter_username}
          </a>
        )}
      </div>

      {/* Botón GitHub */}
      <a
        href={`https://github.com/${user.login}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-github-dark border border-github-border text-github-muted hover:text-white text-xs transition-colors"
      >
        View on GitHub →
      </a>
    </div>
  )
}