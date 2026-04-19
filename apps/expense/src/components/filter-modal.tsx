import { Check } from 'lucide-react-native'
import { Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { getPeriodDisplayName } from '@/lib/period'
import type { Period } from '@/types/period'

const PERIODS: Period[] = [
  'today',
  'this_week',
  'this_month',
  'this_year',
  'all_time'
]

interface FilterModalProps {
  visible: boolean
  selected: Period
  onSelect: (period: Period) => void
  onClose: () => void
}

export const FilterModal = ({
  visible,
  selected,
  onSelect,
  onClose
}: FilterModalProps) => {
  const insets = useSafeAreaInsets()

  const handleSelect = (period: Period) => {
    onSelect(period)
    onClose()
  }

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
            <Text className="text-base text-blue-500">Cancel</Text>
          </Pressable>
          <Text className="text-base font-semibold text-black">Filter</Text>
          <View className="w-14" />
        </View>

        <View className="px-5 mt-4">
          {PERIODS.map((period) => (
            <Pressable
              key={period}
              onPress={() => {
                handleSelect(period)
              }}
              className="flex-row items-center justify-between py-4 border-b border-zinc-100"
            >
              <Text className="text-base text-black">
                {getPeriodDisplayName(period)}
              </Text>
              {selected === period && <Check size={20} color="#3b82f6" />}
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  )
}
