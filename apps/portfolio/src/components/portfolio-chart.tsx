import { useFont } from '@shopify/react-native-skia'
import type { DataSourceParam } from '@shopify/react-native-skia'
import { View } from 'react-native'
import { Area, CartesianChart, Line } from 'victory-native'

import { formatYLabel } from '@/lib/chart-data'
import type { ChartPoint } from '@/lib/chart-data'

// oxlint-disable-next-line unicorn/prefer-module, typescript-eslint/no-unsafe-assignment
const fontFile: DataSourceParam = require('../../assets/fonts/InterTight-Medium.ttf')

interface PortfolioChartProps {
  data: ChartPoint[]
}

export const PortfolioChart = ({ data }: PortfolioChartProps) => {
  const font = useFont(fontFile, 12)

  if (data.length === 0) {
    return <View className="h-44" />
  }

  const values = data.map((d) => d.value)
  const maxValue = Math.max(...values)
  const minValue = Math.min(...values)
  const padding = (maxValue - minValue) * 0.1 || maxValue * 0.1 || 1

  const tickStep = Math.max(1, Math.floor(data.length / 5))

  return (
    <View className="h-44">
      <CartesianChart
        data={data}
        xKey="timestamp"
        yKeys={['value']}
        domain={{ y: [Math.max(0, minValue - padding), maxValue + padding] }}
        domainPadding={{ left: 0, right: 0 }}
        xAxis={{
          font,
          formatXLabel: (value) => {
            const index = data.findIndex((d) => d.timestamp === value)
            if (index === -1 || index % tickStep !== 0) {
              return ''
            }
            return data[index]?.label ?? ''
          },
          labelColor: '#a1a1aa',
          lineColor: '#e4e4e7'
        }}
        yAxis={[
          {
            axisSide: 'right',
            font,
            formatYLabel,
            labelColor: '#a1a1aa',
            lineColor: '#e4e4e7'
          }
        ]}
        frame={{ lineColor: 'transparent' }}
      >
        {({ points, chartBounds }) => (
          <>
            <Area
              points={points.value}
              y0={chartBounds.bottom}
              color="rgba(0,0,0,0.08)"
              curveType="natural"
              animate={{ duration: 400, type: 'timing' }}
            />
            <Line
              points={points.value}
              color="#000"
              strokeWidth={2}
              curveType="natural"
              animate={{ duration: 400, type: 'timing' }}
            />
          </>
        )}
      </CartesianChart>
    </View>
  )
}
