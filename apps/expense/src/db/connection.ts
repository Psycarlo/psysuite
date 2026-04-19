import type { NitroSQLiteConnection } from 'react-native-nitro-sqlite'
import { open } from 'react-native-nitro-sqlite'

let connection: NitroSQLiteConnection | null = null

export const getDatabase = (): NitroSQLiteConnection => {
  if (!connection) {
    connection = open({ name: 'expense.db' })
    connection.execute('PRAGMA journal_mode = WAL')
    connection.execute('PRAGMA foreign_keys = ON')
  }
  return connection
}

export const closeDatabase = (): void => {
  if (connection) {
    connection.close()
    connection = null
  }
}
