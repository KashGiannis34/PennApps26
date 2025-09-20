import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import AnalysisScreen from './src/screens/AnalysisScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import VisualizationScreen from './src/screens/VisualizationScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2d5a27',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: '🌱 Room Sustainability Analyzer' }}
        />
        <Stack.Screen 
          name="Camera" 
          component={CameraScreen} 
          options={{ title: '📸 Capture Room' }}
        />
        <Stack.Screen 
          name="Analysis" 
          component={AnalysisScreen} 
          options={{ title: '🤖 AI Analysis' }}
        />
        <Stack.Screen 
          name="Products" 
          component={ProductsScreen} 
          options={{ title: '🛒 Sustainable Products' }}
        />
        <Stack.Screen 
          name="Visualization" 
          component={VisualizationScreen} 
          options={{ title: '🎨 Room Visualization' }}
        />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}