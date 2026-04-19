import type { DateRange, Period } from '@/types/period'

export const getDateRange = (period: Period): DateRange | undefined => {
  if (period === 'all_time') {
    return undefined
  }

  const now = new Date()
  let start: Date

  switch (period) {
    case 'today': {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      break
    }
    case 'this_week': {
      const day = now.getDay()
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
      break
    }
    case 'this_month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1)
      break
    }
    case 'this_year': {
      start = new Date(now.getFullYear(), 0, 1)
      break
    }
    default: {
      return undefined
    }
  }

  return {
    end: Math.floor(now.getTime() / 1000),
    start: Math.floor(start.getTime() / 1000)
  }
}

export const getPeriodLabel = (period: Period): string => {
  switch (period) {
    case 'today': {
      return 'Spent today'
    }
    case 'this_week': {
      return 'Spent this week'
    }
    case 'this_month': {
      return 'Spent this month'
    }
    case 'this_year': {
      return 'Spent this year'
    }
    case 'all_time': {
      return 'Total spending'
    }
    default: {
      return period satisfies never
    }
  }
}

export const getPeriodDisplayName = (period: Period): string => {
  switch (period) {
    case 'today': {
      return 'Today'
    }
    case 'this_week': {
      return 'This week'
    }
    case 'this_month': {
      return 'This month'
    }
    case 'this_year': {
      return 'This year'
    }
    case 'all_time': {
      return 'All time'
    }
    default: {
      return period satisfies never
    }
  }
}
