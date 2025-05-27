import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View, Alert, TouchableOpacity, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import ButtonC from '../components/ButtonC';
import { theme } from '../constants/theme';
import { hp, wp } from '../constants/common';
import { auth, db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const Feedback = () => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [replyText, setReplyText] = useState({});
  const [showHidden, setShowHidden] = useState(false);
  const [mode, setMode] = useState('user'); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid)));
        const role = snap.docs[0]?.data()?.role;
        if (role === 'admin') {
          setIsAdmin(true);
          setMode('admin');
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (mode === 'admin') fetchFeedback();
  }, [mode, showHidden]);

  const fetchFeedback = async () => {
    const querySnapshot = await getDocs(collection(db, 'feedback'));
    const feedbacks = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setFeedbackList(feedbacks);
    const replies = {};
    feedbacks.forEach((f) => {
      if (f.reply) replies[f.id] = f.reply;
    });
    setReplyText(replies);
  };

  const checkFeedback = async (text) => {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.EXPO_PUBLIC_FEEDBACK_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are a moderation system. Tell me if the following text contains hate speech, insults or toxic content. Just answer with \"true\" or \"false\". Text: \"${text}\"`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const result = await response.json();
      const output = result?.candidates?.[0]?.content?.parts?.[0]?.text?.toLowerCase();
      return output?.includes('true');
    } catch (err) {
      console.error('Gemini moderation failed:', err);
      return false;
    }
  };

  const sendFeedback = async () => {
    const user = auth.currentUser;
    if (!user || !title.trim() || !content.trim()) {
      return Alert.alert('Error', 'Please complete all fields.');
    }

    const feedbackRef = await addDoc(collection(db, 'feedback'), {
      userId: user.uid,
      title: title.trim(),
      content: content.trim(),
      timestamp: serverTimestamp(),
      hidden: false,
    });

    const isToxic = await checkFeedback(content);
    if (isToxic) await updateDoc(feedbackRef, { hidden: true });

    Alert.alert('Success', 'Feedback sent.');
    setTitle('');
    setContent('');
  };

  const sendReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;
    const feedbackItem = feedbackList.find((f) => f.id === id);
    await updateDoc(doc(db, 'feedback', id), { reply });
    await addDoc(collection(db, 'messages'), {
      userId: feedbackItem.userId,
      message: `Ai primit un răspuns la feedbackul tău: ${reply}`,
      timestamp: serverTimestamp(),
      read: false,
    });
    Alert.alert('Success', 'Reply sent.');
    setReplyText((prev) => ({ ...prev, [id]: reply }));
  };

  const deleteFeedback = async (id) => {
    await deleteDoc(doc(db, 'feedback', id));
    setFeedbackList((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <BackButton onPress={() => router.push('profile')} />
      </View>

      {mode === 'admin' ? (
        <>
          <TouchableOpacity onPress={() => setShowHidden((prev) => !prev)}>
            <Text style={styles.toggle}>{showHidden ? 'Hide' : 'Show'} hidden feedback</Text>
          </TouchableOpacity>
          <FlatList
            contentContainerStyle={{ padding: wp(5), gap: 15 }}
            data={feedbackList.filter((f) => showHidden || !f.hidden)}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const currentReply = replyText[item.id] ?? '';
              const isChanged = currentReply !== (item.reply ?? '');
              return (
                <View style={styles.card}>
                  <Text style={styles.title}>{item.title}</Text>
                  {item.hidden && <Text style={styles.hidden}>[Hidden]</Text>}
                  <Text style={styles.content}>{item.content}</Text>
                  <TextInput
                    style={styles.input}
                    value={currentReply}
                    onChangeText={(text) =>
                      setReplyText((prev) => ({ ...prev, [item.id]: text }))
                    }
                    placeholder="Răspuns..."
                  />
                  <View style={styles.buttonColumn}>
                    {isChanged && <ButtonC title="Reply" onPress={() => sendReply(item.id)} />}
                    <View style={{ height: 10 }} />
                    <ButtonC title="Delete" onPress={() => deleteFeedback(item.id)} />
                  </View>
                </View>
              );
            }}
          />
        </>
      ) : (
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Titlu"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Feedback..."
            multiline
            value={content}
            onChangeText={setContent}
          />
          <View style={{ marginTop: 10 }}>
            <ButtonC title="Trimite feedback" onPress={sendFeedback} />
          </View>
        </View>
      )}
    </ScreenWrapper>
  );
};

export default Feedback;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(5),
    paddingTop: hp(1.5),
    paddingBottom: hp(0.5),
  },
  form: {
    padding: wp(5),
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    fontSize: wp(4),
  },
  card: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    gap: 10,
  },
  title: {
    fontWeight: 'bold',
    fontSize: wp(4.5),
  },
  content: {
    fontSize: wp(4),
    marginVertical: 5,
  },
  hidden: {
    fontStyle: 'italic',
    color: theme.colors.primary,
  },
  toggle: {
    textAlign: 'right',
    margin: 10,
    color: theme.colors.primaryDark,
  },
  buttonColumn: {
    flexDirection: 'column',
    gap: 10,
    marginTop: 10,
  },
});