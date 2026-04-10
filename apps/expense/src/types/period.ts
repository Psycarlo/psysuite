export type Period =
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'this_year'
  | 'all_time'

export interface DateRange {
  start: number
  end: number
}
