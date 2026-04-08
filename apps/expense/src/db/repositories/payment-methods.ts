import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type {
  CreatePaymentMethodParams,
  PaymentMethod,
  UpdatePaymentMethodParams
} from '@/types/payment-method'

export const getPaymentMethods = (
  db: NitroSQLiteConnection
): PaymentMethod[] => {
  const result = db.execute<PaymentMethod>(
    'SELECT * FROM payment_methods WHERE is_archived = 0 ORDER BY sort_order, name'
  )
  return result.rows._array
}

export const getPaymentMethodById = (
  db: NitroSQLiteConnection,
  id: number
): PaymentMethod | undefined => {
  const result = db.execute<PaymentMethod>(
    'SELECT * FROM payment_methods WHERE id = ?',
    [id]
  )
  return result.rows.item(0)
}

export const createPaymentMethod = (
  db: NitroSQLiteConnection,
  params: CreatePaymentMethodParams
): PaymentMethod | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    'INSERT INTO payment_methods (name, type, icon, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    [params.name, params.type ?? 'other', params.icon ?? null, now, now]
  )
  return result.insertId ? getPaymentMethodById(db, result.insertId) : undefined
}

export const updatePaymentMethod = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdatePaymentMethodParams
): PaymentMethod | undefined => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (params.name !== undefined) {
    fields.push('name = ?')
    values.push(params.name)
  }
  if (params.type !== undefined) {
    fields.push('type = ?')
    values.push(params.type)
  }
  if (params.icon !== undefined) {
    fields.push('icon = ?')
    values.push(params.icon)
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
    return getPaymentMethodById(db, id)
  }

  const now = Math.floor(Date.now() / 1000)
  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.execute(
    `UPDATE payment_methods SET ${fields.join(', ')} WHERE id = ?`,
    values
  )
  return getPaymentMethodById(db, id)
}

export const deletePaymentMethod = (
  db: NitroSQLiteConnection,
  id: number
): void => {
  db.execute('DELETE FROM payment_methods WHERE id = ?', [id])
}
