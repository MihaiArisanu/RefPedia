import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, TouchableOpacity, Pressable } from 'react-native';
import { Video } from 'expo-av';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Input from '../components/Input';
import ButtonC from '../components/ButtonC';
import { theme } from '../constants/theme';
import levenshtein from 'fast-levenshtein';

const Learn = () => {
  const [userAnswer, setUserAnswer] = useState('');
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [typoError, setTypoError] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState(false);
  const videoRef = useRef(null);

  const allVideos = {
    "Travel": [
      { title: "Travel 1", url: require('../assets/VideosRef/Travel/Traveling1.mp4'), correctAnswer: "Travel", explain: "Traveling occurs when a player holding the ball moves one or both feet illegally." },
    ],
    "Foult": [
      { title: "Foult 1", url: require('../assets/VideosRef/Foult/Foult1.mp4'), correctAnswer: "Blocking", explain: "A blocking foul occurs when the defender does not establish a legal guarding position in time." },
      { title: "Foult 2", url: require('../assets/VideosRef/Foult/Foult2.mp4'), correctAnswer: "Illegal Use of Hands", explain: "This foul happens when a player uses their hands illegally to impede an opponent's movement." },
    ],
    "Block-Charge": [
      { title: "Block-Charge 1", url: require('../assets/VideosRef/Block-Charge/Block-Charge1.mp4'), correctAnswer: "Blocking foult", explain: "A blocking foul is called when a defender does not establish position before contact." }
    ]
  };

  const categories = ["All", ...Object.keys(allVideos)];

  const videoSources = selectedCategories.includes("All")
    ? Object.values(allVideos).flat()
    : selectedCategories.flatMap(category => allVideos[category]);

  const toggleCategorySelection = (category) => {
    setSelectedCategories(prevSelected => {
      if (category === "All") {
        return prevSelected.includes("All") ? [] : ["All"];
      }

      const newSelection = prevSelected.includes(category)
        ? prevSelected.filter(cat => cat !== category)
        : [...prevSelected.filter(cat => cat !== "All"), category];

      return newSelection.length === 0 ? ["All"] : newSelection;
    });

    setCurrentVideoIndex(0);
    setUserAnswer('');
    setShowExplanation(false);
    setTypoError(false);
    setCorrectAnswer(false);
  };

  const checkAnswer = () => {
    const currentVideo = videoSources[currentVideoIndex];
    if (!currentVideo) return;

    const correctAnswerText = currentVideo.correctAnswer.trim().toLowerCase();
    let userInput = userAnswer.trim().toLowerCase();

    const distance = levenshtein.get(userInput, correctAnswerText);

    if (distance === 0) {
      setUserAnswer(correctAnswerText);
      setShowExplanation(false);
      setTypoError(false);
      setCorrectAnswer(true);
    } else if (distance <= 2) {
      setTypoError(true);
      setUserAnswer(correctAnswerText);
      setShowExplanation(true); 
      setCorrectAnswer(false);
    } else {
      setTypoError(false);
      setShowExplanation(true);
      setCorrectAnswer(false);      
    }
  };

  const goToNextVideo = () => {
    if (currentVideoIndex < videoSources.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setUserAnswer('');
      setShowExplanation(false);
      setTypoError(false);
      setCorrectAnswer(false);
    } else {
      Alert.alert("Congratulations", "You have completed all the lessons!");
    }
  };

  const showExplanationHandler = () => {
    const currentVideo = videoSources[currentVideoIndex];
    if (currentVideo) {
      Alert.alert("Explanation", currentVideo.explain);
    }
  };

  const redoHandler = async () => {
    setUserAnswer('');
    setShowExplanation(false);
    setTypoError(false);
    setCorrectAnswer(false);
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(0);
    }
  };

  return (
    <ScreenWrapper style={styles.wrapper}>
      <View style={styles.header}>
        <BackButton />
      </View>

      <View style={styles.filterContainer}>
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.filterButton, 
              selectedCategories.includes(category) && styles.activeFilter
            ]}
            onPress={() => toggleCategorySelection(category)}
          >
            <Text style={[
              styles.filterText, 
              selectedCategories.includes(category) && styles.activeFilterText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {videoSources.length === 0 ? (
          <View style={styles.endMessageContainer}>
            <Text style={styles.endMessageText}>No videos available in this category.</Text>
          </View>
        ) : (
          <>
            {typoError && (
              <View style={styles.typoErrorContainer}>
                <Text style={styles.typoErrorText}>You made a typo error, but your answer is good.</Text>
              </View>
            )}

            {showExplanation && !typoError && !correctAnswer && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Incorrect answer! Try again.</Text>
                <Pressable style={styles.icon} onPress={showExplanationHandler}>
                  <Icon name="help" size={26} strokeWidth={1.6} />
                </Pressable>
                <Pressable style={styles.icon} onPress={redoHandler}>
                  <Icon name="redo" size={26} strokeWidth={1.6} />
                </Pressable>
              </View>
            )}

            {correctAnswer && (
              <View style={styles.correctAnswerContainer}>
                <Text style={styles.correctAnswerText}>Congratulations! Correct answer.</Text>
              </View>
            )}

            <View style={styles.videoContainer}>
              <Video
                ref={videoRef}
                source={videoSources[currentVideoIndex]?.url}
                style={styles.video}
                useNativeControls
                resizeMode="contain"
                isLooping={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Input
                placeholder="Enter the answer"
                value={userAnswer}
                onChangeText={setUserAnswer}
                editable={!showExplanation}
              />
              <View style={styles.buttonContainer}>
                <ButtonC
                  title={showExplanation || typoError || correctAnswer ? "OK" : "Check the answer"}
                  onPress={showExplanation || typoError || correctAnswer ? goToNextVideo : checkAnswer}
                  style={styles.checkButton}
                />
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
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap'
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 5,
    marginVertical: 5
  },
  activeFilter: {
    backgroundColor: theme.colors.primary
  },
  filterText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000'
  },
  activeFilterText: {
    color: '#FFFFFF'
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
  video: {
    width: '90%',
    height: 250
  },
  inputContainer: {
    width: '90%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    marginTop: 10,
    width: '100%'
  },
  checkButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center'
  },
  typoErrorContainer: {
    backgroundColor: 'yellow',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
  },
  typoErrorText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    width: '90%',
    justifyContent: 'center'
  },
  errorText: {
    color: 'red', 
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10
  },
  icon: {
    marginHorizontal: 5
  },
  correctAnswerContainer: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    width: '90%',
    alignItems: 'center',
  },
  correctAnswerText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: 'bold',
  },
});