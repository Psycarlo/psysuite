import type { DateRange, Period } from '@/types/period'

const SECONDS_PER_DAY = 86_400

export const getDateRange = (period: Period): DateRange => {
  const end = Math.floor(Date.now() / 1000)
  const days = getPeriodDays(period)
  const start = end - days * SECONDS_PER_DAY
  return { end, start }
}

export const getPeriodDays = (period: Period): number => {
  switch (period) {
    case '1w': {
      return 7
    }
    case '1m': {
      return 30
    }
    case '3m': {
      return 90
    }
    case '1y': {
      return 365
    }
    case 'all': {
      return 365 * 5
    }
    default: {
      return period satisfies never
    }
  }
}

export const getPeriodDisplayName = (period: Period): string => {
  switch (period) {
    case '1w': {
      return '1W'
    }
    case '1m': {
      return '1M'
    }
    case '3m': {
      return '3M'
    }
    case '1y': {
      return '1Y'
    }
    case 'all': {
      return 'All'
    }
    default: {
      return period satisfies never
    }
  }
}
