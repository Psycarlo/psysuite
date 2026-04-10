import './global.css'
import { Provider } from '@psysuite/ui-mobile'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'

import { initializeDatabase } from '@/db/initialize'
import { HomeScreen } from '@/screens/home'

export default function App() {
  const [dbReady, setDbReady] = useState(false)

  useEffect(() => {
    const init = async () => {
      await initializeDatabase()
      setDbReady(true)
    }
    init()
  }, [])

  if (!dbReady) {
    return (
      <Provider>
        <View className="flex-1 items-center justify-center bg-background">
          <ActivityIndicator size="large" />
        </View>
      </Provider>
    )
  }

  return (
    <Provider>
      <HomeScreen />
    </Provider>
  )
}
