import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, Alert } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import ButtonC from '../components/ButtonC';
import { db, auth } from '../lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
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
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');
  const [addError, setAddError] = useState('');
  const [editError, setEditError] = useState('');

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
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setAddError('Completează toate câmpurile.');
      return;
    }

    if (newAnswer !== 'true' && newAnswer !== 'false') {
      setAddError('Răspunsul trebuie să fie "true" sau "false".');
      return;
    }

    try {
      await addDoc(collection(db, 'enunturi'), {
        enunt: newQuestion.trim(),
        raspuns: newAnswer === 'true'
      });
      setNewQuestion('');
      setNewAnswer('');
      setAddError('');
      await fetchData();
    } catch (err) {
      console.error('Error adding question:', err);
      setAddError('A apărut o eroare la salvare.');
    }
  };

  const handleDeleteQuestion = async (id) => {
    Alert.alert('Confirmare', 'Ești sigur că vrei să ștergi această întrebare?', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge', style: 'destructive', onPress: async () => {
          try {
            await deleteDoc(doc(db, 'enunturi', id));
            await fetchData();
          } catch (err) {
            console.error('Error deleting question:', err);
          }
        }
      }
    ]);
  };

  const handleUpdateQuestion = async (id) => {
    if (!editedQuestion.trim() || !editedAnswer.trim()) {
      setEditError('Completează toate câmpurile.');
      return;
    }

    if (editedAnswer !== 'true' && editedAnswer !== 'false') {
      setEditError('The answer must be true or false.');
      return;
    }

    try {
      await updateDoc(doc(db, 'enunturi', id), {
        enunt: editedQuestion,
        raspuns: editedAnswer === 'true'
      });
      setEditingQuestionId(null);
      setEditError('');
      await fetchData();
    } catch (err) {
      console.error('Error updating question:', err);
      setEditError('A apărut o eroare la actualizare.');
    }
  };
  if (!mode) {
    return (
      <ScreenWrapper>
        <BackButton />
        <View style={styles.modeSelectionContainer}>
          <Text style={styles.title}>Select Mode:</Text>
          <ButtonC title="Practice" onPress={() => setMode('practice')} buttonStyle={styles.button} />
          <View style={{ height: hp(2) }} />
          <ButtonC title="Exam" onPress={() => setMode('exam')} buttonStyle={styles.button} />
          {isAdmin && (
            <>
              <View style={{ height: hp(2) }} />
              <ButtonC title="Add questions" onPress={() => setMode('add')} buttonStyle={styles.button} />
              <View style={{ height: hp(2) }} />
              <ButtonC title="View questions" onPress={() => setMode('view')} buttonStyle={styles.button} />
            </>
          )}
        </View>
      </ScreenWrapper>
    );
  }

  if (mode === 'add') {
    return (
      <ScreenWrapper>
        <BackButton onPress={() => setMode(null)} />
        <View style={styles.addForm}>
          <Text style={styles.title}>Add New Question</Text>
          <TextInput
            style={styles.input}
            placeholder="Question"
            value={newQuestion}
            onChangeText={setNewQuestion}
          />
          <TextInput
            style={styles.input}
            placeholder='Answer (true/false)'
            value={newAnswer}
            onChangeText={setNewAnswer}
          />
          {addError ? <Text style={styles.errorText}>{addError}</Text> : null}
          <ButtonC title="Save" onPress={handleAddQuestion} />
        </View>
      </ScreenWrapper>
    );
  }

  if (mode === 'view') {
    return (
      <ScreenWrapper>
        <BackButton onPress={() => setMode(null)} />
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.title}>All Questions</Text>
          {questions.map((q) => (
            <View key={q.id} style={styles.questionCard}>
              {editingQuestionId === q.id ? (
                <>
                  <TextInput
                    style={styles.input}
                    value={editedQuestion}
                    onChangeText={setEditedQuestion}
                  />
                  <TextInput
                    style={styles.input}
                    value={editedAnswer}
                    onChangeText={setEditedAnswer}
                    placeholder="Answer (true/false)"
                  />
                  {editError && <Text style={styles.errorText}>{editError}</Text>}
                  <View style={{ flexDirection: 'row', gap: wp(2), marginTop: 10 }}>
                    <ButtonC title="Save" onPress={() => handleUpdateQuestion(q.id)} buttonStyle={styles.answerButton} />
                    <ButtonC title="Cancel" onPress={() => { setEditingQuestionId(null); setEditError(''); }} buttonStyle={styles.answerButton} />
                  </View>
                </>
              ) : (
                <>
                  <Text style={styles.questionText}>{q.enunt}</Text>
                  <Text>Answer: {q.raspuns ? 'true' : 'false'}</Text>
                  <View style={{ flexDirection: 'row', gap: wp(2), marginTop: 10 }}>
                    <ButtonC
                      title="Edit"
                      onPress={() => {
                        setEditingQuestionId(q.id);
                        setEditedQuestion(q.enunt);
                        setEditedAnswer(q.raspuns ? 'true' : 'false');
                        setEditError('');
                      }}
                      buttonStyle={styles.answerButton}
                    />
                    <ButtonC
                      title="Delete"
                      onPress={() => handleDeleteQuestion(q.id)}
                      buttonStyle={styles.answerButton}
                    />
                  </View>
                </>
              )}
            </View>
          ))}
        </ScrollView>
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
  answerButton: {
    width: '48%',
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
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: wp(5),
    gap: hp(1.5),
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: wp(4),
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    fontSize: wp(3.5),
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
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
  questionCard: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    width: '100%',
  },
});

export default Theoretical;