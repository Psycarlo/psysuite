import { FlashList } from '@shopify/flash-list'
import { ChevronDown, ListFilter, Search, Settings } from 'lucide-react-native'
import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AccountModal } from '@/components/account-modal'
import { AnimatedAmount } from '@/components/animated-amount'
import { Fab } from '@/components/fab'
import { FilterModal } from '@/components/filter-modal'
import { ExpenseModal } from '@/components/new-expense-modal'
import { SearchModal } from '@/components/search-modal'
import { SettingsModal } from '@/components/settings-modal'
import { SpendingChart } from '@/components/spending-chart'
import { TransactionItem } from '@/components/transaction-item'
import { getDatabase } from '@/db/connection'
import {
  createAccount,
  deleteAccount,
  getAccounts
} from '@/db/repositories/accounts'
import { getCategories } from '@/db/repositories/categories'
import {
  createEntry,
  getDailySpending,
  getEntries,
  getTotalSpending,
  updateEntry
} from '@/db/repositories/entries'
import { getPaymentMethods } from '@/db/repositories/payment-methods'
import { buildChartData } from '@/lib/chart-data'
import { getDateRange, getPeriodLabel } from '@/lib/period'
import type { Account } from '@/types/account'
import type { Entry } from '@/types/entry'
import type { Period } from '@/types/period'

const loadData = (period: Period, accountId: number) => {
  const db = getDatabase()
  const range = getDateRange(period)
  const total = getTotalSpending(db, accountId, range?.start, range?.end)
  const entries = getEntries(db, accountId, range?.start, range?.end)

  const now = new Date()
  const weekStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - now.getDay()
  )
  const defaultRange = {
    end: Math.floor(now.getTime() / 1000),
    start: Math.floor(weekStart.getTime() / 1000)
  }

  const chartRange = range ?? defaultRange
  const dailySpending = getDailySpending(
    db,
    accountId,
    chartRange.start,
    chartRange.end
  )
  const chartData = buildChartData(dailySpending, period)

  return { chartData, entries, total }
}

export const HomeScreen = () => {
  const insets = useSafeAreaInsets()
  const db = getDatabase()

  const [period, setPeriod] = useState<Period>('all_time')
  const [accounts, setAccounts] = useState<Account[]>(() => getAccounts(db))
  const [selectedAccountId, setSelectedAccountId] = useState<number>(
    () => accounts[0]?.id ?? 1
  )

  const [data, setData] = useState(() => loadData(period, selectedAccountId))
  const categories = getCategories(db, 'expense')
  const paymentMethods = getPaymentMethods(db)

  const [expenseModalVisible, setExpenseModalVisible] = useState(false)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [filterModalVisible, setFilterModalVisible] = useState(false)
  const [accountModalVisible, setAccountModalVisible] = useState(false)
  const [searchModalVisible, setSearchModalVisible] = useState(false)
  const [settingsModalVisible, setSettingsModalVisible] = useState(false)

  const refreshData = (newPeriod?: Period) => {
    setData(loadData(newPeriod ?? period, selectedAccountId))
  }

  const handleSaveExpense = (params: {
    title: string
    amount: number
    date: number
    category_id: number | null
    payment_method_id: number | null
  }) => {
    if (editingEntry) {
      updateEntry(db, editingEntry.id, {
        amount: params.amount,
        category_id: params.category_id,
        date: params.date,
        payment_method_id: params.payment_method_id,
        title: params.title
      })
    } else {
      createEntry(db, {
        account_id: selectedAccountId,
        amount: params.amount,
        category_id: params.category_id,
        date: params.date,
        payment_method_id: params.payment_method_id,
        title: params.title,
        type: 'expense'
      })
    }
    setExpenseModalVisible(false)
    setEditingEntry(null)
    refreshData()
  }

  const handleEntryPress = (entry: Entry) => {
    setEditingEntry(entry)
    setExpenseModalVisible(true)
  }

  const handleCloseModal = () => {
    setExpenseModalVisible(false)
    setEditingEntry(null)
  }

  const handlePeriodSelect = (newPeriod: Period) => {
    setPeriod(newPeriod)
    refreshData(newPeriod)
  }

  const handleCreateAccount = (name: string) => {
    createAccount(db, { name })
    setAccounts(getAccounts(db))
  }

  const handleDeleteAccount = (id: number) => {
    deleteAccount(db, id)
    const updated = getAccounts(db)
    setAccounts(updated)
    if (id === selectedAccountId && updated.length > 0) {
      setSelectedAccountId(updated[0].id)
    }
  }

  const handleSelectAccount = (id: number) => {
    setSelectedAccountId(id)
    setData(loadData(period, id))
  }

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId)

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable
          onPress={() => {
            setAccountModalVisible(true)
          }}
          className="flex-row items-center gap-1.5 border border-zinc-200 rounded-full px-4 py-2"
        >
          <Text className="text-sm font-semibold text-black">
            {selectedAccount?.name ?? 'Account'}
          </Text>
          <ChevronDown size={16} color="#000" />
        </Pressable>
        <View className="flex-row items-center gap-4">
          <Pressable
            onPress={() => {
              setSearchModalVisible(true)
            }}
          >
            <Search size={22} color="#000" />
          </Pressable>
          <Pressable
            onPress={() => {
              setFilterModalVisible(true)
            }}
          >
            <ListFilter size={22} color="#000" />
          </Pressable>
          <Pressable
            onPress={() => {
              setSettingsModalVisible(true)
            }}
          >
            <Settings size={22} color="#000" />
          </Pressable>
        </View>
      </View>

      <FlashList
        data={data.entries}
        renderItem={({ item }) => (
          <TransactionItem entry={item} onPress={handleEntryPress} />
        )}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListHeaderComponent={
          <View>
            <View className="mt-2 mb-4 p-5 bg-zinc-50 rounded-2xl">
              <Text className="text-sm text-zinc-400 mb-1">
                {getPeriodLabel(period)}
              </Text>
              <AnimatedAmount value={data.total} />
              <SpendingChart data={data.chartData} />
            </View>
            <Text className="text-sm text-zinc-400 mb-1">Expenses</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-zinc-400">No expenses yet</Text>
          </View>
        }
        ListFooterComponent={<View className="h-24" />}
      />

      <Fab
        onPress={() => {
          setExpenseModalVisible(true)
        }}
      />

      <ExpenseModal
        visible={expenseModalVisible}
        entry={editingEntry}
        categories={categories}
        paymentMethods={paymentMethods}
        onClose={handleCloseModal}
        onSave={handleSaveExpense}
      />
      <FilterModal
        visible={filterModalVisible}
        selected={period}
        onSelect={handlePeriodSelect}
        onClose={() => {
          setFilterModalVisible(false)
        }}
      />
      <AccountModal
        visible={accountModalVisible}
        accounts={accounts}
        selectedId={selectedAccountId}
        onSelect={handleSelectAccount}
        onCreate={handleCreateAccount}
        onDelete={handleDeleteAccount}
        onClose={() => {
          setAccountModalVisible(false)
        }}
      />
      <SearchModal
        visible={searchModalVisible}
        accountId={selectedAccountId}
        onClose={() => {
          setSearchModalVisible(false)
        }}
      />
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => {
          setSettingsModalVisible(false)
        }}
      />
    </View>
  )
}
