import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

const createAccountsTable = `
CREATE TABLE accounts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  currency_code TEXT    NOT NULL DEFAULT 'USD',
  icon          TEXT,
  color         TEXT,
  is_archived   INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
)`

const createCategoriesTable = `
CREATE TABLE categories (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  icon          TEXT,
  color         TEXT,
  type          TEXT    NOT NULL DEFAULT 'expense' CHECK(type IN ('expense', 'income')),
  parent_id     INTEGER,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_archived   INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
)`

const createPaymentMethodsTable = `
CREATE TABLE payment_methods (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  type          TEXT    NOT NULL DEFAULT 'other' CHECK(type IN ('cash', 'debit_card', 'credit_card', 'bank_transfer', 'digital_wallet', 'other')),
  icon          TEXT,
  is_archived   INTEGER NOT NULL DEFAULT 0,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
)`

const createEntriesTable = `
CREATE TABLE entries (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id          INTEGER NOT NULL,
  category_id         INTEGER,
  payment_method_id   INTEGER,
  type                TEXT    NOT NULL DEFAULT 'expense' CHECK(type IN ('expense', 'income', 'transfer')),
  amount              REAL    NOT NULL CHECK(amount >= 0),
  title               TEXT    NOT NULL,
  description         TEXT,
  date                INTEGER NOT NULL,
  created_at          INTEGER NOT NULL,
  updated_at          INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL
)`

const createTagsTable = `
CREATE TABLE tags (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT    NOT NULL,
  color         TEXT,
  created_at    INTEGER NOT NULL
)`

const createEntryTagsTable = `
CREATE TABLE entry_tags (
  entry_id      INTEGER NOT NULL,
  tag_id        INTEGER NOT NULL,
  PRIMARY KEY (entry_id, tag_id),
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
)`

const createBudgetsTable = `
CREATE TABLE budgets (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id    INTEGER,
  category_id   INTEGER,
  amount        REAL    NOT NULL CHECK(amount > 0),
  period        TEXT    NOT NULL DEFAULT 'monthly' CHECK(period IN ('weekly', 'monthly', 'yearly')),
  start_date    INTEGER NOT NULL,
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
)`

const createRecurringEntriesTable = `
CREATE TABLE recurring_entries (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id      INTEGER NOT NULL,
  category_id     INTEGER,
  type            TEXT    NOT NULL DEFAULT 'expense' CHECK(type IN ('expense', 'income')),
  amount          REAL    NOT NULL CHECK(amount >= 0),
  title           TEXT    NOT NULL,
  description     TEXT,
  frequency       TEXT    NOT NULL CHECK(frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'yearly')),
  start_date      INTEGER NOT NULL,
  end_date        INTEGER,
  next_occurrence INTEGER NOT NULL,
  is_active       INTEGER NOT NULL DEFAULT 1,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL,
  FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
)`

const createTransfersTable = `
CREATE TABLE transfers (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  from_entry_id       INTEGER NOT NULL,
  to_entry_id         INTEGER NOT NULL,
  exchange_rate       REAL    NOT NULL DEFAULT 1.0,
  created_at          INTEGER NOT NULL,
  FOREIGN KEY (from_entry_id) REFERENCES entries(id) ON DELETE CASCADE,
  FOREIGN KEY (to_entry_id) REFERENCES entries(id) ON DELETE CASCADE
)`

const createAttachmentsTable = `
CREATE TABLE attachments (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id      INTEGER NOT NULL,
  file_path     TEXT    NOT NULL,
  file_name     TEXT    NOT NULL,
  mime_type     TEXT,
  file_size     INTEGER,
  created_at    INTEGER NOT NULL,
  FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE
)`

const indexes = [
  'CREATE UNIQUE INDEX idx_accounts_name ON accounts(name)',
  'CREATE INDEX idx_accounts_archived ON accounts(is_archived)',

  'CREATE UNIQUE INDEX idx_categories_name_type ON categories(name, type)',
  'CREATE INDEX idx_categories_parent ON categories(parent_id)',
  'CREATE INDEX idx_categories_type ON categories(type)',

  'CREATE UNIQUE INDEX idx_payment_methods_name ON payment_methods(name)',

  'CREATE INDEX idx_entries_account ON entries(account_id)',
  'CREATE INDEX idx_entries_category ON entries(category_id)',
  'CREATE INDEX idx_entries_payment_method ON entries(payment_method_id)',
  'CREATE INDEX idx_entries_date ON entries(date)',
  'CREATE INDEX idx_entries_type ON entries(type)',
  'CREATE INDEX idx_entries_account_date ON entries(account_id, date)',
  'CREATE INDEX idx_entries_account_type_date ON entries(account_id, type, date)',

  'CREATE UNIQUE INDEX idx_tags_name ON tags(name)',
  'CREATE INDEX idx_entry_tags_tag ON entry_tags(tag_id)',

  'CREATE INDEX idx_budgets_account ON budgets(account_id)',
  'CREATE INDEX idx_budgets_category ON budgets(category_id)',
  'CREATE INDEX idx_budgets_active ON budgets(is_active)',

  'CREATE INDEX idx_recurring_active_next ON recurring_entries(is_active, next_occurrence)',
  'CREATE INDEX idx_recurring_account ON recurring_entries(account_id)',

  'CREATE UNIQUE INDEX idx_transfers_from ON transfers(from_entry_id)',
  'CREATE UNIQUE INDEX idx_transfers_to ON transfers(to_entry_id)',

  'CREATE INDEX idx_attachments_entry ON attachments(entry_id)'
]

interface SeedCategory {
  name: string
  type: 'expense' | 'income'
}

const seedCategories: SeedCategory[] = [
  { name: 'Food', type: 'expense' },
  { name: 'Transport', type: 'expense' },
  { name: 'Housing', type: 'expense' },
  { name: 'Utilities', type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Health', type: 'expense' },
  { name: 'Shopping', type: 'expense' },
  { name: 'Education', type: 'expense' },
  { name: 'Salary', type: 'income' },
  { name: 'Freelance', type: 'income' },
  { name: 'Investment', type: 'income' },
  { name: 'Gift', type: 'income' }
]

export const v001Initial = (db: NitroSQLiteConnection): void => {
  const tables = [
    createAccountsTable,
    createCategoriesTable,
    createPaymentMethodsTable,
    createEntriesTable,
    createTagsTable,
    createEntryTagsTable,
    createBudgetsTable,
    createRecurringEntriesTable,
    createTransfersTable,
    createAttachmentsTable
  ]

  for (const table of tables) {
    db.execute(table)
  }

  for (const index of indexes) {
    db.execute(index)
  }

  const now = Math.floor(Date.now() / 1000)

  db.execute(
    'INSERT INTO accounts (name, currency_code, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    ['Personal', 'USD', 0, now, now]
  )

  for (const category of seedCategories) {
    db.execute(
      'INSERT INTO categories (name, type, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      [category.name, category.type, 0, now, now]
    )
  }
}
