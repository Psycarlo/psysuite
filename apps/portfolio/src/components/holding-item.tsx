import { Bitcoin, TrendingUp } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import type { Holding } from '@/types/holding'

interface HoldingItemProps {
  holding: Holding
  currentPrice: number
  onPress?: (holding: Holding) => void
}

export const HoldingItem = ({
  holding,
  currentPrice,
  onPress
}: HoldingItemProps) => {
  const value = currentPrice * holding.quantity
  const cost =
    holding.cost_basis !== null ? holding.cost_basis * holding.quantity : null
  const pnl = cost !== null ? value - cost : null
  const pnlPercent = cost !== null && cost > 0 ? (value / cost - 1) * 100 : null

  const Icon = holding.type === 'bitcoin' ? Bitcoin : TrendingUp

  return (
    <Pressable
      className="flex-row items-center py-3"
      onPress={
        onPress
          ? () => {
              onPress(holding)
            }
          : undefined
      }
    >
      <View className="w-10 h-10 rounded-xl bg-zinc-100 items-center justify-center mr-3">
        <Icon size={20} color="#000" />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-black">
          {holding.symbol}
        </Text>
        <Text className="text-sm text-zinc-400">
          {holding.quantity} @ ${currentPrice.toFixed(2)}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-base font-semibold text-black">
          ${value.toFixed(2)}
        </Text>
        {pnl !== null && pnlPercent !== null && (
          <Text
            className={`text-sm ${pnl >= 0 ? 'text-green-600' : 'text-red-500'}`}
          >
            {pnl >= 0 ? '+' : ''}
            {pnlPercent.toFixed(2)}%
          </Text>
        )}
      </View>
    </Pressable>
  )
}
