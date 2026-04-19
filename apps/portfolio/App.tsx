import './global.css'
import { Provider } from '@psysuite/ui-mobile'
import { Text, View } from 'react-native'

export default function App() {
  return (
    <Provider>
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-4xl font-bold">Portfolio</Text>
      </View>
    </Provider>
  )
}
