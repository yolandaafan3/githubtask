import { GitCommit, GitPullRequest, CircleDot, Star, GitFork, MessageSquare } from 'lucide-react'
import { timeAgo } from '../../utils/helpers'

const EVENT_CONFIG = {
  PushEvent: {
    icon: <GitCommit size={14} />,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    label: (e) => `Pushed to ${e.repo.name.split('/')[1]}`,
  },
  PullRequestEvent: {
    icon: <GitPullRequest size={14} />,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    label: (e) => `${e.payload.action} PR in ${e.repo.name.split('/')[1]}`,
  },
  IssuesEvent: {
    icon: <CircleDot size={14} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    label: (e) => `${e.payload.action} issue in ${e.repo.name.split('/')[1]}`,
  },
  WatchEvent: {
    icon: <Star size={14} />,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    label: (e) => `Starred ${e.repo.name.split('/')[1]}`,
  },
  ForkEvent: {
    icon: <GitFork size={14} />,
    color: 'text-github-muted',
    bg: 'bg-github-border/30',
    label: (e) => `Forked ${e.repo.name.split('/')[1]}`,
  },
  IssueCommentEvent: {
    icon: <MessageSquare size={14} />,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    label: (e) => `Commented on ${e.repo.name.split('/')[1]}`,
  },
}

export default function ActivityFeed({ events }) {
  const filtered = events
    .filter(e => EVENT_CONFIG[e.type])
    .slice(0, 12)

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-github-muted">
        <GitCommit size={28} className="mb-2 opacity-30" />
        <p className="text-sm">No recent activity found</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {filtered.map((event, i) => {
        const config = EVENT_CONFIG[event.type]

        return (
          <div
            key={event.id || i}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-github-card transition-colors group"
          >
            {/* Icono del evento */}
            <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center shrink-0`}>
              <span className={config.color}>{config.icon}</span>
            </div>

            {/* Descripción */}
            <div className="flex-1 min-w-0">
              <p className="text-github-text text-sm truncate">
                {config.label(event)}
              </p>
              {event.type === 'PushEvent' && event.payload.commits?.[0] && (
                <p className="text-github-muted text-xs truncate mt-0.5">
                  {event.payload.commits[0].message}
                </p>
              )}
              {event.type === 'IssuesEvent' && event.payload.issue && (
                <p className="text-github-muted text-xs truncate mt-0.5">
                  {event.payload.issue.title}
                </p>
              )}
            </div>

            {/* Tiempo */}
            <span className="text-github-muted text-xs shrink-0">
              {timeAgo(event.created_at)}
            </span>
          </div>
        )
      })}
    </div>
  )
}