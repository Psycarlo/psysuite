export interface Portfolio {
  [key: string]: number | string | null
  id: number
  name: string
  sort_order: number
  created_at: number
  updated_at: number
}

export interface CreatePortfolioParams {
  name: string
}

export interface UpdatePortfolioParams {
  name?: string
  sort_order?: number
}
