import React, { useState, useRef } from 'react';
import { StyleSheet, View, ScrollView, Alert, Text, TouchableOpacity, Pressable } from 'react-native';
import { Video } from 'expo-av';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Input from '../components/Input';
import ButtonC from '../components/ButtonC';
import { theme } from '../constants/theme';
import levenshtein from 'fast-levenshtein';
import Icon from '../assets/icons';
import { hp, wp } from '../constants/common';

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
                placeholder="exemple: offensive foul, travel"
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
    paddingHorizontal: wp(5),
    paddingTop: hp(1.25)
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1.25),
    flexWrap: 'wrap'
  },
  filterButton: {
    paddingVertical: hp(1.25),
    paddingHorizontal: wp(3.75),
    borderRadius: wp(5),
    backgroundColor: '#E0E0E0',
    marginHorizontal: wp(1.25),
    marginVertical: hp(1.25)
  },
  activeFilter: {
    backgroundColor: theme.colors.primary
  },
  filterText: {
    fontSize: wp(3.5),
    fontWeight: 'bold',
    color: '#000'
  },
  activeFilterText: {
    color: '#FFFFFF'
  },
  scrollContainer: {
    padding: wp(2.5),
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  videoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hp(2.5)
  },
  video: {
    width: wp(90),
    height: hp(31.25)
  },
  inputContainer: {
    width: wp(90),
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    marginTop: hp(1.25),
    width: '100%'
  },
  checkButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.25),
    borderRadius: wp(2.5),
    alignItems: 'center'
  },
  typoErrorContainer: {
    backgroundColor: 'yellow',
    padding: hp(1.25),
    borderRadius: wp(1.25),
    marginBottom: hp(1.875),
    width: wp(90),
    alignItems: 'center',
  },
  typoErrorText: {
    fontSize: wp(4),
    color: '#000',
    fontWeight: 'bold',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1.875),
    width: wp(90),
    justifyContent: 'center'
  },
  errorText: {
    color: 'red', 
    fontSize: wp(4),
    fontWeight: 'bold',
    marginRight: wp(2.5)
  },
  icon: {
    marginHorizontal: wp(1.25)
  },
  correctAnswerContainer: {
    backgroundColor: 'green',
    padding: hp(1.25),
    borderRadius: wp(1.25),
    marginBottom: hp(1.875),
    width: wp(90),
    alignItems: 'center',
  },
  correctAnswerText: {
    fontSize: wp(4),
    color: '#FFF',
    fontWeight: 'bold',
  },
});
