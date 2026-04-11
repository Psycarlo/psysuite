import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type { Attachment, CreateAttachmentParams } from '@/types/attachment'

export const getAttachmentsForEntry = (
  db: NitroSQLiteConnection,
  entryId: number
): Attachment[] => {
  const result = db.execute<Attachment>(
    'SELECT * FROM attachments WHERE entry_id = ? ORDER BY created_at',
    [entryId]
  )
  return result.rows._array
}

export const getAttachmentById = (
  db: NitroSQLiteConnection,
  id: number
): Attachment | undefined => {
  const result = db.execute<Attachment>(
    'SELECT * FROM attachments WHERE id = ?',
    [id]
  )
  return result.rows.item(0)
}

export const createAttachment = (
  db: NitroSQLiteConnection,
  params: CreateAttachmentParams
): Attachment | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    'INSERT INTO attachments (entry_id, file_path, file_name, mime_type, file_size, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    [
      params.entry_id,
      params.file_path,
      params.file_name,
      params.mime_type ?? null,
      params.file_size ?? null,
      now
    ]
  )
  return result.insertId === undefined
    ? undefined
    : getAttachmentById(db, result.insertId)
}

export const deleteAttachment = (
  db: NitroSQLiteConnection,
  id: number
): void => {
  db.execute('DELETE FROM attachments WHERE id = ?', [id])
}
