import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import type { HoldingType } from '@/types/holding'
import type { PricePoint } from '@/types/price'

interface CachedPrice {
  [key: string]: number | string
  symbol: string
  type: HoldingType
  price_usd: number
  fetched_at: number
}

export const getCachedPrice = (
  db: NitroSQLiteConnection,
  symbol: string,
  type: HoldingType
): CachedPrice | undefined => {
  const result = db.execute<CachedPrice>(
    'SELECT * FROM price_cache WHERE symbol = ? AND type = ?',
    [symbol, type]
  )
  return result.rows.item(0)
}

export const setCachedPrice = (
  db: NitroSQLiteConnection,
  symbol: string,
  type: HoldingType,
  priceUsd: number
): void => {
  const now = Math.floor(Date.now() / 1000)
  db.execute(
    `INSERT INTO price_cache (symbol, type, price_usd, fetched_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(symbol, type) DO UPDATE SET price_usd = excluded.price_usd, fetched_at = excluded.fetched_at`,
    [symbol, type, priceUsd, now]
  )
}

export const getPriceHistory = (
  db: NitroSQLiteConnection,
  symbol: string,
  type: HoldingType,
  startDate: number,
  endDate: number
): PricePoint[] => {
  const result = db.execute<{
    [key: string]: number
    date: number
    price_usd: number
  }>(
    `SELECT date, price_usd FROM price_history
     WHERE symbol = ? AND type = ? AND date >= ? AND date <= ?
     ORDER BY date ASC`,
    [symbol, type, startDate, endDate]
  )
  return result.rows._array.map((row) => ({
    price: row.price_usd,
    timestamp: row.date
  }))
}

export const savePriceHistory = (
  db: NitroSQLiteConnection,
  symbol: string,
  type: HoldingType,
  points: PricePoint[]
): void => {
  for (const point of points) {
    db.execute(
      `INSERT INTO price_history (symbol, type, date, price_usd)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(symbol, type, date) DO UPDATE SET price_usd = excluded.price_usd`,
      [symbol, type, point.timestamp, point.price]
    )
  }
}

export const getLatestHistoryDate = (
  db: NitroSQLiteConnection,
  symbol: string,
  type: HoldingType
): number | undefined => {
  const result = db.execute<{ [key: string]: number; max_date: number }>(
    'SELECT MAX(date) as max_date FROM price_history WHERE symbol = ? AND type = ?',
    [symbol, type]
  )
  const row = result.rows.item(0)
  return row?.max_date ?? undefined
}
