import { FlashList } from '@shopify/flash-list'
import { ChevronDown } from 'lucide-react-native'
import { useEffect, useReducer, useState } from 'react'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { AnimatedAmount } from '@/components/animated-amount'
import { Fab } from '@/components/fab'
import { HoldingItem } from '@/components/holding-item'
import type { HoldingModalSaveParams } from '@/components/holding-modal'
import { HoldingModal } from '@/components/holding-modal'
import { PeriodSelector } from '@/components/period-selector'
import { PortfolioChart } from '@/components/portfolio-chart'
import { PortfolioModal } from '@/components/portfolio-modal'
import { getDatabase } from '@/db/connection'
import {
  createHolding,
  deleteHolding,
  getHoldingsByPortfolio,
  updateHolding
} from '@/db/repositories/holdings'
import {
  createPortfolio,
  deletePortfolio,
  getPortfolios
} from '@/db/repositories/portfolios'
import { getCachedPrice } from '@/db/repositories/prices'
import { buildPortfolioChart, getCurrentPortfolioValue } from '@/lib/chart-data'
import { getDateRange, getPeriodDays } from '@/lib/period'
import { refreshAllPrices } from '@/lib/prices'
import type { Holding } from '@/types/holding'
import type { Period } from '@/types/period'
import type { Portfolio } from '@/types/portfolio'

const loadData = (period: Period, portfolioId: number) => {
  const db = getDatabase()
  const holdings = getHoldingsByPortfolio(db, portfolioId)
  const range = getDateRange(period)
  const chartData = buildPortfolioChart(db, holdings, range.start, range.end)
  const totalValue = getCurrentPortfolioValue(db, holdings)
  return { chartData, holdings, totalValue }
}

type ModalName = 'holding' | 'portfolio'

interface ModalState {
  active: ModalName | null
  editingHolding: Holding | null
}

type ModalAction =
  | { type: 'open'; modal: ModalName }
  | { type: 'edit'; holding: Holding }
  | { type: 'close' }

const modalReducer = (state: ModalState, action: ModalAction): ModalState => {
  switch (action.type) {
    case 'open': {
      return { active: action.modal, editingHolding: null }
    }
    case 'edit': {
      return { active: 'holding', editingHolding: action.holding }
    }
    case 'close': {
      return { active: null, editingHolding: null }
    }
    default: {
      return state
    }
  }
}

export const HomeScreen = () => {
  const insets = useSafeAreaInsets()
  const db = getDatabase()

  const [period, setPeriod] = useState<Period>('1m')
  const [portfolios, setPortfolios] = useState<Portfolio[]>(() =>
    getPortfolios(db)
  )
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<number>(
    () => portfolios[0]?.id ?? 1
  )

  const [data, setData] = useState(() => loadData(period, selectedPortfolioId))
  const [modal, dispatch] = useReducer(modalReducer, {
    active: null,
    editingHolding: null
  })
  const [refreshing, setRefreshing] = useState(false)
  const [refreshTick, setRefreshTick] = useState(0)

  const refreshData = (newPeriod?: Period, portfolioId?: number) => {
    setData(loadData(newPeriod ?? period, portfolioId ?? selectedPortfolioId))
  }

  useEffect(() => {
    const run = async () => {
      setRefreshing(true)
      const holdings = getHoldingsByPortfolio(db, selectedPortfolioId)
      const days = getPeriodDays(period)
      await refreshAllPrices(db, holdings, days)
      setData(loadData(period, selectedPortfolioId))
      setRefreshing(false)
    }
    void run()
  }, [period, selectedPortfolioId, refreshTick, db])

  const handleSaveHolding = (params: HoldingModalSaveParams) => {
    if (modal.editingHolding) {
      updateHolding(db, modal.editingHolding.id, {
        cost_basis: params.cost_basis,
        name: params.name,
        quantity: params.quantity,
        symbol: params.symbol
      })
    } else {
      createHolding(db, {
        cost_basis: params.cost_basis,
        name: params.name,
        portfolio_id: selectedPortfolioId,
        quantity: params.quantity,
        symbol: params.symbol,
        type: params.type
      })
    }
    dispatch({ type: 'close' })
    setRefreshTick((t) => t + 1)
  }

  const handleDeleteHolding = (id: number) => {
    deleteHolding(db, id)
    dispatch({ type: 'close' })
    setRefreshTick((t) => t + 1)
  }

  const handleHoldingPress = (holding: Holding) => {
    dispatch({ holding, type: 'edit' })
  }

  const handlePeriodSelect = (newPeriod: Period) => {
    setPeriod(newPeriod)
    refreshData(newPeriod)
  }

  const handleCreatePortfolio = (name: string) => {
    createPortfolio(db, { name })
    setPortfolios(getPortfolios(db))
  }

  const handleDeletePortfolio = (id: number) => {
    deletePortfolio(db, id)
    const updated = getPortfolios(db)
    setPortfolios(updated)
    if (id === selectedPortfolioId && updated.length > 0) {
      setSelectedPortfolioId(updated[0].id)
      refreshData(undefined, updated[0].id)
    }
  }

  const handleSelectPortfolio = (id: number) => {
    setSelectedPortfolioId(id)
    refreshData(undefined, id)
  }

  const renderItem = ({ item }: { item: Holding }) => {
    const cached = getCachedPrice(db, item.symbol, item.type)
    const price = cached?.price_usd ?? 0
    return (
      <HoldingItem
        holding={item}
        currentPrice={price}
        onPress={handleHoldingPress}
      />
    )
  }

  const selectedPortfolio = portfolios.find((p) => p.id === selectedPortfolioId)

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 py-3">
        <Pressable
          onPress={() => {
            dispatch({ modal: 'portfolio', type: 'open' })
          }}
          className="flex-row items-center gap-1.5 border border-zinc-200 rounded-full px-4 py-2"
        >
          <Text className="text-sm font-semibold text-black">
            {selectedPortfolio?.name ?? 'Portfolio'}
          </Text>
          <ChevronDown size={16} color="#000" />
        </Pressable>
        {refreshing && <Text className="text-xs text-zinc-400">Syncing…</Text>}
      </View>

      <FlashList
        data={data.holdings}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 20 }}
        ListHeaderComponent={
          <View>
            <View className="mt-2 mb-4 p-5 bg-zinc-50 rounded-2xl">
              <Text className="text-sm text-zinc-400 mb-1">Total value</Text>
              <AnimatedAmount value={data.totalValue} />
              <PortfolioChart data={data.chartData} />
              <PeriodSelector selected={period} onSelect={handlePeriodSelect} />
            </View>
            <Text className="text-sm text-zinc-400 mb-1">Holdings</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-10">
            <Text className="text-zinc-400">No holdings yet</Text>
          </View>
        }
        ListFooterComponent={<View className="h-24" />}
      />

      <Fab
        onPress={() => {
          dispatch({ modal: 'holding', type: 'open' })
        }}
      />

      <HoldingModal
        visible={modal.active === 'holding'}
        holding={modal.editingHolding}
        onClose={() => {
          dispatch({ type: 'close' })
        }}
        onSave={handleSaveHolding}
        onDelete={handleDeleteHolding}
      />
      <PortfolioModal
        visible={modal.active === 'portfolio'}
        portfolios={portfolios}
        selectedId={selectedPortfolioId}
        onSelect={handleSelectPortfolio}
        onCreate={handleCreatePortfolio}
        onDelete={handleDeletePortfolio}
        onClose={() => {
          dispatch({ type: 'close' })
        }}
      />
    </View>
  )
}
