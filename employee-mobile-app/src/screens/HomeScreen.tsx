import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { MainStackParamList } from '../navigation/types';
import { apiService } from '../services/api';
import { authService } from '../services/auth';
import { TimeLog } from '../types';

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<MainStackParamList, 'Home'>;
  onLogout: () => void;
};

export default function HomeScreen({ navigation, onLogout }: HomeScreenProps) {
  const [todayLog, setTodayLog] = useState<TimeLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    loadUserData();
  }, []);

  // Reload today's log when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTodayLog();
    }, [])
  );

  const loadUserData = async () => {
    const user = await authService.getUser();
    if (user) {
      setUserName(user.full_name);
    }
  };

  const loadTodayLog = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const logs = await apiService.getMyLogs(today, today, 1, 0);
      setTodayLog(logs.length > 0 ? logs[0] : null);
    } catch (error: any) {
      console.error('Failed to load today log:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
      // On web, use window.confirm instead of Alert
      if (window.confirm('Are you sure you want to logout?')) {
        await authService.clearAuth();
        onLogout();
      }
    } else {
      Alert.alert('Logout', 'Are you sure you want to logout?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await authService.clearAuth();
            onLogout();
          },
        },
      ]);
    }
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '--:--';
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatHours = (hours: number | null) => {
    if (hours === null) return '--';
    return hours.toFixed(2);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'incomplete': return '#FF9800';
      case 'missing': return '#F44336';
      default: return '#999';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const hasTimeIn = todayLog && todayLog.time_in;
  const hasTimeOut = todayLog && todayLog.time_out;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {userName}</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateCard}>
        <Text style={styles.dateText}>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>Today's Status</Text>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Time In:</Text>
          <Text style={styles.statusValue}>{formatTime(todayLog?.time_in || null)}</Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Time Out:</Text>
          <Text style={styles.statusValue}>{formatTime(todayLog?.time_out || null)}</Text>
        </View>
        
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Total Hours:</Text>
          <Text style={styles.statusValue}>{formatHours(todayLog?.total_hours || null)}</Text>
        </View>
        
        {todayLog && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(todayLog.status) }]}>
            <Text style={styles.statusBadgeText}>{todayLog.status.toUpperCase()}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.timeInButton, hasTimeIn && styles.buttonDisabled]}
          onPress={() => navigation.navigate('TimeIn')}
          disabled={hasTimeIn}
        >
          <Text style={styles.actionButtonText}>Time In</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.timeOutButton, (!hasTimeIn || hasTimeOut) && styles.buttonDisabled]}
          onPress={() => navigation.navigate('TimeOut')}
          disabled={!hasTimeIn || hasTimeOut}
        >
          <Text style={styles.actionButtonText}>Time Out</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.historyButton}
        onPress={() => navigation.navigate('History')}
      >
        <Text style={styles.historyButtonText}>View History</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutText: {
    color: '#007AFF',
    fontSize: 16,
  },
  dateCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#666',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    marginTop: 15,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  statusBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  timeInButton: {
    backgroundColor: '#4CAF50',
  },
  timeOutButton: {
    backgroundColor: '#F44336',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  historyButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  historyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
