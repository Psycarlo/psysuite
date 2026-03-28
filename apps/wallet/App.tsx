import './global.css'
import { Button, Provider } from '@psysuite/ui-mobile'
import { Text, View } from 'react-native'

const handlePress = () => {
  // placeholder
}

export default function App() {
  return (
    <Provider>
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-4xl font-bold mb-4">Wallet App</Text>
        <Button onPress={handlePress}>Get Started</Button>
      </View>
    </Provider>
  )
}
