import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import ButtonC from '../components/ButtonC';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '../constants/theme';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { hp, wp } from '../constants/common';

const Practice = () => {
  const [facing, setFacing] = useState('front');
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [tempPhotos, setTempPhotos] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [isTakingPicture, setIsTakingPicture] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timer, setTimer] = useState(1);
  const [taskIndex, setTaskIndex] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [poze, setPoze] = useState([]);
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(1);
  const [photoIndex, setPhotoIndex] = useState(0);
  const maxPhotos = parseInt(poze[taskIndex] || '0', 10);
  const [showBravoMessage, setShowBravoMessage] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [noMoreTasks, setNoMoreTasks] = useState(false);

  useEffect(() => {
    fetchTaskAndPoses();
  }, []);

  const fetchTaskAndPoses = async () => {
    try {
      const docs = await getDocs(collection(db, 'camera'));
      const fetchedTasks = [];
      const fetchedPoses = [];
      
      docs.forEach((doc) => {
        if (doc.data().task) {
          fetchedTasks.push(doc.data().task);
        }
        if (doc.data().poze) {
          fetchedPoses.push(doc.data().poze);
        }
      });
      
      setTasks(fetchedTasks);
      setPoze(fetchedPoses);
    } catch (error) {
      console.error('Error fetching data from Firebase:', error);
    }
  };

  const handleNextTask = () => {
    if (taskIndex < tasks.length - 1) {
      setTaskIndex((prevIndex) => prevIndex + 1);
      setTempPhotos([]);
      setPhotos([]);
      setSlideshowIndex(0);
      setShowBravoMessage(false);
      setPhotoIndex(0); 
      setCurrentPhotoIndex(1);
    } else {
      setShowBravoMessage(false);
      setNoMoreTasks(true);
    }
  };
  
  const handleRepeatPractice = () => {
    setTaskIndex(0);
    setTempPhotos([]);
    setPhotos([]);
    setSlideshowIndex(0);
    setShowBravoMessage(false);
    setPhotoIndex(0);
    setCurrentPhotoIndex(1);
    setNoMoreTasks(false);
    fetchTaskAndPoses();
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const takePicture = async () => {
    setIsTakingPicture(true);
    setShowTimer(true);
    setPhotoCaptured(false);
    setIsTimerRunning(true);  
    setCurrentPhotoIndex(photoIndex);

    let i = photoIndex;

    const intervalId = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 1) {
          capturePhoto(i); 
          setShowTimer(false);
          setIsTimerRunning(false);
          clearInterval(intervalId);
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

  const capturePhoto = async (index) => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      setTempPhotos((prevPhotos) => {
        const newPhotos = [...prevPhotos, { uri: photo.uri, mirrored: facing === 'front', id: index }];
        setCurrentPhotoIndex(newPhotos.length);
        return newPhotos;
      });
      setPhotoCaptured(true);
      setPhotoIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handleOkPress = () => {
    setPhotos((prevPhotos) => [...prevPhotos, ...tempPhotos]);
    setTempPhotos([]);
    setCurrentPhotoIndex(1);
    setIsTakingPicture(false);
    setTimer(1);
    setIsTimerRunning(false);
    setPhotoCaptured(false);
    if(photoIndex === maxPhotos){
      setShowBravoMessage(true);
      setSlideshowIndex(0);
      startSlideshow();
    }
  };

  const handleRedoPress = () => {
    setIsTakingPicture(false);
    setTempPhotos([]);
    setCurrentPhotoIndex(1);
    setPhotoIndex((prevIndex) => prevIndex - 1);
    setShowTimer(false);
    setPhotoCaptured(false);
    setIsTimerRunning(false);
    setTimer(1);
};

  const startSlideshow = () => {
    const interval = setInterval(() => {
      setSlideshowIndex((prevIndex) => (prevIndex + 1) % (photos.length + 1));
    }, 1000);

    return interval;
  };

  if (!permission) {
    return null;
  }
  
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionMessage}>We need your permission to show the camera</Text>
        <ButtonC title="Grant Permission" onPress={requestPermission} />
      </View>
    );
  }

  const currentTask = tasks[taskIndex];
  const currentPoses = poze[taskIndex] || []; 

  return (
    <ScreenWrapper>
      <BackButton />
      <View style={styles.container}>
        {noMoreTasks ? (
          <View style={styles.finalScreen}>
            <Text style={styles.noMoreTasksText}>No more tasks left</Text>
            <ButtonC
              title="Repeat the practice"
              onPress={handleRepeatPractice}
              buttonStyle={styles.restartButton}
            />
          </View>
        ) : (
          <>
            {showBravoMessage ? (
              <>
                {currentTask && (
                  <Text style={styles.headerText}>{currentTask}</Text>
                )}
                {photos.length > 0 && (
                  <Image
                    source={{ uri: photos[slideshowIndex]?.uri }}
                    style={[
                      styles.fullScreenImage,
                      photos[slideshowIndex]?.mirrored && { transform: [{ scaleX: -1 }] },
                    ]}
                  />
                )}
                <View style={{ paddingVertical: 10 }}></View>
                <ButtonC title="Next" onPress={handleNextTask} buttonStyle={[styles.button, { width: '60%' }]} />
              </>
            ) : (
              <>
                {currentTask && (
                  <Text style={styles.headerText}>
                    {currentTask}
                  </Text>
                )}
                <View style={styles.pozeContainer}>
                  {currentPoses.length > 0 && (
                    <Text style={styles.indexText}>
                      ({currentPoses[taskIndex]} Photos)
                    </Text>
                  )}
                </View>
                {tempPhotos.length > 0 ? (
                  <>
                    <Text style={styles.indexText}>Photo {photoIndex} of {maxPhotos}</Text>
                    <Image
                      source={{ uri: tempPhotos[currentPhotoIndex - 1]?.uri }}
                      style={[
                        styles.fullScreenImage,
                        tempPhotos[currentPhotoIndex - 1]?.mirrored && { transform: [{ scaleX: -1 }] },
                      ]}
                    />
                  </>
                ) : (
                  <CameraView style={styles.camera} facing={facing} ref={cameraRef} />
                )}
                <View style={styles.buttonContainer}>
                  {!isTimerRunning ? (
                    <>
                      {tempPhotos.length === 0 && (
                        <>
                          <ButtonC title="Flip Camera" onPress={toggleCameraFacing} buttonStyle={styles.button} />
                          <ButtonC title="Take Picture" onPress={takePicture} buttonStyle={styles.button} />
                        </>
                      )}
                      {tempPhotos.length > 0 && (
                        <>
                          <ButtonC title="OK" onPress={handleOkPress} buttonStyle={styles.button} />
                          <ButtonC title="Redo" onPress={handleRedoPress} buttonStyle={styles.button} />
                        </>
                      )}
                    </>
                  ) : null}
                  {showTimer && <Text style={styles.timer}>{timer}</Text>}
                </View>
              </>
            )}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  headerText: {
    fontSize: wp(5),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 0,
  },
  pozeContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  indexText: {
    fontSize: wp(4),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: hp(2),
    color: theme.colors.primary,
  },
  camera: {
    width: wp(90),
    height: hp(65),
    borderRadius: wp(2.5),
    overflow: 'hidden',
  },
  fullScreenImage: {
    width: wp(90),
    height: hp(65),
    resizeMode: 'cover',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: wp(100),
    paddingVertical: hp(2.5),
    position: 'absolute',
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  button: {
    width: wp(30),
  },
  timer: {
    fontSize: wp(5),
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  message: {
    fontSize: wp(4),
    textAlign: 'center',
    marginBottom: 0,
  },
  finalScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wp(5),
  },
  noMoreTasksText: {
    fontSize: wp(7),
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: hp(2.5),
  },
  restartButton: {
    width: wp(60),
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1),
    borderRadius: wp(2),
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  permissionMessage: {
    fontSize: wp(4.5),
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: hp(2),
  },
  restartText: {
    fontSize: wp(5),
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Practice;