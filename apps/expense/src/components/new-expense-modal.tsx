import { DatePicker, Host } from '@expo/ui/swift-ui'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface NewExpenseModalProps {
  visible: boolean
  onClose: () => void
  onSave: (title: string, amount: number, date: number) => void
}

export const NewExpenseModal = ({
  visible,
  onClose,
  onSave
}: NewExpenseModalProps) => {
  const insets = useSafeAreaInsets()
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date())

  const canSave = title.trim().length > 0 && Number.parseFloat(amount) > 0

  const handleSave = () => {
    if (!canSave) return
    const timestamp = Math.floor(date.getTime() / 1000)
    onSave(title.trim(), Number.parseFloat(amount), timestamp)
    resetForm()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setDate(new Date())
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        className="flex-1 bg-white"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ paddingTop: insets.top }}
      >
        <View className="flex-row items-center justify-between px-5 py-3">
          <Pressable onPress={handleClose}>
            <Text className="text-base text-blue-500">Cancel</Text>
          </Pressable>
          <Text className="text-base font-semibold text-black">
            New expense
          </Text>
          <Pressable onPress={handleSave} disabled={!canSave}>
            <Text
              className={`text-base font-semibold ${canSave ? 'text-blue-500' : 'text-blue-200'}`}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <View className="px-5 mt-6 gap-5">
          <View>
            <Text className="text-sm text-zinc-400 mb-2">Title</Text>
            <TextInput
              className="bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
              placeholder="What did you spend on?"
              placeholderTextColor="#a1a1aa"
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
          </View>

          <View>
            <Text className="text-sm text-zinc-400 mb-2">Amount</Text>
            <TextInput
              className="bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
              placeholder="0.00"
              placeholderTextColor="#a1a1aa"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
          </View>

          <View>
            <Text className="text-sm text-zinc-400 mb-2">Date</Text>
            <Host matchContents>
              <DatePicker
                title="Date"
                selection={date}
                displayedComponents={['date']}
                onDateChange={setDate}
              />
            </Host>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}
