import { DatePicker, Host, Picker, Text as PickerText } from '@expo/ui/swift-ui'
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers'
import { useReducer } from 'react'
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

interface FormState {
  title: string
  amount: string
  date: Date
  categoryId: number
  paymentMethodId: number
}

type FormAction =
  | { type: 'update'; fields: Partial<FormState> }
  | { type: 'reset' }
  | { type: 'populate'; entry: Entry }

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'update': {
      return { ...state, ...action.fields }
    }
    case 'reset': {
      return {
        amount: '',
        categoryId: NONE_VALUE,
        date: new Date(),
        paymentMethodId: NONE_VALUE,
        title: ''
      }
    }
    case 'populate': {
      return {
        amount: String(action.entry.amount),
        categoryId: action.entry.category_id ?? NONE_VALUE,
        date: new Date(action.entry.date * 1000),
        paymentMethodId: action.entry.payment_method_id ?? NONE_VALUE,
        title: action.entry.title
      }
    }
    default: {
      return state
    }
  }
}

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

  const [form, dispatch] = useReducer(formReducer, {
    amount: '',
    categoryId: NONE_VALUE,
    date: new Date(),
    paymentMethodId: NONE_VALUE,
    title: ''
  })

  const canSave =
    form.title.trim().length > 0 && Number.parseFloat(form.amount) > 0

  const populateForm = () => {
    if (entry) {
      dispatch({ entry, type: 'populate' })
    } else {
      dispatch({ type: 'reset' })
    }
  }

  const handleSave = () => {
    if (!canSave) {
      return
    }
    const timestamp = Math.floor(form.date.getTime() / 1000)
    onSave({
      amount: Number.parseFloat(form.amount),
      category_id: form.categoryId === NONE_VALUE ? null : form.categoryId,
      date: timestamp,
      payment_method_id:
        form.paymentMethodId === NONE_VALUE ? null : form.paymentMethodId,
      title: form.title.trim()
    })
    dispatch({ type: 'reset' })
  }

  const handleClose = () => {
    dispatch({ type: 'reset' })
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
                value={form.title}
                onChangeText={(value) => {
                  dispatch({ fields: { title: value }, type: 'update' })
                }}
                autoFocus={!isEditing}
              />
            </View>

            <View>
              <Text className="text-sm text-zinc-400 mb-2">Amount</Text>
              <TextInput
                className="bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
                placeholder="0.00"
                placeholderTextColor="#a1a1aa"
                value={form.amount}
                onChangeText={(value) => {
                  dispatch({ fields: { amount: value }, type: 'update' })
                }}
                keyboardType="decimal-pad"
              />
            </View>

            <View>
              <Text className="text-sm text-zinc-400 mb-2">Date</Text>
              <Host matchContents>
                <DatePicker
                  title="Date"
                  selection={form.date}
                  displayedComponents={['date']}
                  onDateChange={(value) => {
                    dispatch({ fields: { date: value }, type: 'update' })
                  }}
                />
              </Host>
            </View>

            <View>
              <Text className="text-sm text-zinc-400 mb-2">Category</Text>
              <Host matchContents>
                <Picker
                  selection={form.categoryId}
                  onSelectionChange={(value) => {
                    dispatch({ fields: { categoryId: value }, type: 'update' })
                  }}
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
                  selection={form.paymentMethodId}
                  onSelectionChange={(value) => {
                    dispatch({
                      fields: { paymentMethodId: value },
                      type: 'update'
                    })
                  }}
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
