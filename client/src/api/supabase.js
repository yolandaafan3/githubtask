import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
// ─── TEMPLATES ───────────────────────────────────────────────

export async function getTemplates(userGithubId) {
  const { data, error } = await supabase
    .from('issue_templates')
    .select('*')
    .eq('user_github_id', userGithubId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function createTemplate(userGithubId, template) {
  const { data, error } = await supabase
    .from('issue_templates')
    .insert({
      user_github_id: userGithubId,
      name: template.name,
      description: template.description || '',
      title_template: template.title_template || '',
      body_template: template.body_template || '',
      labels: template.labels || [],
      color: template.color || '1f6feb',
      icon: template.icon || 'FileText',
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTemplate(templateId, updates) {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('issue_templates')
    .update(payload)
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteTemplate(templateId) {
  const { error } = await supabase
    .from('issue_templates')
    .delete()
    .eq('id', templateId)

  if (error) throw error
}

// ─── CARPETAS DE NOTAS ───────────────────────────────────────

export async function getFolders(userGithubId, repoOwner, repoName) {
  const { data, error } = await supabase
    .from('note_folders')
    .select('*')
    .eq('user_github_id', userGithubId)
    .eq('repo_owner', repoOwner)
    .eq('repo_name', repoName)
    .order('position', { ascending: true })

  if (error) throw error
  return data
}

export async function createFolder(userGithubId, repoOwner, repoName, { name, color, icon, position }) {
  const { data, error } = await supabase
    .from('note_folders')
    .insert({
      user_github_id: userGithubId,
      repo_owner: repoOwner,
      repo_name: repoName,
      name,
      color: color || '1f6feb',
      icon: icon || '📁',
      position: position || 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFolder(folderId, updates) {
  const { data, error } = await supabase
    .from('note_folders')
    .update(updates)
    .eq('id', folderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteFolder(folderId) {
  const { error } = await supabase
    .from('note_folders')
    .delete()
    .eq('id', folderId)

  if (error) throw error
}

// ─── NOTAS ───────────────────────────────────────────────────

export async function getNotesWithFolders(userGithubId, repoOwner, repoName) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_github_id', userGithubId)
    .eq('repo_owner', repoOwner)
    .eq('repo_name', repoName)
    .order('pinned', { ascending: false })
    .order('position', { ascending: true })
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createNote(userGithubId, repoOwner, repoName, note) {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_github_id: userGithubId,
      repo_owner: repoOwner,
      repo_name: repoName,
      title: note.title || 'Untitled Note',
      content: note.content || '',
      tags: note.tags || [],
      pinned: note.pinned ?? false,
      position: note.position ?? 0,
      folder_id: note.folder_id ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateNote(noteId, updates) {
  const payload = {
    ...updates,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('notes')
    .update(payload)
    .eq('id', noteId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNote(noteId) {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId)

  if (error) throw error
}

export async function togglePinNote(noteId, currentPinned) {
  const { data, error } = await supabase
    .from('notes')
    .update({
      pinned: !currentPinned,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function searchNotes(userGithubId, query, repoOwner = null, repoName = null) {
  let request = supabase
    .from('notes')
    .select('*')
    .eq('user_github_id', userGithubId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (repoOwner) request = request.eq('repo_owner', repoOwner)
  if (repoName) request = request.eq('repo_name', repoName)

  const { data, error } = await request

  if (error) throw error
  return data
}

// ─── ORDEN DE NOTAS ──────────────────────────────────────────

export async function updateNotePosition(noteId, position, folderId) {
  const { data, error } = await supabase
    .from('notes')
    .update({
      position,
      folder_id: folderId ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', noteId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateFolderPosition(folderId, position) {
  const { data, error } = await supabase
    .from('note_folders')
    .update({ position })
    .eq('id', folderId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function batchUpdateNotePositions(updates) {
  const promises = updates.map(({ id, position, folder_id }) =>
    supabase
      .from('notes')
      .update({
        position,
        folder_id: folder_id ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
  )

  const results = await Promise.all(promises)

  const failed = results.find(r => r.error)
  if (failed?.error) throw failed.error
}

export async function batchUpdateFolderPositions(updates) {
  const promises = updates.map(({ id, position }) =>
    supabase
      .from('note_folders')
      .update({ position })
      .eq('id', id)
  )

  const results = await Promise.all(promises)

  const failed = results.find(r => r.error)
  if (failed?.error) throw failed.error
}
// ─── MULTI REPO SELECTIONS ──────────────────────────────────

export async function getMultiRepoSelections(userGithubId) {
  const { data, error } = await supabase
    .from('multi_repo_selections')
    .select('*')
    .eq('user_github_id', userGithubId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function addMultiRepoSelection(userGithubId, repo, color = '#1f6feb') {
  const payload = {
    user_github_id: userGithubId,
    repo_owner: repo.owner.login,
    repo_name: repo.name,
    repo_full_name: `${repo.owner.login}/${repo.name}`,
    color,
  }

  const { data, error } = await supabase
    .from('multi_repo_selections')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function removeMultiRepoSelection(userGithubId, repoFullName) {
  const { error } = await supabase
    .from('multi_repo_selections')
    .delete()
    .eq('user_github_id', userGithubId)
    .eq('repo_full_name', repoFullName)

  if (error) throw error
}