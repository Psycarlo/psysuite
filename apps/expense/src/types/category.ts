export type CategoryType = 'expense' | 'income'

export interface Category {
  [key: string]: number | string | null
  id: number
  name: string
  icon: string | null
  color: string | null
  type: CategoryType
  parent_id: number | null
  sort_order: number
  is_archived: number
  created_at: number
  updated_at: number
}

export interface CreateCategoryParams {
  name: string
  type: CategoryType
  icon?: string | null
  color?: string | null
  parent_id?: number | null
}

export interface UpdateCategoryParams {
  name?: string
  icon?: string | null
  color?: string | null
  parent_id?: number | null
  is_archived?: number
  sort_order?: number
}
