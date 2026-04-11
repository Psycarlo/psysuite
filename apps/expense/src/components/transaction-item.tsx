import { Receipt } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import type { Entry } from '@/types/entry'

interface TransactionItemProps {
  entry: Entry
  onPress?: (entry: Entry) => void
}

const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

export const TransactionItem = ({ entry, onPress }: TransactionItemProps) => (
  <Pressable
    className="flex-row items-center py-3"
    onPress={onPress ? () => {
      onPress(entry)
    } : undefined}
  >
    <View className="w-10 h-10 rounded-xl bg-zinc-100 items-center justify-center mr-3">
      <Receipt size={20} color="#000" />
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-black">{entry.title}</Text>
      <Text className="text-sm text-zinc-400">
        {entry.category_name ? `${entry.category_name} · ` : ''}
        {formatDate(entry.date)}
      </Text>
    </View>
    <Text className="text-base font-semibold text-black">
      ${entry.amount.toFixed(2)}
    </Text>
  </Pressable>
)
