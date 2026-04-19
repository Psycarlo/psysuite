import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import {
  getCachedPrice,
  getLatestHistoryDate,
  savePriceHistory,
  setCachedPrice
} from '@/db/repositories/prices'
import type { Holding, HoldingType } from '@/types/holding'
import type { PricePoint } from '@/types/price'

const CACHE_TTL_SECONDS = 300
const BINANCE_BTC_SYMBOL = 'BTCUSDT'

const normalizeToDayStart = (timestamp: number): number => {
  const date = new Date(timestamp * 1000)
  date.setUTCHours(0, 0, 0, 0)
  return Math.floor(date.getTime() / 1000)
}

const fetchBinanceCurrent = async (): Promise<number> => {
  const response = await fetch(
    `https://api.binance.com/api/v3/ticker/price?symbol=${BINANCE_BTC_SYMBOL}`
  )
  if (!response.ok) {
    throw new Error(`Binance request failed: ${response.status}`)
  }
  const data = (await response.json()) as { price: string }
  return Number.parseFloat(data.price)
}

const fetchBinanceHistory = async (days: number): Promise<PricePoint[]> => {
  const limit = Math.min(days + 1, 1000)
  const response = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${BINANCE_BTC_SYMBOL}&interval=1d&limit=${limit}`
  )
  if (!response.ok) {
    throw new Error(`Binance klines failed: ${response.status}`)
  }
  const data = (await response.json()) as [
    number,
    string,
    string,
    string,
    string,
    ...unknown[]
  ][]
  return data.map((row) => ({
    price: Number.parseFloat(row[4]),
    timestamp: normalizeToDayStart(Math.floor(row[0] / 1000))
  }))
}

interface YahooChartResult {
  chart: {
    result:
      | {
          timestamp: number[]
          indicators: { quote: { close: (number | null)[] }[] }
        }[]
      | null
    error: unknown
  }
}

const fetchYahoo = async (
  symbol: string,
  range: string
): Promise<PricePoint[]> => {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=1d`
  )
  if (!response.ok) {
    throw new Error(`Yahoo request failed for ${symbol}: ${response.status}`)
  }
  const data = (await response.json()) as YahooChartResult
  const result = data.chart.result?.[0]
  if (!result) {
    throw new Error(`Yahoo no data for ${symbol}`)
  }
  const closes = result.indicators.quote[0]?.close ?? []
  const points: PricePoint[] = []
  for (const [i, ts] of result.timestamp.entries()) {
    const close = closes[i]
    if (close !== null && close !== undefined) {
      points.push({ price: close, timestamp: normalizeToDayStart(ts) })
    }
  }
  return points
}

const rangeForDays = (days: number): string => {
  if (days <= 7) {
    return '7d'
  }
  if (days <= 31) {
    return '1mo'
  }
  if (days <= 93) {
    return '3mo'
  }
  if (days <= 366) {
    return '1y'
  }
  return '5y'
}

export const fetchCurrentPrice = async (
  symbol: string,
  type: HoldingType
): Promise<number> => {
  if (type === 'bitcoin') {
    return fetchBinanceCurrent()
  }
  const history = await fetchYahoo(symbol, '5d')
  const last = history.at(-1)
  if (!last) {
    throw new Error(`No current price for ${symbol}`)
  }
  return last.price
}

export const getCurrentPrice = async (
  db: NitroSQLiteConnection,
  symbol: string,
  type: HoldingType
): Promise<number> => {
  const cached = getCachedPrice(db, symbol, type)
  const now = Math.floor(Date.now() / 1000)
  if (cached && now - cached.fetched_at < CACHE_TTL_SECONDS) {
    return cached.price_usd
  }
  const price = await fetchCurrentPrice(symbol, type)
  setCachedPrice(db, symbol, type, price)
  return price
}

export const refreshPriceHistory = async (
  db: NitroSQLiteConnection,
  symbol: string,
  type: HoldingType,
  days: number
): Promise<void> => {
  const latest = getLatestHistoryDate(db, symbol, type)
  const todayStart = normalizeToDayStart(Math.floor(Date.now() / 1000))
  if (latest !== undefined && latest >= todayStart) {
    return
  }
  const points =
    type === 'bitcoin'
      ? await fetchBinanceHistory(days)
      : await fetchYahoo(symbol, rangeForDays(days))
  if (points.length > 0) {
    savePriceHistory(db, symbol, type, points)
  }
}

export const refreshAllPrices = async (
  db: NitroSQLiteConnection,
  holdings: Holding[],
  days: number
): Promise<void> => {
  await Promise.all(
    holdings.map(async (holding) => {
      try {
        await refreshPriceHistory(db, holding.symbol, holding.type, days)
        await getCurrentPrice(db, holding.symbol, holding.type)
      } catch {
        // Silent fail per-holding; stale cache still usable
      }
    })
  )
}
