import { useFont } from '@shopify/react-native-skia'
import type { DataSourceParam } from '@shopify/react-native-skia'
import { View } from 'react-native'
import { Bar, CartesianChart } from 'victory-native'

import { formatYLabel } from '@/lib/chart-data'
import type { ChartPoint } from '@/lib/chart-data'

// oxlint-disable-next-line unicorn/prefer-module, typescript-eslint/no-unsafe-assignment
const fontFile: DataSourceParam = require('../../assets/fonts/InterTight-Medium.ttf')

interface SpendingChartProps {
  data: ChartPoint[]
}

export const SpendingChart = ({ data }: SpendingChartProps) => {
  const font = useFont(fontFile, 12)

  if (data.length === 0) {
    return <View className="h-44" />
  }

  return (
    <View className="h-44">
      <CartesianChart
        data={data}
        xKey="label"
        yKeys={['amount']}
        domainPadding={{ left: 30, right: 30 }}
        axisOptions={{
          axisSide: { x: 'bottom', y: 'right' },
          font,
          formatYLabel,
          labelColor: '#a1a1aa',
          lineColor: '#e4e4e7',
          tickCount: { x: data.length, y: 5 }
        }}
        frame={{ lineColor: 'transparent' }}
      >
        {({ points, chartBounds }) => (
          <Bar
            points={points.amount}
            chartBounds={chartBounds}
            color="#000"
            roundedCorners={{ topLeft: 4, topRight: 4 }}
            innerPadding={0.35}
          />
        )}
      </CartesianChart>
    </View>
  )
}
