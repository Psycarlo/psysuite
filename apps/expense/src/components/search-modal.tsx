import { FlashList } from '@shopify/flash-list'
import { Search } from 'lucide-react-native'
import { useState } from 'react'
import { Modal, Pressable, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { TransactionItem } from '@/components/transaction-item'
import { getDatabase } from '@/db/connection'
import { searchEntries } from '@/db/repositories/entries'
import type { Entry } from '@/types/entry'

interface SearchModalProps {
  visible: boolean
  accountId: number
  onClose: () => void
}

const renderItem = ({ item }: { item: Entry }) => (
  <TransactionItem entry={item} />
)

export const SearchModal = ({
  visible,
  accountId,
  onClose
}: SearchModalProps) => {
  const insets = useSafeAreaInsets()
  const [query, setQuery] = useState('')

  const results = query.trim().length > 0
    ? searchEntries(getDatabase(), accountId, query.trim())
    : []

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <View className="flex-row items-center gap-3 px-5 py-3">
          <View className="flex-1 flex-row items-center gap-2 bg-zinc-100 rounded-xl px-3 py-2.5">
            <Search size={18} color="#a1a1aa" />
            <TextInput
              className="flex-1 text-base text-black"
              placeholder="Search expenses..."
              placeholderTextColor="#a1a1aa"
              value={query}
              onChangeText={setQuery}
              autoFocus
              returnKeyType="search"
            />
          </View>
          <Pressable onPress={handleClose}>
            <Text className="text-base text-blue-500">Cancel</Text>
          </Pressable>
        </View>

        <FlashList
          data={results}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ paddingHorizontal: 20 }}
          estimatedItemSize={64}
          ListEmptyComponent={
            <View className="items-center py-10">
              <Text className="text-zinc-400">
                {query.trim().length > 0
                  ? 'No results found'
                  : 'Type to search expenses'}
              </Text>
            </View>
          }
        />
      </View>
    </Modal>
  )
}
