import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type {
  Account,
  CreateAccountParams,
  UpdateAccountParams
} from '@/types/account'

export const getAccounts = (db: NitroSQLiteConnection): Account[] => {
  const result = db.execute<Account>(
    'SELECT * FROM accounts WHERE is_archived = 0 ORDER BY sort_order, name'
  )
  return result.rows._array
}

export const getAllAccounts = (db: NitroSQLiteConnection): Account[] => {
  const result = db.execute<Account>(
    'SELECT * FROM accounts ORDER BY sort_order, name'
  )
  return result.rows._array
}

export const getAccountById = (
  db: NitroSQLiteConnection,
  id: number
): Account | undefined => {
  const result = db.execute<Account>('SELECT * FROM accounts WHERE id = ?', [
    id
  ])
  return result.rows.item(0)
}

export const createAccount = (
  db: NitroSQLiteConnection,
  params: CreateAccountParams
): Account | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    'INSERT INTO accounts (name, currency_code, icon, color, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
    [
      params.name,
      params.currency_code ?? 'USD',
      params.icon ?? null,
      params.color ?? null,
      now,
      now
    ]
  )
  return result.insertId === undefined
    ? undefined
    : getAccountById(db, result.insertId)
}

export const updateAccount = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdateAccountParams
): Account | undefined => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (params.name !== undefined) {
    fields.push('name = ?')
    values.push(params.name)
  }
  if (params.currency_code !== undefined) {
    fields.push('currency_code = ?')
    values.push(params.currency_code)
  }
  if (params.icon !== undefined) {
    fields.push('icon = ?')
    values.push(params.icon)
  }
  if (params.color !== undefined) {
    fields.push('color = ?')
    values.push(params.color)
  }
  if (params.is_archived !== undefined) {
    fields.push('is_archived = ?')
    values.push(params.is_archived)
  }
  if (params.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(params.sort_order)
  }

  if (fields.length === 0) {
    return getAccountById(db, id)
  }

  const now = Math.floor(Date.now() / 1000)
  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.execute(`UPDATE accounts SET ${fields.join(', ')} WHERE id = ?`, values)
  return getAccountById(db, id)
}

export const deleteAccount = (db: NitroSQLiteConnection, id: number): void => {
  db.execute('DELETE FROM accounts WHERE id = ?', [id])
}
