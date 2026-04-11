export interface Account {
  [key: string]: number | string | null
  id: number
  name: string
  currency_code: string
  icon: string | null
  color: string | null
  is_archived: number
  sort_order: number
  created_at: number
  updated_at: number
}

export interface CreateAccountParams {
  name: string
  currency_code?: string
  icon?: string | null
  color?: string | null
}

export interface UpdateAccountParams {
  name?: string
  currency_code?: string
  icon?: string | null
  color?: string | null
  is_archived?: number
  sort_order?: number
}
