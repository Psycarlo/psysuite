export type RecurringFrequency =
  | 'daily'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'yearly'

export interface RecurringEntry {
  id: number
  account_id: number
  category_id: number | null
  type: 'expense' | 'income'
  amount: number
  title: string
  description: string | null
  frequency: RecurringFrequency
  start_date: number
  end_date: number | null
  next_occurrence: number
  is_active: number
  created_at: number
  updated_at: number
}

export interface CreateRecurringEntryParams {
  account_id: number
  category_id?: number | null
  type: 'expense' | 'income'
  amount: number
  title: string
  description?: string | null
  frequency: RecurringFrequency
  start_date: number
  end_date?: number | null
}

export interface UpdateRecurringEntryParams {
  category_id?: number | null
  amount?: number
  title?: string
  description?: string | null
  frequency?: RecurringFrequency
  end_date?: number | null
  is_active?: number
}
