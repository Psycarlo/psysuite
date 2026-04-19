import type { Period } from '@/types/period'

interface DailySpending {
  day: number
  total: number
}

export interface ChartPoint {
  [key: string]: unknown
  label: string
  amount: number
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const MONTH_LETTERS = [
  'J',
  'F',
  'M',
  'A',
  'M',
  'J',
  'J',
  'A',
  'S',
  'O',
  'N',
  'D'
]

const buildWeekData = (data: DailySpending[]): ChartPoint[] => {
  const buckets = new Map<string, number>()

  for (const day of WEEK_DAYS) {
    buckets.set(day, 0)
  }

  for (const entry of data) {
    const date = new Date(entry.day * 1000)
    const dayName = DAY_NAMES[date.getDay()]
    buckets.set(dayName, (buckets.get(dayName) ?? 0) + entry.total)
  }

  return WEEK_DAYS.map((day) => ({
    amount: buckets.get(day) ?? 0,
    label: day
  }))
}

const buildMonthData = (data: DailySpending[]): ChartPoint[] => {
  const now = new Date()
  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0
  ).getDate()
  const dayBuckets = new Map<number, number>()

  for (const entry of data) {
    const date = new Date(entry.day * 1000)
    const day = date.getDate()
    dayBuckets.set(day, (dayBuckets.get(day) ?? 0) + entry.total)
  }

  const points: ChartPoint[] = []
  for (let start = 1; start <= daysInMonth; start += 7) {
    const end = Math.min(start + 6, daysInMonth)
    let total = 0
    for (let d = start; d <= end; d += 1) {
      total += dayBuckets.get(d) ?? 0
    }
    points.push({ amount: total, label: `${start}-${end}` })
  }
  return points
}

const buildYearData = (data: DailySpending[]): ChartPoint[] => {
  const buckets = new Map<number, number>()

  for (const entry of data) {
    const date = new Date(entry.day * 1000)
    const month = date.getMonth()
    buckets.set(month, (buckets.get(month) ?? 0) + entry.total)
  }

  return MONTH_LETTERS.map((letter, i) => ({
    amount: buckets.get(i) ?? 0,
    label: letter
  }))
}

const buildAllTimeData = (data: DailySpending[]): ChartPoint[] => {
  const buckets = new Map<number, number>()

  for (const entry of data) {
    const date = new Date(entry.day * 1000)
    const year = date.getFullYear()
    buckets.set(year, (buckets.get(year) ?? 0) + entry.total)
  }

  const currentYear = new Date().getFullYear()
  const years = [...buckets.keys()].toSorted((a, b) => a - b)
  const startYear =
    years.length > 0 ? Math.min(years[0], currentYear - 3) : currentYear - 3

  const points: ChartPoint[] = []
  for (let y = startYear; y <= currentYear; y += 1) {
    points.push({ amount: buckets.get(y) ?? 0, label: `${y}` })
  }
  return points
}

const buildTodayData = (data: DailySpending[]): ChartPoint[] => {
  const total = data.reduce((sum, d) => sum + d.total, 0)
  return [{ amount: total, label: 'Today' }]
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

export const buildChartData = (
  data: DailySpending[],
  period: Period
): ChartPoint[] => {
  switch (period) {
    case 'today': {
      return buildTodayData(data)
    }
    case 'this_week': {
      return buildWeekData(data)
    }
    case 'this_month': {
      return buildMonthData(data)
    }
    case 'this_year': {
      return buildYearData(data)
    }
    case 'all_time': {
      return buildAllTimeData(data)
    }
    default: {
      return period satisfies never
    }
  }
}
