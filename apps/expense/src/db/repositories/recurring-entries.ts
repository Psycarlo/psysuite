import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type {
  CreateRecurringEntryParams,
  RecurringEntry,
  RecurringFrequency,
  UpdateRecurringEntryParams
} from '@/types/recurring-entry'

export const getActiveRecurringEntries = (
  db: NitroSQLiteConnection
): RecurringEntry[] => {
  const result = db.execute<RecurringEntry>(
    'SELECT * FROM recurring_entries WHERE is_active = 1 ORDER BY next_occurrence'
  )
  return result.rows._array
}

export const getRecurringEntryById = (
  db: NitroSQLiteConnection,
  id: number
): RecurringEntry | undefined => {
  const result = db.execute<RecurringEntry>(
    'SELECT * FROM recurring_entries WHERE id = ?',
    [id]
  )
  return result.rows.item(0)
}

export const getDueRecurringEntries = (
  db: NitroSQLiteConnection,
  asOf: number
): RecurringEntry[] => {
  const result = db.execute<RecurringEntry>(
    'SELECT * FROM recurring_entries WHERE is_active = 1 AND next_occurrence <= ?',
    [asOf]
  )
  return result.rows._array
}

const computeNextOccurrence = (
  current: number,
  frequency: RecurringFrequency
): number => {
  const date = new Date(current * 1000)

  switch (frequency) {
    case 'daily': {
      date.setDate(date.getDate() + 1)
      break
    }
    case 'weekly': {
      date.setDate(date.getDate() + 7)
      break
    }
    case 'biweekly': {
      date.setDate(date.getDate() + 14)
      break
    }
    case 'monthly': {
      date.setMonth(date.getMonth() + 1)
      break
    }
    case 'yearly': {
      date.setFullYear(date.getFullYear() + 1)
      break
    }
    default: {
      break
    }
  }

  return Math.floor(date.getTime() / 1000)
}

export const createRecurringEntry = (
  db: NitroSQLiteConnection,
  params: CreateRecurringEntryParams
): RecurringEntry | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const nextOccurrence = params.start_date
  const result = db.execute(
    `INSERT INTO recurring_entries (account_id, category_id, type, amount, title, description, frequency, start_date, end_date, next_occurrence, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.account_id,
      params.category_id ?? null,
      params.type,
      params.amount,
      params.title,
      params.description ?? null,
      params.frequency,
      params.start_date,
      params.end_date ?? null,
      nextOccurrence,
      now,
      now
    ]
  )
  return result.insertId
    ? getRecurringEntryById(db, result.insertId)
    : undefined
}

export const updateRecurringEntry = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdateRecurringEntryParams
): RecurringEntry | undefined => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (params.category_id !== undefined) {
    fields.push('category_id = ?')
    values.push(params.category_id ?? null)
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
  if (params.frequency !== undefined) {
    fields.push('frequency = ?')
    values.push(params.frequency)
  }
  if (params.end_date !== undefined) {
    fields.push('end_date = ?')
    values.push(params.end_date ?? null)
  }
  if (params.is_active !== undefined) {
    fields.push('is_active = ?')
    values.push(params.is_active)
  }

  if (fields.length === 0) {
    return getRecurringEntryById(db, id)
  }

  const now = Math.floor(Date.now() / 1000)
  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.execute(
    `UPDATE recurring_entries SET ${fields.join(', ')} WHERE id = ?`,
    values
  )
  return getRecurringEntryById(db, id)
}

export const advanceRecurringEntry = (
  db: NitroSQLiteConnection,
  id: number
): void => {
  const entry = getRecurringEntryById(db, id)
  if (!entry) {
    return
  }

  const next = computeNextOccurrence(
    entry.next_occurrence,
    entry.frequency as RecurringFrequency
  )
  const now = Math.floor(Date.now() / 1000)

  if (entry.end_date && next > entry.end_date) {
    db.execute(
      'UPDATE recurring_entries SET is_active = 0, updated_at = ? WHERE id = ?',
      [now, id]
    )
    return
  }

  db.execute(
    'UPDATE recurring_entries SET next_occurrence = ?, updated_at = ? WHERE id = ?',
    [next, now, id]
  )
}

export const deleteRecurringEntry = (
  db: NitroSQLiteConnection,
  id: number
): void => {
  db.execute('DELETE FROM recurring_entries WHERE id = ?', [id])
}
