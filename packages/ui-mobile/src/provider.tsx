import {
  InterTight_400Regular,
  InterTight_500Medium,
  InterTight_600SemiBold,
  InterTight_700Bold
} from '@expo-google-fonts/inter-tight'
import { useFonts } from 'expo-font'
import { HeroUINativeProvider } from 'heroui-native'
import type { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { SafeAreaProvider } from 'react-native-safe-area-context'

interface ProviderProps {
  children: ReactNode
}

export const Provider = ({ children }: ProviderProps) => {
  const [fontsLoaded] = useFonts({
    InterTight_400Regular,
    InterTight_500Medium,
    InterTight_600SemiBold,
    InterTight_700Bold
  })

  if (!fontsLoaded) {
    return null
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <HeroUINativeProvider>{children}</HeroUINativeProvider>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  )
}
