import { Pressable, Text, View } from 'react-native'

import { getPeriodDisplayName } from '@/lib/period'
import type { Period } from '@/types/period'

const PERIODS: Period[] = ['1w', '1m', '3m', '1y', 'all']

interface PeriodSelectorProps {
  selected: Period
  onSelect: (period: Period) => void
}

export const PeriodSelector = ({ selected, onSelect }: PeriodSelectorProps) => (
  <View className="flex-row items-center justify-between mt-3 bg-white rounded-lg p-1">
    {PERIODS.map((period) => (
      <Pressable
        key={period}
        onPress={() => {
          onSelect(period)
        }}
        className={`flex-1 items-center py-1.5 rounded-md ${selected === period ? 'bg-black' : ''}`}
      >
        <Text
          className={`text-xs font-semibold ${selected === period ? 'text-white' : 'text-zinc-500'}`}
        >
          {getPeriodDisplayName(period)}
        </Text>
      </Pressable>
    ))}
  </View>
)
