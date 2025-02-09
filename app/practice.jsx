import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Camera } from 'expo-camera';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';

const Practice = () => {
  const [hasPermission, setHasPermission] = useState(null);

  useEffect(() => {
    const getPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getPermissions();
  }, []);

  if (hasPermission === null) {
    return <Text>Verific permisiunile...</Text>;
  }

  if (hasPermission === false) {
    return (
      <ScreenWrapper>
        <BackButton />
        <Text>Nu ai permisiunea de a folosi camera.</Text>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <BackButton />
      <View style={styles.cameraContainer}>
        <Camera style={styles.camera} type={Camera.Constants.Type.back} />
        <TouchableOpacity
          style={styles.captureButton}
          onPress={() => console.log('Capture photo action')}
        >
          <Text style={styles.captureText}>Take Picture</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  camera: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  captureButton: {
    position: 'absolute',
    bottom: 30,
    left: '50%',
    transform: [{ translateX: -30 }],
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    alignItems: 'center',
  },
  captureText: {
    fontSize: 18,
    color: 'black',
  },
});

export default Practice;