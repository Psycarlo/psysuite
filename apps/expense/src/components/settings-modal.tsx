import { Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const APP_VERSION = '1.0.0'

interface SettingsModalProps {
  visible: boolean
  onClose: () => void
}

export const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
  const insets = useSafeAreaInsets()

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center justify-between px-5 py-3">
          <Pressable onPress={onClose}>
            <Text className="text-base text-blue-500">Done</Text>
          </Pressable>
          <Text className="text-base font-semibold text-black">Settings</Text>
          <View className="w-14" />
        </View>

        <View className="px-5 mt-4">
          <View className="flex-row items-center justify-between py-4 border-b border-zinc-100">
            <Text className="text-base text-black">App Version</Text>
            <Text className="text-base text-zinc-400">{APP_VERSION}</Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}
