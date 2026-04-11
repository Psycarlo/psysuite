import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type { CreateTagParams, Tag, UpdateTagParams } from '@/types/tag'

export const getTags = (db: NitroSQLiteConnection): Tag[] => {
  const result = db.execute<Tag>('SELECT * FROM tags ORDER BY name')
  return result.rows._array
}

export const getTagById = (
  db: NitroSQLiteConnection,
  id: number
): Tag | undefined => {
  const result = db.execute<Tag>('SELECT * FROM tags WHERE id = ?', [id])
  return result.rows.item(0)
}

export const getTagsForEntry = (
  db: NitroSQLiteConnection,
  entryId: number
): Tag[] => {
  const result = db.execute<Tag>(
    'SELECT t.* FROM tags t JOIN entry_tags et ON t.id = et.tag_id WHERE et.entry_id = ? ORDER BY t.name',
    [entryId]
  )
  return result.rows._array
}

export const createTag = (
  db: NitroSQLiteConnection,
  params: CreateTagParams
): Tag | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    'INSERT INTO tags (name, color, created_at) VALUES (?, ?, ?)',
    [params.name, params.color ?? null, now]
  )
  return result.insertId === undefined
    ? undefined
    : getTagById(db, result.insertId)
}

export const updateTag = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdateTagParams
): Tag | undefined => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (params.name !== undefined) {
    fields.push('name = ?')
    values.push(params.name)
  }
  if (params.color !== undefined) {
    fields.push('color = ?')
    values.push(params.color)
  }

  if (fields.length === 0) {
    return getTagById(db, id)
  }

  values.push(id)
  db.execute(`UPDATE tags SET ${fields.join(', ')} WHERE id = ?`, values)
  return getTagById(db, id)
}

export const deleteTag = (db: NitroSQLiteConnection, id: number): void => {
  db.execute('DELETE FROM tags WHERE id = ?', [id])
}

export const addTagToEntry = (
  db: NitroSQLiteConnection,
  entryId: number,
  tagId: number
): void => {
  db.execute(
    'INSERT OR IGNORE INTO entry_tags (entry_id, tag_id) VALUES (?, ?)',
    [entryId, tagId]
  )
}

export const removeTagFromEntry = (
  db: NitroSQLiteConnection,
  entryId: number,
  tagId: number
): void => {
  db.execute('DELETE FROM entry_tags WHERE entry_id = ? AND tag_id = ?', [
    entryId,
    tagId
  ])
}
