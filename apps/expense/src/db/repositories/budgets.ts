import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type {
  Budget,
  CreateBudgetParams,
  UpdateBudgetParams
} from '@/types/budget'

export const getActiveBudgets = (db: NitroSQLiteConnection): Budget[] => {
  const result = db.execute<Budget>(
    'SELECT * FROM budgets WHERE is_active = 1 ORDER BY created_at DESC'
  )
  return result.rows._array
}

export const getBudgetById = (
  db: NitroSQLiteConnection,
  id: number
): Budget | undefined => {
  const result = db.execute<Budget>('SELECT * FROM budgets WHERE id = ?', [id])
  return result.rows.item(0)
}

export const getBudgetsForAccount = (
  db: NitroSQLiteConnection,
  accountId: number
): Budget[] => {
  const result = db.execute<Budget>(
    'SELECT * FROM budgets WHERE (account_id = ? OR account_id IS NULL) AND is_active = 1',
    [accountId]
  )
  return result.rows._array
}

export const createBudget = (
  db: NitroSQLiteConnection,
  params: CreateBudgetParams
): Budget | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    'INSERT INTO budgets (account_id, category_id, amount, period, start_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      params.account_id ?? null,
      params.category_id ?? null,
      params.amount,
      params.period ?? 'monthly',
      params.start_date,
      now,
      now
    ]
  )
  return result.insertId === undefined
    ? undefined
    : getBudgetById(db, result.insertId)
}

export const updateBudget = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdateBudgetParams
): Budget | undefined => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (params.amount !== undefined) {
    fields.push('amount = ?')
    values.push(params.amount)
  }
  if (params.period !== undefined) {
    fields.push('period = ?')
    values.push(params.period)
  }
  if (params.start_date !== undefined) {
    fields.push('start_date = ?')
    values.push(params.start_date)
  }
  if (params.is_active !== undefined) {
    fields.push('is_active = ?')
    values.push(params.is_active)
  }

  if (fields.length === 0) {
    return getBudgetById(db, id)
  }

  const now = Math.floor(Date.now() / 1000)
  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.execute(`UPDATE budgets SET ${fields.join(', ')} WHERE id = ?`, values)
  return getBudgetById(db, id)
}

export const deleteBudget = (db: NitroSQLiteConnection, id: number): void => {
  db.execute('DELETE FROM budgets WHERE id = ?', [id])
}

interface BudgetProgress {
  [key: string]: number
  spent: number
}

export const getBudgetProgress = (
  db: NitroSQLiteConnection,
  budget: Budget,
  periodStart: number,
  periodEnd: number
): number => {
  const conditions = ['type = ?', 'date >= ?', 'date <= ?']
  const values: (string | number)[] = ['expense', periodStart, periodEnd]

  if (budget.account_id !== null) {
    conditions.push('account_id = ?')
    values.push(budget.account_id)
  }
  if (budget.category_id !== null) {
    conditions.push('category_id = ?')
    values.push(budget.category_id)
  }

  const result = db.execute<BudgetProgress>(
    `SELECT COALESCE(SUM(amount), 0) as spent FROM entries WHERE ${conditions.join(' AND ')}`,
    values
  )
  return result.rows.item(0)?.spent ?? 0
}
