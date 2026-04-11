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

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
]

const buildWeekData = (data: DailySpending[]): ChartPoint[] => {
  const buckets = new Map<string, number>()

  for (let i = 0; i < 7; i += 1) {
    buckets.set(SHORT_DAYS[i], 0)
  }

  for (const entry of data) {
    const date = new Date(entry.day * 1000)
    const dayName = SHORT_DAYS[date.getDay()]
    buckets.set(dayName, (buckets.get(dayName) ?? 0) + entry.total)
  }

  return SHORT_DAYS.map((day) => ({
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
  const buckets = new Map<number, number>()

  for (const entry of data) {
    const date = new Date(entry.day * 1000)
    const day = date.getDate()
    buckets.set(day, (buckets.get(day) ?? 0) + entry.total)
  }

  const points: ChartPoint[] = []
  for (let d = 1; d <= daysInMonth; d += 1) {
    points.push({ amount: buckets.get(d) ?? 0, label: `${d}` })
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

  return SHORT_MONTHS.map((name, i) => ({
    amount: buckets.get(i) ?? 0,
    label: name
  }))
}

const buildAllTimeData = (data: DailySpending[]): ChartPoint[] => {
  const buckets = new Map<number, number>()

  for (const entry of data) {
    const date = new Date(entry.day * 1000)
    const year = date.getFullYear()
    buckets.set(year, (buckets.get(year) ?? 0) + entry.total)
  }

  const years = [...buckets.keys()].toSorted((a, b) => a - b)
  if (years.length === 0) {
    const currentYear = new Date().getFullYear()
    return [{ amount: 0, label: `${currentYear}` }]
  }

  return years.map((year) => ({
    amount: buckets.get(year) ?? 0,
    label: `${year}`
  }))
}

const buildTodayData = (data: DailySpending[]): ChartPoint[] => {
  const total = data.reduce((sum, d) => sum + d.total, 0)
  return [{ amount: total, label: 'Today' }]
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
