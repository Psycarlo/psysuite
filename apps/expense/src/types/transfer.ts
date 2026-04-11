export interface Transfer {
  [key: string]: number | string | null
  id: number
  from_entry_id: number
  to_entry_id: number
  exchange_rate: number
  created_at: number
}

export interface CreateTransferParams {
  from_entry_id: number
  to_entry_id: number
  exchange_rate?: number
}
