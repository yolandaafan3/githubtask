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

// ─── ORDEN DE NOTAS ──────────────────────────────────────────

export async function updateNotePosition(noteId, position, folderId) {
  const { data, error } = await supabase
    .from('notes')
    .update({ position, folder_id: folderId ?? null })
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

// Actualiza el orden de muchas notas en batch
export async function batchUpdateNotePositions(updates) {
  // updates: [{ id, position, folder_id }]
  const promises = updates.map(({ id, position, folder_id }) =>
    supabase
      .from('notes')
      .update({ position, folder_id: folder_id ?? null })
      .eq('id', id)
  )
  await Promise.all(promises)
}

export async function batchUpdateFolderPositions(updates) {
  // updates: [{ id, position }]
  const promises = updates.map(({ id, position }) =>
    supabase
      .from('note_folders')
      .update({ position })
      .eq('id', id)
  )
  await Promise.all(promises)
}

// Notas actualizadas para incluir folder_id y position
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