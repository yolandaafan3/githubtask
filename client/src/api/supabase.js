import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

// ─── NOTAS ──────────────────────────────────────────────────

export async function getNotes(userGithubId, repoOwner, repoName) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_github_id', userGithubId)
    .eq('repo_owner', repoOwner)
    .eq('repo_name', repoName)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createNote(userGithubId, repoOwner, repoName, { title, content, tags }) {
  const { data, error } = await supabase
    .from('notes')
    .insert({
      user_github_id: userGithubId,
      repo_owner: repoOwner,
      repo_name: repoName,
      title: title || 'Untitled Note',
      content: content || '',
      tags: tags || [],
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateNote(noteId, updates) {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
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
  return updateNote(noteId, { pinned: !currentPinned })
}

export async function searchNotes(userGithubId, query) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_github_id', userGithubId)
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data
}