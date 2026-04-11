import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type { CreateTransferParams, Transfer } from '@/types/transfer'

export const getTransferById = (
  db: NitroSQLiteConnection,
  id: number
): Transfer | undefined => {
  const result = db.execute<Transfer>('SELECT * FROM transfers WHERE id = ?', [
    id
  ])
  return result.rows.item(0)
}

export const getTransferByEntryId = (
  db: NitroSQLiteConnection,
  entryId: number
): Transfer | undefined => {
  const result = db.execute<Transfer>(
    'SELECT * FROM transfers WHERE from_entry_id = ? OR to_entry_id = ?',
    [entryId, entryId]
  )
  return result.rows.item(0)
}

export const createTransfer = (
  db: NitroSQLiteConnection,
  params: CreateTransferParams
): Transfer | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    'INSERT INTO transfers (from_entry_id, to_entry_id, exchange_rate, created_at) VALUES (?, ?, ?, ?)',
    [params.from_entry_id, params.to_entry_id, params.exchange_rate ?? 1, now]
  )
  return result.insertId === undefined
    ? undefined
    : getTransferById(db, result.insertId)
}

export const deleteTransfer = (db: NitroSQLiteConnection, id: number): void => {
  db.execute('DELETE FROM transfers WHERE id = ?', [id])
}
