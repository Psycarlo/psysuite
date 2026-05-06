import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

const createPortfoliosTable = `
CREATE TABLE portfolios (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
)`

const createHoldingsTable = `
CREATE TABLE holdings (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id  INTEGER NOT NULL,
  type          TEXT    NOT NULL CHECK(type IN ('stock', 'bitcoin')),
  symbol        TEXT    NOT NULL,
  name          TEXT,
  quantity      REAL    NOT NULL CHECK(quantity >= 0),
  cost_basis    REAL,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id) ON DELETE CASCADE
)`

const createPriceCacheTable = `
CREATE TABLE price_cache (
  symbol      TEXT    NOT NULL,
  type        TEXT    NOT NULL CHECK(type IN ('stock', 'bitcoin')),
  price_usd   REAL    NOT NULL,
  fetched_at  INTEGER NOT NULL,
  PRIMARY KEY (symbol, type)
)`

const createPriceHistoryTable = `
CREATE TABLE price_history (
  symbol      TEXT    NOT NULL,
  type        TEXT    NOT NULL CHECK(type IN ('stock', 'bitcoin')),
  date        INTEGER NOT NULL,
  price_usd   REAL    NOT NULL,
  PRIMARY KEY (symbol, type, date)
)`

const indexes = [
  'CREATE UNIQUE INDEX idx_portfolios_name ON portfolios(name)',
  'CREATE INDEX idx_holdings_portfolio ON holdings(portfolio_id)',
  'CREATE UNIQUE INDEX idx_holdings_unique ON holdings(portfolio_id, type, symbol)',
  'CREATE INDEX idx_price_history_date ON price_history(symbol, type, date)'
]

export const v001Initial = (db: NitroSQLiteConnection): void => {
  const tables = [
    createPortfoliosTable,
    createHoldingsTable,
    createPriceCacheTable,
    createPriceHistoryTable
  ]

  for (const table of tables) {
    db.execute(table)
  }

  for (const index of indexes) {
    db.execute(index)
  }

  const now = Math.floor(Date.now() / 1000)

  db.execute(
    'INSERT INTO portfolios (name, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?)',
    ['Main', 0, now, now]
  )
}
