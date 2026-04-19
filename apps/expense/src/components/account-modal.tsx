import { Check, Plus, Trash2 } from 'lucide-react-native'
import { useState } from 'react'
import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { Account } from '@/types/account'

interface AccountModalProps {
  visible: boolean
  accounts: Account[]
  selectedId: number
  onSelect: (id: number) => void
  onCreate: (name: string) => void
  onDelete: (id: number) => void
  onClose: () => void
}

export const AccountModal = ({
  visible,
  accounts,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onClose
}: AccountModalProps) => {
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

  const handleDelete = (account: Account) => {
    Alert.alert(
      'Delete account',
      `Are you sure you want to delete "${account.name}"?`,
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => {
            onDelete(account.id)
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
          <Text className="text-base font-semibold text-black">Accounts</Text>
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
              placeholder="Account name"
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
          {accounts.map((account) => (
            <View
              key={account.id}
              className="flex-row items-center justify-between py-4 border-b border-zinc-100"
            >
              <Pressable
                onPress={() => {
                  handleSelect(account.id)
                }}
                className="flex-1 flex-row items-center gap-3"
              >
                {selectedId === account.id && (
                  <Check size={18} color="#3b82f6" />
                )}
                <Text
                  className={`text-base ${selectedId === account.id ? 'font-semibold text-black' : 'text-black'}`}
                >
                  {account.name}
                </Text>
              </Pressable>
              {accounts.length > 1 && (
                <Pressable
                  onPress={() => {
                    handleDelete(account)
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
