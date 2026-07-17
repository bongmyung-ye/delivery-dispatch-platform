import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RiderHomeScreen } from './src/screens/RiderHomeScreen';
import { colors } from './src/theme/tokens';

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={colors.background}
        barStyle="dark-content"
      />
      <RiderHomeScreen />
    </SafeAreaProvider>
  );
}

export default App;