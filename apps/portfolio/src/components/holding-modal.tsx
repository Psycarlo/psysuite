import { Picker, Host, Text as PickerText } from '@expo/ui/swift-ui'
import { lineLimit, pickerStyle, tag } from '@expo/ui/swift-ui/modifiers'
import { Trash2 } from 'lucide-react-native'
import { useReducer } from 'react'
import {
  Alert,
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

import type { Holding, HoldingType } from '@/types/holding'

interface FormState {
  type: HoldingType
  symbol: string
  name: string
  quantity: string
  costBasis: string
}

type FormAction =
  | { type: 'update'; fields: Partial<FormState> }
  | { type: 'reset' }
  | { type: 'populate'; holding: Holding }

const initialState: FormState = {
  costBasis: '',
  name: '',
  quantity: '',
  symbol: '',
  type: 'stock'
}

const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case 'update': {
      return { ...state, ...action.fields }
    }
    case 'reset': {
      return initialState
    }
    case 'populate': {
      return {
        costBasis:
          action.holding.cost_basis === null
            ? ''
            : String(action.holding.cost_basis),
        name: action.holding.name ?? '',
        quantity: String(action.holding.quantity),
        symbol: action.holding.symbol,
        type: action.holding.type
      }
    }
    default: {
      return state
    }
  }
}

export interface HoldingModalSaveParams {
  type: HoldingType
  symbol: string
  name: string | null
  quantity: number
  cost_basis: number | null
}

interface HoldingModalProps {
  visible: boolean
  holding?: Holding | null
  onClose: () => void
  onSave: (params: HoldingModalSaveParams) => void
  onDelete?: (id: number) => void
}

const BITCOIN_SYMBOL = 'BTC'

export const HoldingModal = ({
  visible,
  holding,
  onClose,
  onSave,
  onDelete
}: HoldingModalProps) => {
  const insets = useSafeAreaInsets()
  const isEditing = holding !== null && holding !== undefined

  const [form, dispatch] = useReducer(formReducer, initialState)

  const quantityNumber = Number.parseFloat(form.quantity)
  const symbolTrimmed =
    form.type === 'bitcoin' ? BITCOIN_SYMBOL : form.symbol.trim().toUpperCase()
  const canSave = symbolTrimmed.length > 0 && quantityNumber > 0

  const populateForm = () => {
    if (holding) {
      dispatch({ holding, type: 'populate' })
    } else {
      dispatch({ type: 'reset' })
    }
  }

  const handleSave = () => {
    if (!canSave) {
      return
    }
    const costBasisNumber = Number.parseFloat(form.costBasis)
    onSave({
      cost_basis: Number.isFinite(costBasisNumber) ? costBasisNumber : null,
      name: form.name.trim() || null,
      quantity: quantityNumber,
      symbol: symbolTrimmed,
      type: form.type
    })
    dispatch({ type: 'reset' })
  }

  const handleClose = () => {
    dispatch({ type: 'reset' })
    onClose()
  }

  const handleDelete = () => {
    if (!(holding && onDelete)) {
      return
    }
    Alert.alert(
      'Delete holding',
      `Delete "${holding.symbol}"? This cannot be undone.`,
      [
        { style: 'cancel', text: 'Cancel' },
        {
          onPress: () => {
            onDelete(holding.id)
          },
          style: 'destructive',
          text: 'Delete'
        }
      ]
    )
  }

  const handleTypeChange = (value: HoldingType) => {
    dispatch({
      fields: {
        symbol: value === 'bitcoin' ? BITCOIN_SYMBOL : '',
        type: value
      },
      type: 'update'
    })
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
            {isEditing ? 'Edit holding' : 'New holding'}
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
              <Text className="text-sm text-zinc-400 mb-2">Type</Text>
              <Host matchContents={{ vertical: true }}>
                <Picker
                  selection={form.type === 'stock' ? 0 : 1}
                  onSelectionChange={(value) => {
                    handleTypeChange(value === 0 ? 'stock' : 'bitcoin')
                  }}
                  modifiers={[pickerStyle('segmented'), lineLimit(1)]}
                >
                  <PickerText modifiers={[tag(0)]}>Stock</PickerText>
                  <PickerText modifiers={[tag(1)]}>Bitcoin</PickerText>
                </Picker>
              </Host>
            </View>

            {form.type === 'stock' && (
              <View>
                <Text className="text-sm text-zinc-400 mb-2">Symbol</Text>
                <TextInput
                  className="bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
                  placeholder="AAPL"
                  placeholderTextColor="#a1a1aa"
                  value={form.symbol}
                  onChangeText={(value) => {
                    dispatch({
                      fields: { symbol: value.toUpperCase() },
                      type: 'update'
                    })
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  autoFocus={!isEditing}
                />
              </View>
            )}

            <View>
              <Text className="text-sm text-zinc-400 mb-2">
                Name (optional)
              </Text>
              <TextInput
                className="bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
                placeholder={form.type === 'bitcoin' ? 'Bitcoin' : 'Apple Inc.'}
                placeholderTextColor="#a1a1aa"
                value={form.name}
                onChangeText={(value) => {
                  dispatch({ fields: { name: value }, type: 'update' })
                }}
              />
            </View>

            <View>
              <Text className="text-sm text-zinc-400 mb-2">Quantity</Text>
              <TextInput
                className="bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
                placeholder="0.00"
                placeholderTextColor="#a1a1aa"
                value={form.quantity}
                onChangeText={(value) => {
                  dispatch({ fields: { quantity: value }, type: 'update' })
                }}
                keyboardType="decimal-pad"
              />
            </View>

            <View>
              <Text className="text-sm text-zinc-400 mb-2">
                Cost basis per unit (optional)
              </Text>
              <TextInput
                className="bg-zinc-50 rounded-lg px-4 py-3 text-base text-black"
                placeholder="0.00"
                placeholderTextColor="#a1a1aa"
                value={form.costBasis}
                onChangeText={(value) => {
                  dispatch({ fields: { costBasis: value }, type: 'update' })
                }}
                keyboardType="decimal-pad"
              />
            </View>

            {isEditing && onDelete && (
              <Pressable
                onPress={handleDelete}
                className="flex-row items-center justify-center gap-2 mt-4 py-3 rounded-lg bg-red-50"
              >
                <Trash2 size={18} color="#ef4444" />
                <Text className="text-base font-semibold text-red-500">
                  Delete
                </Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}
