import './global.css'
import { Button, Provider } from '@psysuite/ui-mobile'
import { useEffect, useState } from 'react'
import { ActivityIndicator, Text, View } from 'react-native'

import { initializeDatabase } from '@/db/initialize'

const handlePress = () => {
  // placeholder
}

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
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-4xl font-bold mb-4">Expense App</Text>
        <Button onPress={handlePress}>Get Started</Button>
      </View>
    </Provider>
  )
}
