export interface PricePoint {
  timestamp: number
  price: number
}

export interface HoldingPriceHistory {
  symbol: string
  points: PricePoint[]
}
