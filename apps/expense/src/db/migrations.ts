import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'

import { v001Initial } from './migrations/v001-initial'
import { v002CategoriesPaymentMethods } from './migrations/v002-categories-payment-methods'

interface Migration {
  version: number
  name: string
  up: (db: NitroSQLiteConnection) => void
}

const migrations: Migration[] = [
  { name: 'initial', up: v001Initial, version: 1 },
  {
    name: 'categories-payment-methods',
    up: v002CategoriesPaymentMethods,
    version: 2
  }
]

const getCurrentVersion = (db: NitroSQLiteConnection): number => {
  db.execute(
    'CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL, applied_at INTEGER NOT NULL)'
  )

  const result = db.execute<{ version: number }>(
    'SELECT version FROM schema_version ORDER BY version DESC LIMIT 1'
  )

  return result.rows.length > 0 ? (result.rows.item(0)?.version ?? 0) : 0
}

export const runMigrations = async (
  db: NitroSQLiteConnection
): Promise<void> => {
  const currentVersion = getCurrentVersion(db)

  const pending = migrations.filter((m) => m.version > currentVersion)

  for (const migration of pending) {
    // oxlint-disable-next-line require-await -- library type requires Promise<void> callback
    await db.transaction(async (tx) => {
      migration.up(db)

      const now = Math.floor(Date.now() / 1000)
      tx.execute(
        'INSERT INTO schema_version (version, applied_at) VALUES (?, ?)',
        [migration.version, now]
      )

      tx.commit()
    })
  }
}
