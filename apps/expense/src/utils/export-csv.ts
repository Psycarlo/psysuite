import { File, Paths } from 'expo-file-system'
import { shareAsync } from 'expo-sharing'
import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import { getEntries } from '@/db/repositories/entries'
import type { Account } from '@/types/account'

const escapeCSV = (value: string): string => {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toISOString().split('T')[0]
}

const formatAmount = (amount: number, type: string): string => {
  if (type === 'expense') {
    return `-${amount}`
  }
  return String(amount)
}

export const exportAccountToCSV = async (
  db: NitroSQLiteConnection,
  account: Account
): Promise<void> => {
  const entries = getEntries(db, account.id)

  const headers = [
    'Date',
    'Title',
    'Type',
    'Amount',
    'Category',
    'Payment Method',
    'Description'
  ]
  const rows = entries.map((entry) => [
    formatDate(entry.date),
    escapeCSV(entry.title),
    entry.type,
    formatAmount(entry.amount, entry.type),
    escapeCSV(entry.category_name ?? ''),
    escapeCSV(entry.payment_method_name ?? ''),
    escapeCSV(entry.description ?? '')
  ])

  const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
    '\n'
  )

  const fileName = `${account.name.replaceAll(/[^a-zA-Z0-9]/g, '_')}_export.csv`
  const file = new File(Paths.cache, fileName)
  if (file.exists) {
    file.delete()
  }
  file.create()
  file.write(csv)

  await shareAsync(file.uri, {
    UTI: 'public.comma-separated-values-text',
    mimeType: 'text/csv'
  })
}
