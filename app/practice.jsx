import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import ButtonC from '../components/ButtonC';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { theme } from '../constants/theme';

const Practice = () => {
  const [facing, setFacing] = useState('back');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [photo, setPhoto] = useState(null);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <ButtonC title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhoto(photo);
    }
  };

  const redoPicture = () => {
    setPhoto(null);
  };

  const mirrorImage = (uri) => {
    return { uri, transform: [{ scaleX: -1 }] };
  };

  return (
    <ScreenWrapper>
      <BackButton />
      <View style={styles.container}>
        {photo ? (
          <>
            <Image source={mirrorImage(photo.uri)} style={styles.preview} />
            <View style={styles.buttonContainer}>
              <ButtonC title="Redo" onPress={redoPicture} buttonStyle={styles.button} />
              <ButtonC title="OK" onPress={() => console.log('OK pressed')} buttonStyle={styles.button} />
            </View>
          </>
        ) : (
          <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
            <View style={styles.buttonContainer}>
              <ButtonC title="Flip Camera" onPress={toggleCameraFacing} buttonStyle={styles.button} />
              <ButtonC title="Take Picture" onPress={takePicture} buttonStyle={styles.button} />
            </View>
          </CameraView>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  button: {
    width: '45%',
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  preview: {
    flex: 1,
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ scaleX: -1 }],
  },
});

export default Practice;
  