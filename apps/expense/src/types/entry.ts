export type EntryType = 'expense' | 'income' | 'transfer'

export interface Entry {
  id: number
  account_id: number
  category_id: number | null
  payment_method_id: number | null
  type: EntryType
  amount: number
  title: string
  description: string | null
  date: number
  created_at: number
  updated_at: number
}

export interface CreateEntryParams {
  account_id: number
  category_id?: number | null
  payment_method_id?: number | null
  type: EntryType
  amount: number
  title: string
  description?: string | null
  date: number
}

export interface UpdateEntryParams {
  category_id?: number | null
  payment_method_id?: number | null
  type?: EntryType
  amount?: number
  title?: string
  description?: string | null
  date?: number
}
