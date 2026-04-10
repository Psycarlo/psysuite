import { useEffect } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

interface AnimatedAmountProps {
  value: number
}

const styles = StyleSheet.create({
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#000',
    padding: 0,
    marginBottom: 16
  }
})

export const AnimatedAmount = ({ value }: AnimatedAmountProps) => {
  const animatedValue = useSharedValue(0)

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 600 })
  }, [value])

  const animatedProps = useAnimatedProps(() => {
    const formatted = `$${animatedValue.value.toFixed(2)}`
    return { text: formatted, defaultValue: formatted }
  })

  return (
    <AnimatedTextInput
      editable={false}
      style={styles.text}
      animatedProps={animatedProps}
    />
  )
}
