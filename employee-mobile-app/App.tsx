import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import ChangePasswordScreen from './src/screens/ChangePasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import TimeInScreen from './src/screens/TimeInScreen';
import TimeOutScreen from './src/screens/TimeOutScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import { authService } from './src/services/auth';

const Stack = createNativeStackNavigator();

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    setIsLoading(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handlePasswordChanged = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            <>
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />}
              </Stack.Screen>
              <Stack.Screen name="ChangePassword">
                {(props) => <ChangePasswordScreen {...props} onPasswordChanged={handlePasswordChanged} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen 
                name="Home" 
                options={{ headerShown: true, title: 'Time & Attendance' }}
              >
                {(props) => <HomeScreen {...props} onLogout={handleLogout} />}
              </Stack.Screen>
              <Stack.Screen 
                name="TimeIn" 
                component={TimeInScreen}
                options={{ headerShown: true, title: 'Time In' }}
              />
              <Stack.Screen 
                name="TimeOut" 
                component={TimeOutScreen}
                options={{ headerShown: true, title: 'Time Out' }}
              />
              <Stack.Screen 
                name="History" 
                component={HistoryScreen}
                options={{ headerShown: true, title: 'Attendance History' }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
