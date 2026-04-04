import { Octokit } from '@octokit/rest'
import { useAuthStore } from '../store/authStore'

// Crea una instancia de Octokit con el token del usuario actual
export function getOctokit() {
  const token = useAuthStore.getState().token
  return new Octokit({ auth: token })
}

// ─── REPOSITORIOS ───────────────────────────────────────────

export async function fetchUserRepos() {
  const octokit = getOctokit()
  const allRepos = []
  let page = 1

  // GitHub pagina los repos de 100 en 100, los traemos todos
  while (true) {
    const { data } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      page,
      sort: 'updated',
    })

    allRepos.push(...data)
    if (data.length < 100) break
    page++
  }

  return allRepos
}

export async function fetchRepo(owner, repo) {
  const octokit = getOctokit()
  const { data } = await octokit.repos.get({ owner, repo })
  return data
}

// ─── ISSUES ─────────────────────────────────────────────────

export async function fetchIssues(owner, repo, filters = {}) {
  const octokit = getOctokit()
  const allIssues = []
  let page = 1

  while (true) {
    const { data } = await octokit.issues.listForRepo({
      owner,
      repo,
      state: filters.state || 'all',
      labels: filters.labels || undefined,
      assignee: filters.assignee || undefined,
      per_page: 100,
      page,
    })

    // GitHub incluye pull requests en issues, los filtramos
    const onlyIssues = data.filter(issue => !issue.pull_request)
    allIssues.push(...onlyIssues)
    if (data.length < 100) break
    page++
  }

  return allIssues
}

export async function createIssue(owner, repo, { title, body, labels, assignees }) {
  const octokit = getOctokit()
  const { data } = await octokit.issues.create({
    owner,
    repo,
    title,
    body: body || '',
    labels: labels || [],
    assignees: assignees || [],
  })
  return data
}

export async function updateIssue(owner, repo, issueNumber, updates) {
  const octokit = getOctokit()
  const { data } = await octokit.issues.update({
    owner,
    repo,
    issue_number: issueNumber,
    ...updates,
  })
  return data
}

export async function closeIssue(owner, repo, issueNumber) {
  return updateIssue(owner, repo, issueNumber, { state: 'closed' })
}

export async function reopenIssue(owner, repo, issueNumber) {
  return updateIssue(owner, repo, issueNumber, { state: 'open' })
}

// ─── LABELS ─────────────────────────────────────────────────

export async function fetchLabels(owner, repo) {
  const octokit = getOctokit()
  const { data } = await octokit.issues.listLabelsForRepo({
    owner,
    repo,
    per_page: 100,
  })
  return data
}

export async function createLabel(owner, repo, { name, color, description }) {
  const octokit = getOctokit()
  const { data } = await octokit.issues.createLabel({
    owner,
    repo,
    name,
    color: color.replace('#', ''),
    description: description || '',
  })
  return data
}

// ─── COLABORADORES ──────────────────────────────────────────

export async function fetchCollaborators(owner, repo) {
  const octokit = getOctokit()
  try {
    const { data } = await octokit.repos.listCollaborators({
      owner,
      repo,
      per_page: 100,
    })
    return data
  } catch {
    // Si es un repo personal sin colaboradores, retorna solo el dueño
    return []
  }
}

// ─── COMMENTS ───────────────────────────────────────────────

export async function fetchComments(owner, repo, issueNumber) {
  const octokit = getOctokit()
  const { data } = await octokit.issues.listComments({
    owner,
    repo,
    issue_number: issueNumber,
    per_page: 100,
  })
  return data
}

export async function createComment(owner, repo, issueNumber, body) {
  const octokit = getOctokit()
  const { data } = await octokit.issues.createComment({
    owner,
    repo,
    issue_number: issueNumber,
    body,
  })
  return data
}