import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CardStyleInterpolators } from '@react-navigation/stack';
import { AuthProvider } from './src/context/AuthContext';

import LoginScreen from './src/screens/Login';
import HomeScreen from './src/screens/Home';
import BookingScreen from './src/screens/Booking';
import ReportScreen from './src/screens/Report';
import ProfileScreen from './src/screens/Profile';
import LocationScreen from './src/screens/Location';

import { enableScreens } from 'react-native-screens';

enableScreens();

const Stack = createNativeStackNavigator();

function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ animation: 'none' }}>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Booking" component={BookingScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Report" component={ReportScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Location" component={LocationScreen} options={{ headerShown: false }}/>
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}

export default App;
