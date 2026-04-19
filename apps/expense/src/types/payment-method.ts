export type PaymentMethodType =
  | 'cash'
  | 'debit_card'
  | 'credit_card'
  | 'bank_transfer'
  | 'digital_wallet'
  | 'other'

export interface PaymentMethod {
  [key: string]: number | string | null
  id: number
  name: string
  type: PaymentMethodType
  icon: string | null
  is_archived: number
  sort_order: number
  created_at: number
  updated_at: number
}

export interface CreatePaymentMethodParams {
  name: string
  type?: PaymentMethodType
  icon?: string | null
}

export interface UpdatePaymentMethodParams {
  name?: string
  type?: PaymentMethodType
  icon?: string | null
  is_archived?: number
  sort_order?: number
}
