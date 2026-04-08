import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type {
  Category,
  CategoryType,
  CreateCategoryParams,
  UpdateCategoryParams
} from '@/types/category'

export const getCategories = (
  db: NitroSQLiteConnection,
  type?: CategoryType
): Category[] => {
  if (type) {
    const result = db.execute<Category>(
      'SELECT * FROM categories WHERE is_archived = 0 AND type = ? ORDER BY sort_order, name',
      [type]
    )
    return result.rows._array
  }

  const result = db.execute<Category>(
    'SELECT * FROM categories WHERE is_archived = 0 ORDER BY type, sort_order, name'
  )
  return result.rows._array
}

export const getCategoryById = (
  db: NitroSQLiteConnection,
  id: number
): Category | undefined => {
  const result = db.execute<Category>('SELECT * FROM categories WHERE id = ?', [
    id
  ])
  return result.rows.item(0)
}

export const getSubcategories = (
  db: NitroSQLiteConnection,
  parentId: number
): Category[] => {
  const result = db.execute<Category>(
    'SELECT * FROM categories WHERE parent_id = ? AND is_archived = 0 ORDER BY sort_order, name',
    [parentId]
  )
  return result.rows._array
}

export const createCategory = (
  db: NitroSQLiteConnection,
  params: CreateCategoryParams
): Category | undefined => {
  const now = Math.floor(Date.now() / 1000)
  const result = db.execute(
    'INSERT INTO categories (name, type, icon, color, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [
      params.name,
      params.type,
      params.icon ?? null,
      params.color ?? null,
      params.parent_id ?? null,
      now,
      now
    ]
  )
  return result.insertId ? getCategoryById(db, result.insertId) : undefined
}

export const updateCategory = (
  db: NitroSQLiteConnection,
  id: number,
  params: UpdateCategoryParams
): Category | undefined => {
  const fields: string[] = []
  const values: (string | number | null)[] = []

  if (params.name !== undefined) {
    fields.push('name = ?')
    values.push(params.name)
  }
  if (params.icon !== undefined) {
    fields.push('icon = ?')
    values.push(params.icon)
  }
  if (params.color !== undefined) {
    fields.push('color = ?')
    values.push(params.color)
  }
  if (params.parent_id !== undefined) {
    fields.push('parent_id = ?')
    values.push(params.parent_id)
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
    return getCategoryById(db, id)
  }

  const now = Math.floor(Date.now() / 1000)
  fields.push('updated_at = ?')
  values.push(now)
  values.push(id)

  db.execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, values)
  return getCategoryById(db, id)
}

export const deleteCategory = (db: NitroSQLiteConnection, id: number): void => {
  db.execute('DELETE FROM categories WHERE id = ?', [id])
}
