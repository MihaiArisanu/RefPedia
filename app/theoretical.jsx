import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { generateQuestion } from '../services/QuestionService';  // Importă funcția din FibaQuestionsService
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Loading from '../components/Loading';  // Importăm componenta de loading

const Theoretical = () => {
  const [currentQuestion, setCurrentQuestion] = useState("");  // Stocăm întrebarea curentă
  const [questionsAsked, setQuestionsAsked] = useState(0);  // Numărul de întrebări la care s-a răspuns
  const [loading, setLoading] = useState(false);  // Starea de încărcare

  const handleNextQuestion = async () => {
    setLoading(true);  // Setează loading true când începem să obținem o nouă întrebare
    // Obține o întrebare nouă
    const newQuestion = await generateQuestion();
    setCurrentQuestion(newQuestion);
    setQuestionsAsked(questionsAsked + 1);  // Incrementăm numărul de întrebări
    setLoading(false);  // Oprește loading după ce întrebarea este obținută
  };

  useEffect(() => {
    // Încarcă prima întrebare la început
    handleNextQuestion();
  }, []);

  return (
    <ScreenWrapper>
      <BackButton />
      <View style={styles.container}>
        {loading ? (
          // Dacă se încarcă întrebarea, afișează indicatorul de loading
          <Loading />
        ) : (
          <>
            {currentQuestion && (
              <>
                <Text style={styles.questionText}>{currentQuestion}</Text>
                <View style={styles.buttonContainer}>
                  <Button title="Yes" onPress={() => alert('You selected Yes')} />
                  <Button title="No" onPress={() => alert('You selected No')} />
                </View>
                <Button title="Next Question" onPress={handleNextQuestion} />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
});

export default Theoretical;