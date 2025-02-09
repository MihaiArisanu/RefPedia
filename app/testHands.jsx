import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import { theme } from '../constants/theme';

const image1 = require('../assets/images/testImg/1.jpg');
const image2 = require('../assets/images/testImg/2.jpg');
const image3 = require('../assets/images/testImg/3.jpg');

const initialQuestions = [
  {
    id: 1,
    image: image1,
    correctAnswer: 'time stop for a violation',
    options: ['time start', 'time stop for a violation', 'time stop for a foult', 'the number of free trows'],
  },
  {
    id: 2,
    image: image2,
    correctAnswer: 'time stop for a foult',
    options: ['time start', 'time stop for a violation', 'time stop for a foult', 'disqualifying foult'],
  },
  {
    id: 3,
    image: image3,
    correctAnswer: 'time start',
    options: ['time start', 'time stop for a violation', 'time stop for a foult', 'out of bounds'],
  },
];

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const TestHands = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [isRetryingIncorrectAnswers, setIsRetryingIncorrectAnswers] = useState(false);
  const [retryIndex, setRetryIndex] = useState(0);
  const [isTestFinished, setIsTestFinished] = useState(false);

  useEffect(() => {
    setQuestions(shuffleArray([...initialQuestions])); // Amestecăm întrebările la început
  }, []);

  useEffect(() => {
    if (isRetryingIncorrectAnswers && retryIndex >= incorrectAnswers.length) {
      setIsTestFinished(true);
    }
  }, [retryIndex, incorrectAnswers.length, isRetryingIncorrectAnswers]);

  const handleAnswer = (answer) => {
    if (isTestFinished) return;

    const currentQuestion = isRetryingIncorrectAnswers ? incorrectAnswers[retryIndex] : questions[currentQuestionIndex];
    let newIncorrectAnswers = incorrectAnswers;

    if (answer === currentQuestion.correctAnswer) {
      Alert.alert('Correct!', 'Good job!', [{ text: 'OK' }]);
    } else {
      Alert.alert('Incorrect!', 'Try again!', [{ text: 'OK' }]);
      newIncorrectAnswers = [...incorrectAnswers, currentQuestion];
      setIncorrectAnswers(newIncorrectAnswers);
    }

    setTimeout(() => {
      if (!isRetryingIncorrectAnswers) {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else if (newIncorrectAnswers.length > 0) {
          setIsRetryingIncorrectAnswers(true);
          setRetryIndex(0);
        } else {
          setIsTestFinished(true);
        }
      } else {
        if (retryIndex < newIncorrectAnswers.length - 1) {
          setRetryIndex(retryIndex + 1);
        } else {
          setIsTestFinished(true);
        }
      }
    }, 1000);
  };

  const resetTest = () => {
    setQuestions(shuffleArray([...initialQuestions]));
    setCurrentQuestionIndex(0);
    setIncorrectAnswers([]);
    setIsRetryingIncorrectAnswers(false);
    setRetryIndex(0);
    setIsTestFinished(false);
  };

  if (isTestFinished) {
    return (
      <ScreenWrapper>
        <BackButton />
        <View style={styles.finalScreen}>
          <Text style={styles.congratsText}>Congratulations! You have completed the test!</Text>
          <TouchableOpacity style={styles.restartButton} onPress={resetTest}>
            <Text style={styles.restartText}>Restart Test</Text>
          </TouchableOpacity>
        </View>
      </ScreenWrapper>
    );
  }
  
  if (questions.length === 0) {
    return (
      <ScreenWrapper>
        <BackButton />
        <View style={styles.loadingScreen}>
          <Text style={styles.loadingText}>Loading questions...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const currentQuestion = isRetryingIncorrectAnswers ? incorrectAnswers[retryIndex] : questions[currentQuestionIndex];

  return (
    <ScreenWrapper>
      <BackButton />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          <Text style={styles.questionText}>What does this image show?</Text>
          
          {currentQuestion.image ? (
            <Image source={currentQuestion.image} style={styles.image} />
          ) : (
            <Text style={styles.errorText}>Image not found</Text>
          )}

          <Text style={styles.answerText}>Choose the correct answer:</Text>

          <View style={styles.optionsContainer}>
            {currentQuestion.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.optionButton, { backgroundColor: theme.colors.primary }]}
                onPress={() => handleAnswer(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    alignItems: 'center',
  },
  finalScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  questionText: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  answerText: {
    fontSize: 18,
    marginBottom: 10,
  },
  image: {
    width: 380,
    height: 420,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    width: '80%',
  },
  optionButton: {
    width: '45%',
    height: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 10,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  congratsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  restartButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  restartText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TestHands;