import '@psysuite/ui-mobile/src/global.css'
import { Button, Provider } from '@psysuite/ui-mobile'
import { View } from 'react-native'

const handlePress = () => {
  // placeholder
}

export default function App() {
  return (
    <Provider>
      <View className="flex-1 items-center justify-center bg-background">
        <Button onPress={handlePress}>Get Started</Button>
      </View>
    </Provider>
  )
}
