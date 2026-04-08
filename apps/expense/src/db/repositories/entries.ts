import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type { CreateEntryParams, Entry, UpdateEntryParams } from '@/types/entry'

export const getEntriesByAccount = (
  db: NitroSQLiteConnection,
  accountId: number,
  limit = 50,
  offset = 0
): Entry[] => {
  const result = db.execute<Entry>(
    'SELECT * FROM entries WHERE account_id = ? ORDER BY date DESC LIMIT ? OFFSET ?',
    [accountId, limit, offset]
  )
  return result.rows._array
}

export const getEntriesByDateRange = (
  db: NitroSQLiteConnection,
  accountId: number,
  startDate: number,
  endDate: number
): Entry[] => {
  const result = db.execute<Entry>(
    'SELECT * FROM entries WHERE account_id = ? AND date >= ? AND date <= ? ORDER BY date DESC',
    [accountId, startDate, endDate]
  )
  return result.rows._array
}

export const getEntryById = (
  db: NitroSQLiteConnection,
  id: number
): Entry | undefined => {
  const result = db.execute<Entry>('SELECT * FROM entries WHERE id = ?', [id])
  return result.rows.item(0)
}

export const createEntry = (
  db: NitroSQLiteConnection,
  params: CreateEntryParams
): Entry | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    `INSERT INTO entries (account_id, category_id, payment_method_id, type, amount, title, description, date, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.account_id,
      params.category_id ?? null,
      params.payment_method_id ?? null,
      params.type,
      params.amount,
      params.title,
      params.description ?? null,
      params.date,
      now,
      now
    ]
  )
  return result.insertId ? getEntryById(db, result.insertId) : undefined
}

export const updateEntry = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdateEntryParams
): Entry | undefined => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (params.category_id !== undefined) {
    fields.push('category_id = ?')
    values.push(params.category_id ?? null)
  }
  if (params.payment_method_id !== undefined) {
    fields.push('payment_method_id = ?')
    values.push(params.payment_method_id ?? null)
  }
  if (params.type !== undefined) {
    fields.push('type = ?')
    values.push(params.type)
  }
  if (params.amount !== undefined) {
    fields.push('amount = ?')
    values.push(params.amount)
  }
  if (params.title !== undefined) {
    fields.push('title = ?')
    values.push(params.title)
  }
  if (params.description !== undefined) {
    fields.push('description = ?')
    values.push(params.description ?? null)
  }
  if (params.date !== undefined) {
    fields.push('date = ?')
    values.push(params.date)
  }

  if (fields.length === 0) {
    return getEntryById(db, id)
  }

  const now = Math.floor(Date.now() / 1000)
  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.execute(`UPDATE entries SET ${fields.join(', ')} WHERE id = ?`, values)
  return getEntryById(db, id)
}

export const deleteEntry = (db: NitroSQLiteConnection, id: number): void => {
  db.execute('DELETE FROM entries WHERE id = ?', [id])
}

interface MonthlySummary {
  category_id: number | null
  total: number
}

export const getMonthlySummary = (
  db: NitroSQLiteConnection,
  accountId: number,
  type: 'expense' | 'income',
  startDate: number,
  endDate: number
): MonthlySummary[] => {
  const result = db.execute<MonthlySummary>(
    `SELECT category_id, SUM(amount) as total
     FROM entries
     WHERE account_id = ? AND type = ? AND date >= ? AND date <= ?
     GROUP BY category_id`,
    [accountId, type, startDate, endDate]
  )
  return result.rows._array
}
