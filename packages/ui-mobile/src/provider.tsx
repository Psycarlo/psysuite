import { HeroUINativeProvider } from 'heroui-native'
import type { ReactNode } from 'react'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

interface ProviderProps {
  children: ReactNode
}

export const Provider = ({ children }: ProviderProps) => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <HeroUINativeProvider>{children}</HeroUINativeProvider>
  </GestureHandlerRootView>
)
