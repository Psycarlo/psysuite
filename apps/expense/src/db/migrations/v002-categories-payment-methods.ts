import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

interface SeedCategory {
  name: string
  type: 'expense' | 'income'
}

const expenseCategories: SeedCategory[] = [
  { name: 'Food & Drinks', type: 'expense' },
  { name: 'Groceries', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Transportation', type: 'expense' },
  { name: 'Travel', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Health', type: 'expense' },
  { name: 'Housing', type: 'expense' },
  { name: 'Utilities', type: 'expense' },
  { name: 'Services', type: 'expense' },
  { name: 'Subscriptions', type: 'expense' },
  { name: 'Education', type: 'expense' },
  { name: 'Personal Care', type: 'expense' },
  { name: 'Gifts & Donations', type: 'expense' },
  { name: 'Investments', type: 'expense' }
]

interface SeedPaymentMethod {
  name: string
  type: string
}

const paymentMethods: SeedPaymentMethod[] = [
  { name: 'Credit Card', type: 'credit_card' },
  { name: 'Debit Card', type: 'debit_card' },
  { name: 'Bank Transfer', type: 'bank_transfer' },
  { name: 'Cash', type: 'cash' },
  { name: 'Bitcoin', type: 'digital_wallet' }
]

export const v002CategoriesPaymentMethods = (
  db: NitroSQLiteConnection
): void => {
  const now = Math.floor(Date.now() / 1000)

  db.execute("DELETE FROM categories WHERE type = 'expense'")

  for (const [index, category] of expenseCategories.entries()) {
    db.execute(
      'INSERT INTO categories (name, type, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [category.name, category.type, index, now, now]
    )
  }

  for (const [index, method] of paymentMethods.entries()) {
    db.execute(
      'INSERT INTO payment_methods (name, type, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [method.name, method.type, index, now, now]
    )
  }
}
