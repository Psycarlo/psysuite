import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type {
  CreatePortfolioParams,
  Portfolio,
  UpdatePortfolioParams
} from '@/types/portfolio'

export const getPortfolios = (db: NitroSQLiteConnection): Portfolio[] => {
  const result = db.execute<Portfolio>(
    'SELECT * FROM portfolios ORDER BY sort_order, name'
  )
  return result.rows._array
}

export const getPortfolioById = (
  db: NitroSQLiteConnection,
  id: number
): Portfolio | undefined => {
  const result = db.execute<Portfolio>(
    'SELECT * FROM portfolios WHERE id = ?',
    [id]
  )
  return result.rows.item(0)
}

export const createPortfolio = (
  db: NitroSQLiteConnection,
  params: CreatePortfolioParams
): Portfolio | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    'INSERT INTO portfolios (name, created_at, updated_at) VALUES (?, ?, ?)',
    [params.name, now, now]
  )
  return result.insertId === undefined
    ? undefined
    : getPortfolioById(db, result.insertId)
}

export const updatePortfolio = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdatePortfolioParams
): Portfolio | undefined => {
  const fields: string[] = []
  const values: (string | number)[] = []

  if (params.name !== undefined) {
    fields.push('name = ?')
    values.push(params.name)
  }
  if (params.sort_order !== undefined) {
    fields.push('sort_order = ?')
    values.push(params.sort_order)
  }

  if (fields.length === 0) {
    return getPortfolioById(db, id)
  }

  const now = Math.floor(Date.now() / 1000)
  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.execute(`UPDATE portfolios SET ${fields.join(', ')} WHERE id = ?`, values)
  return getPortfolioById(db, id)
}

export const deletePortfolio = (
  db: NitroSQLiteConnection,
  id: number
): void => {
  db.execute('DELETE FROM portfolios WHERE id = ?', [id])
}
