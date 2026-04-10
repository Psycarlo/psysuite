import { Plus } from 'lucide-react-native'
import { Pressable } from 'react-native'

interface FabProps {
  onPress: () => void
}

export const Fab = ({ onPress }: FabProps) => (
  <Pressable
    onPress={onPress}
    className="absolute bottom-8 right-6 w-14 h-14 rounded-full bg-black items-center justify-center shadow-lg"
  >
    <Plus size={24} color="#fff" />
  </Pressable>
)
