export type BudgetPeriod = 'weekly' | 'monthly' | 'yearly'

export interface Budget {
  id: number
  account_id: number | null
  category_id: number | null
  amount: number
  period: BudgetPeriod
  start_date: number
  is_active: number
  created_at: number
  updated_at: number
}

export interface CreateBudgetParams {
  account_id?: number | null
  category_id?: number | null
  amount: number
  period?: BudgetPeriod
  start_date: number
}

export interface UpdateBudgetParams {
  amount?: number
  period?: BudgetPeriod
  start_date?: number
  is_active?: number
}
