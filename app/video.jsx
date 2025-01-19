import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text } from 'react-native';
import { Video } from 'expo-av';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Input from '../components/Input';
import ButtonC from '../components/ButtonC';
import levenshtein from 'fast-levenshtein';

const Learn = () => {
  const [userAnswer, setUserAnswer] = useState('');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [lessonCounter, setLessonCounter] = useState(0);
  const videoRef = useRef(null);

  const videoSources = [
    { title: "Lesson 1", url: require('../assets/video/video1.mp4'), correctAnswer: "asfalt" },
    { title: "Lesson 2", url: require('../assets/video/videoTalent.mp4'), correctAnswer: "beton" },
  ];

  const checkAnswer = () => {
    const currentVideo = videoSources[currentVideoIndex];
    const correctAnswer = currentVideo.correctAnswer.toLowerCase();
    const userInput = userAnswer.trim().toLowerCase();

    if (userInput === correctAnswer) {
      Alert.alert("Răspuns corect", "Ai introdus răspunsul corect!");
      setLessonCounter(lessonCounter + 1);

      if (currentVideoIndex < videoSources.length - 1) {
        setCurrentVideoIndex(currentVideoIndex + 1);
        setUserAnswer('');
      } else {
        Alert.alert("Felicitări", "Ai terminat toate lecțiile!");
      }
    } else {
      const distance = levenshtein.get(userInput, correctAnswer);
      if (distance <= 2) {
        Alert.alert("Greșeală de tipar", "Ai făcut o greșeală de tipar.");
      } else {
        Alert.alert("Răspuns incorect", "Răspunsul nu este corect.");
      }
    }
  };

  const isLastLesson = lessonCounter === videoSources.length;

  return (
    <ScreenWrapper style={styles.wrapper}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {isLastLesson ? (
          <View style={styles.endMessageContainer}>
            <Text style={styles.endMessageText}>You have finished all the lessons!</Text>
            <ButtonC
              title="Replay Videos"
              onPress={() => {
                setLessonCounter(0);
                setCurrentVideoIndex(0);
                setUserAnswer('');
              }}
            />
          </View>
        ) : (
          <>
            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                source={videoSources[currentVideoIndex].url}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                isLooping={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Input
                placeholder="Introdu răspunsul"
                value={userAnswer}
                onChangeText={(value) => setUserAnswer(value)}
              />
              <View style={styles.buttonContainer}>
                <ButtonC title="Verifică răspunsul" onPress={checkAnswer} />
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Learn;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center' 
    },
  scrollContainer: { 
    padding: 10, 
    flexGrow: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  videoContainer: { 
    width: '100%', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 20 
  },
  video: { width: '90%', height: 250 },
  inputContainer: { 
    width: '90%', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  buttonContainer: { 
    marginTop: 10, 
    width: '100%' 
  },
  endMessageContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  endMessageText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000', 
    marginBottom: 20, 
    textAlign: 'center' 
  },
});