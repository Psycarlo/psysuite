import { DatePicker, Host, Picker, Text as PickerText } from '@expo/ui/swift-ui'
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers'
import { useState } from 'react'
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import type { Category } from '@/types/category'
import type { Entry } from '@/types/entry'
import type { PaymentMethod } from '@/types/payment-method'

const NONE_VALUE = 0

interface ExpenseModalProps {
  visible: boolean
  entry?: Entry | null
  categories: Category[]
  paymentMethods: PaymentMethod[]
  onClose: () => void
  onSave: (params: {
    title: string
    amount: number
    date: number
    category_id: number | null
    payment_method_id: number | null
  }) => void
}

export const ExpenseModal = ({
  visible,
  entry,
  categories,
  paymentMethods,
  onClose,
  onSave
}: ExpenseModalProps) => {
  const insets = useSafeAreaInsets()
  const isEditing = entry !== null && entry !== undefined

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(new Date())
  const [categoryId, setCategoryId] = useState<number>(NONE_VALUE)
  const [paymentMethodId, setPaymentMethodId] = useState<number>(NONE_VALUE)

  const canSave = title.trim().length > 0 && Number.parseFloat(amount) > 0

  const populateForm = () => {
    if (entry) {
      setTitle(entry.title)
      setAmount(String(entry.amount))
      setDate(new Date(entry.date * 1000))
      setCategoryId(entry.category_id ?? NONE_VALUE)
      setPaymentMethodId(entry.payment_method_id ?? NONE_VALUE)
    } else {
      resetForm()
    }
  }

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setDate(new Date())
    setCategoryId(NONE_VALUE)
    setPaymentMethodId(NONE_VALUE)
  }

  const handleSave = () => {
    if (!canSave) {
      return
    }
    const timestamp = Math.floor(date.getTime() / 1000)
    onSave({
      amount: Number.parseFloat(amount),
      category_id: categoryId === NONE_VALUE ? null : categoryId,
      date: timestamp,
      payment_method_id:
        paymentMethodId === NONE_VALUE ? null : paymentMethodId,
      title: title.trim()
    })
    resetForm()
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      onShow={populateForm}
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
            {isEditing ? 'Edit expense' : 'New expense'}
          </Text>
          <Pressable onPress={handleSave} disabled={!canSave}>
            <Text
              className={`text-base font-semibold ${canSave ? 'text-blue-500' : 'text-blue-200'}`}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView
          className="flex-1 px-5 mt-6"
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-5">
            <View>
              <Text className="text-sm text-zinc-400 mb-2">Title</Text>
              <TextInput
                className="bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
                placeholder="What did you spend on?"
                placeholderTextColor="#a1a1aa"
                value={title}
                onChangeText={setTitle}
                autoFocus={!isEditing}
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

            <View>
              <Text className="text-sm text-zinc-400 mb-2">Category</Text>
              <Host matchContents>
                <Picker
                  selection={categoryId}
                  onSelectionChange={setCategoryId}
                  modifiers={[pickerStyle('menu')]}
                >
                  <PickerText modifiers={[tag(NONE_VALUE)]}>None</PickerText>
                  {categories.map((c) => (
                    <PickerText key={c.id} modifiers={[tag(c.id)]}>
                      {c.name}
                    </PickerText>
                  ))}
                </Picker>
              </Host>
            </View>

            <View>
              <Text className="text-sm text-zinc-400 mb-2">Payment method</Text>
              <Host matchContents>
                <Picker
                  selection={paymentMethodId}
                  onSelectionChange={setPaymentMethodId}
                  modifiers={[pickerStyle('menu')]}
                >
                  <PickerText modifiers={[tag(NONE_VALUE)]}>None</PickerText>
                  {paymentMethods.map((pm) => (
                    <PickerText key={pm.id} modifiers={[tag(pm.id)]}>
                      {pm.name}
                    </PickerText>
                  ))}
                </Picker>
              </Host>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
