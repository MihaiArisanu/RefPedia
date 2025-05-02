import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Pressable } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Icon from '../assets/icons';
import ButtonC from '../components/ButtonC';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { theme } from '../constants/theme';
import { hp, wp } from '../constants/common';

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const Theoretical = () => {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mode, setMode] = useState(null);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [timeExpired, setTimeExpired] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const fetchData = async () => {
    const docs = await getDocs(collection(db, 'enunturi'));
    let fetchedQuestions = docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    fetchedQuestions = shuffleArray(fetchedQuestions);
    setQuestions(fetchedQuestions);
  };

  useEffect(() => {
    fetchData().catch(console.error);

    const checkRole = async () => {
      const user = auth.currentUser;
      if (!user) return;
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach((doc) => {
        if (doc.id === user.uid && doc.data().role === 'admin') {
          setIsAdmin(true);
        }
      });
    };

    checkRole();
  }, []);

  useEffect(() => {
    if (mode === 'exam' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setTimeExpired(true);
      setIsFinished(true);
    }
  }, [mode, timeLeft]);

  const handleAnswer = (userAnswer) => {
    if (questions.length === 0 || isFinished || selectedAnswer !== null) return;

    const currentQuestion = questions[currentIndex];

    setSelectedAnswer(userAnswer);

    if (userAnswer === currentQuestion.raspuns) {
      setScore(prevScore => prevScore + 1);
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        setIsFinished(true);
      }
      setSelectedAnswer(null);
    }, 1000);
  };

  const resetQuiz = () => {
    setQuestions(shuffleArray([...questions]));
    setCurrentIndex(0);
    setScore(0);
    setIsFinished(false);
    setSelectedAnswer(null);
    setTimeExpired(false);
    if (mode === 'exam') {
      setTimeLeft(1800);
    }
  };

  const handleAddQuestion = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    try {
      await addDoc(collection(db, 'enunturi'), {
        enunt: newQuestion.trim(),
        raspuns: newAnswer === 'true'
      });
      setNewQuestion('');
      setNewAnswer('');
      setShowAddForm(false);
      await fetchData();
    } catch (err) {
      console.error('Error adding question:', err);
    }
  };

  if (!mode) {
    return (
      <ScreenWrapper>
        <View style={styles.headerRow}>
          <BackButton />
          {isAdmin && (
            <Pressable onPress={() => setShowAddForm(!showAddForm)}>
              <Icon name="plus" size={24} color={theme.colors.primary} />
            </Pressable>
          )}
        </View>

        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.input}
              placeholder="Question"
              value={newQuestion}
              onChangeText={setNewQuestion}
            />
            <TextInput
              style={styles.input}
              placeholder="Answer (true/false)"
              value={newAnswer}
              onChangeText={setNewAnswer}
            />
            <ButtonC title="Add Question" onPress={handleAddQuestion} />
          </View>
        )}

        <View style={styles.modeSelectionContainer}>
          <Text style={styles.title}>Select Mode:</Text>
          <ButtonC title="Practice" onPress={() => setMode('practice')} buttonStyle={styles.button} />
          <View style={{ height: hp(2) }} />
          <ButtonC title="Exam" onPress={() => setMode('exam')} buttonStyle={styles.button} />
        </View>
      </ScreenWrapper>
    );
  }

  if (isFinished) {
    const totalQuestions = questions.length;
    const percentage = (score / totalQuestions) * 100;
    const resultText = mode === 'exam' ? (percentage >= 80 ? 'Passed' : 'Failed') : 'You answered all the questions';

    return (
      <ScreenWrapper>
        <BackButton />
        <View style={styles.resultContainer}>
          {timeExpired && <Text style={[styles.resultText, { color: theme.colors.primary, textAlign: 'center' }]}>Time's up!</Text>}
          {mode === 'exam' && (
            <Text style={[styles.resultText, { color: theme.colors.primary, textAlign: 'center' }]}>Final Score: {score} / {totalQuestions}</Text>
          )}
          <Text style={[styles.resultText, { color: theme.colors.primary }]}>{resultText}</Text>
          <ButtonC title="Try Again" onPress={resetQuiz} buttonStyle={styles.tryAgainButton} />
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <BackButton />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.container}>
          {mode === 'exam' && (
            <>
              <Text style={styles.scoreText}>Score: {score} / {currentIndex}</Text>
              <Text style={styles.timerText}>Time Left: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</Text>
            </>
          )}
          <Text style={styles.questionText}>{questions[currentIndex]?.enunt}</Text>
          {selectedAnswer === null ? (
            <View style={styles.buttonContainer}>
              <ButtonC title="True" onPress={() => handleAnswer(true)} buttonStyle={styles.answerButton} />
              <ButtonC title="False" onPress={() => handleAnswer(false)} buttonStyle={styles.answerButton} />
            </View>
          ) : (
            <Text style={[styles.feedbackText, { color: theme.colors.primary }]}> 
              {selectedAnswer === questions[currentIndex].raspuns ? 'Correct!' : 'Incorrect!'}
            </Text>
          )}
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    marginTop: hp(2)
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    alignItems: 'center',
  },
  modeSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addForm: {
    paddingHorizontal: wp(5),
    marginTop: hp(2),
    gap: hp(1.25),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: wp(4),
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  feedbackText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    marginHorizontal: wp(3),
    width: '45%',
  },
  answerButton: {
    marginHorizontal: wp(1),
    width: '45%',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  timerText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  tryAgainButton: {
    marginTop: 20,
    width: '60%',
  },
});

export default Theoretical;
