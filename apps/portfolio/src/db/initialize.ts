import { getDatabase } from './connection'
import { runMigrations } from './migrations'

let initialized = false

export const initializeDatabase = async (): Promise<void> => {
  if (initialized) {
    return
  }

  const db = getDatabase()
  await runMigrations(db)
  initialized = true
}
