import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import { getCachedPrice, getPriceHistory } from '@/db/repositories/prices'
import type { Holding } from '@/types/holding'

export interface ChartPoint {
  [key: string]: unknown
  label: string
  value: number
  timestamp: number
}

const SECONDS_PER_DAY = 86_400

const normalizeToDayStart = (timestamp: number): number => {
  const date = new Date(timestamp * 1000)
  date.setUTCHours(0, 0, 0, 0)
  return Math.floor(date.getTime() / 1000)
}

const formatLabel = (timestamp: number, rangeDays: number): string => {
  const date = new Date(timestamp * 1000)
  if (rangeDays <= 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  if (rangeDays <= 366) {
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short'
    })
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}

export const formatYLabel = (value: string | number): string => {
  const n = Number(value)
  if (n >= 1_000_000) {
    return `${+(n / 1_000_000).toFixed(1)}M`
  }
  if (n >= 1000) {
    return `${+(n / 1000).toFixed(1)}k`
  }
  return `${Math.round(n)}`
}

interface HoldingPriceSeries {
  holding: Holding
  priceByDay: Map<number, number>
  currentPrice: number
}

const loadHoldingSeries = (
  db: NitroSQLiteConnection,
  holding: Holding,
  startDate: number,
  endDate: number
): HoldingPriceSeries => {
  const history = getPriceHistory(
    db,
    holding.symbol,
    holding.type,
    startDate,
    endDate
  )
  const priceByDay = new Map<number, number>()
  for (const point of history) {
    priceByDay.set(point.timestamp, point.price)
  }
  const cached = getCachedPrice(db, holding.symbol, holding.type)
  const currentPrice = cached?.price_usd ?? 0
  return { currentPrice, holding, priceByDay }
}

export const buildPortfolioChart = (
  db: NitroSQLiteConnection,
  holdings: Holding[],
  startDate: number,
  endDate: number
): ChartPoint[] => {
  if (holdings.length === 0) {
    return []
  }

  const series = holdings.map((h) =>
    loadHoldingSeries(db, h, startDate, endDate)
  )

  const normalizedStart = normalizeToDayStart(startDate)
  const normalizedEnd = normalizeToDayStart(endDate)
  const rangeDays = Math.max(
    1,
    Math.round((normalizedEnd - normalizedStart) / SECONDS_PER_DAY)
  )

  const points: ChartPoint[] = []
  const lastKnown = new Map<number, number>()

  for (
    let day = normalizedStart;
    day <= normalizedEnd;
    day += SECONDS_PER_DAY
  ) {
    let totalValue = 0
    for (const [i, s] of series.entries()) {
      const price = s.priceByDay.get(day) ?? lastKnown.get(i) ?? s.currentPrice
      lastKnown.set(i, price)
      totalValue += price * s.holding.quantity
    }
    points.push({
      label: formatLabel(day, rangeDays),
      timestamp: day,
      value: totalValue
    })
  }

  return points
}

export const getCurrentPortfolioValue = (
  db: NitroSQLiteConnection,
  holdings: Holding[]
): number => {
  let total = 0
  for (const h of holdings) {
    const cached = getCachedPrice(db, h.symbol, h.type)
    const price = cached?.price_usd ?? 0
    total += price * h.quantity
  }
  return total
}
