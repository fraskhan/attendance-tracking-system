import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import HomeScreen from '../screens/HomeScreen';
import TimeInScreen from '../screens/TimeInScreen';
import TimeOutScreen from '../screens/TimeOutScreen';
import HistoryScreen from '../screens/HistoryScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Time & Attendance' }}
      />
      <Stack.Screen 
        name="TimeIn" 
        component={TimeInScreen}
        options={{ title: 'Time In' }}
      />
      <Stack.Screen 
        name="TimeOut" 
        component={TimeOutScreen}
        options={{ title: 'Time Out' }}
      />
      <Stack.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ title: 'Attendance History' }}
      />
    </Stack.Navigator>
  );
}
