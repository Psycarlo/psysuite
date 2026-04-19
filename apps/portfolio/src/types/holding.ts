export type HoldingType = 'stock' | 'bitcoin'

export interface Holding {
  [key: string]: number | string | null
  id: number
  portfolio_id: number
  type: HoldingType
  symbol: string
  name: string | null
  quantity: number
  cost_basis: number | null
  created_at: number
  updated_at: number
}

export interface CreateHoldingParams {
  portfolio_id: number
  type: HoldingType
  symbol: string
  name?: string | null
  quantity: number
  cost_basis?: number | null
}

export interface UpdateHoldingParams {
  symbol?: string
  name?: string | null
  quantity?: number
  cost_basis?: number | null
}
