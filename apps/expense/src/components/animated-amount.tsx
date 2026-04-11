import { useEffect } from 'react'
import { StyleSheet, TextInput } from 'react-native'
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming
} from 'react-native-reanimated'

// oxlint-disable-next-line import/no-named-as-default-member
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

interface AnimatedAmountProps {
  value: number
}

const styles = StyleSheet.create({
  text: {
    color: '#000',
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 0
  }
})

export const AnimatedAmount = ({ value }: AnimatedAmountProps) => {
  const animatedValue = useSharedValue(0)

  useEffect(() => {
    animatedValue.value = withTiming(value, { duration: 600 })
  }, [value, animatedValue])

  const animatedProps = useAnimatedProps(() => {
    const formatted = `$${animatedValue.value.toFixed(2)}`
    return { defaultValue: formatted, text: formatted }
  })

  return (
    <AnimatedTextInput
      editable={false}
      style={styles.text}
      animatedProps={animatedProps}
    />
  )
}
