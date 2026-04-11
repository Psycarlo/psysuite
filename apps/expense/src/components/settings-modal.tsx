import { ChevronDown } from 'lucide-react-native'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Text,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { getDatabase } from '@/db/connection'
import { getAccounts } from '@/db/repositories/accounts'
import { exportAccountToCSV } from '@/utils/export-csv'

const APP_VERSION = '1.0.0'

interface SettingsModalProps {
  visible: boolean
  onClose: () => void
}

export const SettingsModal = ({ visible, onClose }: SettingsModalProps) => {
  const insets = useSafeAreaInsets()
  const [exporting, setExporting] = useState(false)
  const [showAccountPicker, setShowAccountPicker] = useState(false)

  const db = getDatabase()
  const accounts = visible ? getAccounts(db) : []
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
    null
  )

  const selectedAccount =
    accounts.find((a) => a.id === selectedAccountId) ?? accounts[0] ?? null

  const handleExport = async () => {
    if (!selectedAccount) {
      return
    }
    setExporting(true)
    try {
      await exportAccountToCSV(db, selectedAccount)
    } catch {
      Alert.alert('Export failed', 'Could not export data. Please try again.')
    } finally {
      setExporting(false)
    }
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
            <Text className="text-base text-blue-500">Done</Text>
          </Pressable>
          <Text className="text-base font-semibold text-black">Settings</Text>
          <View className="w-14" />
        </View>

        <View className="px-5 mt-4">
          <Text className="text-sm font-semibold text-zinc-400 uppercase mb-2">
            Export
          </Text>

          <View className="bg-zinc-50 rounded-xl p-4">
            <Text className="text-sm text-zinc-500 mb-3">
              Export all transactions from an account as CSV
            </Text>

            <Pressable
              onPress={() => {
                setShowAccountPicker(!showAccountPicker)
              }}
              className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 mb-3"
            >
              <Text className="text-base text-black">
                {selectedAccount?.name ?? 'No accounts'}
              </Text>
              <ChevronDown size={18} color="#a1a1aa" />
            </Pressable>

            {showAccountPicker && (
              <View className="bg-white rounded-lg mb-3 overflow-hidden">
                {accounts.map((account) => (
                  <Pressable
                    key={account.id}
                    onPress={() => {
                      setSelectedAccountId(account.id)
                      setShowAccountPicker(false)
                    }}
                    className="px-4 py-3 border-b border-zinc-100"
                  >
                    <Text
                      className={`text-base ${
                        account.id === selectedAccount?.id
                          ? 'font-semibold text-blue-500'
                          : 'text-black'
                      }`}
                    >
                      {account.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Pressable
              onPress={handleExport}
              disabled={!selectedAccount || exporting}
              className={`items-center rounded-lg py-3 ${
                selectedAccount && !exporting ? 'bg-black' : 'bg-zinc-300'
              }`}
            >
              {exporting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-base font-semibold text-white">
                  Export CSV
                </Text>
              )}
            </Pressable>
          </View>

          <View className="mt-6">
            <Text className="text-sm font-semibold text-zinc-400 uppercase mb-2">
              About
            </Text>
            <View className="flex-row items-center justify-between py-4 border-b border-zinc-100">
              <Text className="text-base text-black">App Version</Text>
              <Text className="text-base text-zinc-400">{APP_VERSION}</Text>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  )
}
