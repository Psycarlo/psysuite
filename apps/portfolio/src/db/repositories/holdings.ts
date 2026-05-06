import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type {
  CreateHoldingParams,
  Holding,
  UpdateHoldingParams
} from '@/types/holding'

export const getHoldingsByPortfolio = (
  db: NitroSQLiteConnection,
  portfolioId: number
): Holding[] => {
  const result = db.execute<Holding>(
    'SELECT * FROM holdings WHERE portfolio_id = ? ORDER BY created_at DESC',
    [portfolioId]
  )
  return result.rows._array
}

export const getHoldingById = (
  db: NitroSQLiteConnection,
  id: number
): Holding | undefined => {
  const result = db.execute<Holding>('SELECT * FROM holdings WHERE id = ?', [
    id
  ])
  return result.rows.item(0)
}

export const createHolding = (
  db: NitroSQLiteConnection,
  params: CreateHoldingParams
): Holding | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    `INSERT INTO holdings (portfolio_id, type, symbol, name, quantity, cost_basis, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.portfolio_id,
      params.type,
      params.symbol.toUpperCase(),
      params.name ?? null,
      params.quantity,
      params.cost_basis ?? null,
      now,
      now
    ]
  )
  return result.insertId === undefined
    ? undefined
    : getHoldingById(db, result.insertId)
}

export const updateHolding = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdateHoldingParams
): Holding | undefined => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (params.symbol !== undefined) {
    fields.push('symbol = ?')
    values.push(params.symbol.toUpperCase())
  }
  if (params.name !== undefined) {
    fields.push('name = ?')
    values.push(params.name ?? null)
  }
  if (params.quantity !== undefined) {
    fields.push('quantity = ?')
    values.push(params.quantity)
  }
  if (params.cost_basis !== undefined) {
    fields.push('cost_basis = ?')
    values.push(params.cost_basis ?? null)
  }

  if (fields.length === 0) {
    return getHoldingById(db, id)
  }

  const now = Math.floor(Date.now() / 1000)
  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.execute(`UPDATE holdings SET ${fields.join(', ')} WHERE id = ?`, values)
  return getHoldingById(db, id)
}

export const deleteHolding = (db: NitroSQLiteConnection, id: number): void => {
  db.execute('DELETE FROM holdings WHERE id = ?', [id])
}
