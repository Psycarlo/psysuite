import { useFont } from '@shopify/react-native-skia'
import { View } from 'react-native'
import { Bar, CartesianChart } from 'victory-native'

// eslint-disable-next-line unicorn/prefer-module
const fontFile = require('../../assets/fonts/InterTight-Medium.ttf')

interface ChartPoint {
  label: string
  amount: number
  [key: string]: unknown
}

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
          font,
          labelColor: '#a1a1aa',
          lineColor: '#e4e4e7',
          tickCount: { x: data.length, y: 0 },
          axisSide: { x: 'bottom', y: 'left' }
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
