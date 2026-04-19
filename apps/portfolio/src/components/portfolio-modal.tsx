import { Check, Plus, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { Portfolio } from '@/types/portfolio'

interface PortfolioModalProps {
  visible: boolean
  portfolios: Portfolio[]
  selectedId: number
  onSelect: (id: number) => void
  onCreate: (name: string) => void
  onDelete: (id: number) => void
  onClose: () => void
}

export const PortfolioModal = ({
  visible,
  portfolios,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onClose
}: PortfolioModalProps) => {
  const insets = useSafeAreaInsets()
  const [newName, setNewName] = useState('')
  const [showCreate, setShowCreate] = useState(false)

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (trimmed.length === 0) {
      return
    }
    onCreate(trimmed)
    setNewName('')
    setShowCreate(false)
  }

  const handleDelete = (portfolio: Portfolio) => {
    Alert.alert(
      'Delete portfolio',
      `Are you sure you want to delete "${portfolio.name}"?`,
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => {
            onDelete(portfolio.id)
          },
          style: 'destructive',
          text: 'Delete'
        }
      ]
    )
  }

  const handleSelect = (id: number) => {
    onSelect(id)
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
          <Text className="text-base font-semibold text-black">Portfolios</Text>
          <Pressable
            onPress={() => {
              setShowCreate(!showCreate)
            }}
          >
            <Plus size={22} color="#3b82f6" />
          </Pressable>
        </View>

        {showCreate && (
          <View className="flex-row items-center px-5 py-3 gap-3 border-b border-zinc-100">
            <TextInput
              className="flex-1 bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
              placeholder="Portfolio name"
              placeholderTextColor="#a1a1aa"
              value={newName}
              onChangeText={setNewName}
              autoFocus
              onSubmitEditing={handleCreate}
            />
            <Pressable
              onPress={handleCreate}
              disabled={newName.trim().length === 0}
            >
              <Text
                className={`text-base font-semibold ${newName.trim().length > 0 ? 'text-blue-500' : 'text-blue-200'}`}
              >
                Add
              </Text>
            </Pressable>
          </View>
        )}

        <View className="px-5 mt-2">
          {portfolios.map((portfolio) => (
            <View
              key={portfolio.id}
              className="flex-row items-center justify-between py-4 border-b border-zinc-100"
            >
              <Pressable
                onPress={() => {
                  handleSelect(portfolio.id)
                }}
                className="flex-1 flex-row items-center gap-3"
              >
                {selectedId === portfolio.id && (
                  <Check size={18} color="#3b82f6" />
                )}
                <Text
                  className={`text-base ${selectedId === portfolio.id ? 'font-semibold text-black' : 'text-black'}`}
                >
                  {portfolio.name}
                </Text>
              </Pressable>
              {portfolios.length > 1 && (
                <Pressable
                  onPress={() => {
                    handleDelete(portfolio)
                  }}
                >
                  <Trash2 size={18} color="#ef4444" />
                </Pressable>
              )}
            </View>
          ))}
        </View>
      </View>
    </Modal>
  )
}
