import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import { apiService } from '../services/api';

export default function TimeOutScreen() {
  const navigation = useNavigation();
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleCapture = async () => {
    if (Platform.OS === 'web') {
      handlePickImage();
      return;
    }

    if (!cameraRef) {
      Alert.alert('Error', 'Camera not ready');
      return;
    }

    try {
      setIsLoading(true);
      const photo = await cameraRef.takePictureAsync({
        quality: 0.7,
        base64: false,
      });

      if (photo) {
        await submitTimeOut(photo.uri);
      }
    } catch (error) {
      console.error('Capture error:', error);
      Alert.alert('Error', 'Failed to capture photo');
      setIsLoading(false);
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images' as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        setIsLoading(true);
        await submitTimeOut(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const submitTimeOut = async (uri: string) => {
    try {
      let photo: any;
      
      if (Platform.OS === 'web') {
        // On web, convert the URI to a Blob
        const response = await fetch(uri);
        const blob = await response.blob();
        photo = new File([blob], `time_out_${Date.now()}.jpg`, { type: 'image/jpeg' });
      } else {
        // On native, use the standard format
        photo = {
          uri,
          type: 'image/jpeg',
          name: `time_out_${Date.now()}.jpg`,
        };
      }

      await apiService.timeOut(photo);
      
      Alert.alert(
        'Success',
        'Time out recorded successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to record time out');
    } finally {
      setIsLoading(false);
    }
  };

  if (Platform.OS !== 'web' && !permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (Platform.OS !== 'web' && !permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webContainer}>
          <Text style={styles.title}>Time Out</Text>
          <Text style={styles.subtitle}>Select a photo to record your time out</Text>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handlePickImage}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Select Photo</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            Note: Camera preview is only available on mobile devices
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera}
        facing="front"
        ref={(ref) => setCameraRef(ref)}
      >
        <View style={styles.overlay}>
          <View style={styles.topBar}>
            <Text style={styles.instructionText}>Position your face in the frame</Text>
          </View>

          <View style={styles.bottomBar}>
            <TouchableOpacity 
              style={[styles.captureButton, isLoading && styles.captureButtonDisabled]}
              onPress={handleCapture}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="large" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
  },
  topBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomBar: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 30,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#dc3545',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dc3545',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  permissionText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  note: {
    fontSize: 14,
    color: '#999',
    marginTop: 20,
    textAlign: 'center',
  },
});
