import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Pressable, TextInput, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Icon from '../assets/icons';
import { theme } from '../constants/theme';
import Input from '../components/Input';
import ButtonC from '../components/ButtonC';
import { auth } from '../lib/firebase';
import { updateEmail, updatePassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getDoc, doc, addDoc, collection, serverTimestamp, getDocs, updateDoc, deleteDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { hp, wp } from '../constants/common';
import MessageBox from '../components/MessageBox';

const Profile = () => {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showFeedbackPanel, setShowFeedbackPanel] = useState(false);
  const [feedbackMode, setFeedbackMode] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [userMessages, setUserMessages] = useState([]);
  const [showHidden, setShowHidden] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();

  const checkFeedback = async (text) => {
    try {
      const response = await fetch('https://refpedia.onrender.com/check-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const result = await response.json();
      return result.offensive;
    } catch (err) {
      console.error('AI check failed:', err);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsGuest(!user);
      if (user) {
        const fetchUserRole = async () => {
          try {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists() && userSnap.data().role === 'admin') {
              setIsAdmin(true);
            }
          } catch (err) {
            console.error('Error checking admin role:', err);
          }
        };
        fetchUserRole();
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isAdmin && showFeedbackPanel) {
      const fetchFeedback = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'feedback'));
          const feedbacks = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setFeedbackList(feedbacks);
        } catch (err) {
          console.error('Error fetching feedback:', err);
        }
      };
      fetchFeedback();
    }
  }, [isAdmin, showFeedbackPanel]);

  useEffect(() => {
    const fetchUserMessages = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(db, 'messages'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUserMessages(messages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };
    if (!isAdmin && !isGuest) fetchUserMessages();
  }, [isAdmin, isGuest]);

  const onLogout = async () => {
    if (showFeedbackPanel || feedbackMode) {
      setShowFeedbackPanel(false);
      setFeedbackMode(false);
      return;
    }
    try {
      await signOut(auth);
      router.replace('/');
    } catch (err) {
      console.error('Unexpected error during logout:', err);
      Alert.alert('Error', 'An unexpected error occurred!');
    }
  };

  const handleEmailChange = async () => {
    if (!emailRef.current) return Alert.alert('Error', 'Please enter a valid email!');
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        await updateEmail(user, emailRef.current.trim());
        Alert.alert('Success', 'Email updated successfully!');
      }
    } catch (err) {
      console.error('Error updating email:', err);
      Alert.alert('Error', 'An unexpected error occurred!');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordRef.current) return Alert.alert('Error', 'Please enter a valid password!');
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, passwordRef.current.trim());
        Alert.alert('Success', 'Password updated successfully!');
      }
    } catch (err) {
      console.error('Error updating password:', err);
      Alert.alert('Error', 'An unexpected error occurred!');
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async () => {
    const user = auth.currentUser;
    if (!user || !title || !content) return Alert.alert('Error', 'Please complete all fields.');
  
    try {
      const feedbackRef = await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        title,
        content,
        timestamp: serverTimestamp(),
        hidden: false,
      });
  
      checkFeedback(content).then(async (isOffensive) => {
        if (isOffensive) {
          await updateDoc(feedbackRef, { hidden: true });
        }
      });
  
      Alert.alert('Success', 'Feedback sent successfully!');
      setTitle('');
      setContent('');
      setFeedbackMode(false);
    } catch (err) {
      console.error('Error sending feedback:', err);
      Alert.alert('Error', 'Failed to send feedback.');
    }
  };

  const sendReply = async (id) => {
    const reply = replyText[id];
    if (!reply) return;
    const feedbackItem = feedbackList.find((f) => f.id === id);
    if (!feedbackItem || feedbackItem.reply === reply) return Alert.alert('Info', 'Răspunsul este neschimbat.');
    try {
      await updateDoc(doc(db, 'feedback', id), { reply });
      await addDoc(collection(db, 'messages'), {
        userId: feedbackItem.userId,
        message: `Ai primit un răspuns la feedbackul tău: ${reply}`,
        timestamp: serverTimestamp(),
        read: false,
      });
      Alert.alert('Success', feedbackItem.reply ? 'Răspuns actualizat!' : 'Răspuns trimis!');
      setReplyText((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      console.error('Error sending reply:', err);
      Alert.alert('Error', 'Failed to send reply.');
    }
  };

  const deleteFeedback = async (id) => {
    Alert.alert('Confirm', 'Are you sure you want to delete this feedback?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'feedback', id));
            setFeedbackList((prev) => prev.filter((item) => item.id !== id));
            Alert.alert('Deleted', 'Feedback deleted successfully.');
          } catch (err) {
            console.error('Error deleting feedback:', err);
            Alert.alert('Error', 'Failed to delete feedback.');
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <BackButton onPress={onLogout} />
          {!showFeedbackPanel && (
        <TouchableOpacity style={styles.iconWrapper} onPress={onLogout}>
        <Icon name="logout" color={theme.colors.dark} />
        </TouchableOpacity>
        )}
      </View>
      <View style={styles.form}>
        {isGuest ? (
          <View>
            <Pressable onPress={() => router.push('login')}>
              <Text style={styles.footerText}>Login</Text>
            </Pressable>
            <Text style={styles.text}>Please login to access all the features that the app has.</Text>
          </View>
        ) : showFeedbackPanel ? (
          <>
            <Pressable onPress={() => setShowHidden(!showHidden)}>
              <Text style={styles.showHiddenText}>
                {showHidden ? 'Hide hidden feedback' : 'Show hidden feedback'}
              </Text>
            </Pressable>
            <FlatList
              data={feedbackList.filter(f => !f.hidden || showHidden)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                if (item.hidden && !showHidden) return null;
              
                return (
                  <View style={styles.feedbackCard}>
                    <Text style={styles.feedbackTitle}>{item.title}</Text>
                    {item.hidden && (
                      <Text style={styles.hiddenLabel}>[Hidden Feedback]</Text>
                    )}
                    <Text style={styles.text}>{item.content}</Text>
                    <TextInput
                      style={styles.inputText}
                      value={replyText[item.id] ?? item.reply ?? ''}
                      placeholder="Scrie sau editează răspunsul..."
                      onChangeText={(text) =>
                        setReplyText((prev) => ({ ...prev, [item.id]: text }))
                      }
                    />
                    <TouchableOpacity onPress={() => deleteFeedback(item.id)} style={styles.deleteButton}>
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                    {(replyText[item.id] !== undefined && replyText[item.id] !== item.reply) && (
                      <TouchableOpacity onPress={() => sendReply(item.id)} style={styles.replyButton}>
                        <Text style={styles.deleteButtonText}>Reply</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              }}
            />
          </>
        ) : feedbackMode ? (
          <>
            <TextInput style={styles.inputText} placeholder="Title" value={title} onChangeText={setTitle} />
            <TextInput style={[styles.inputText, { height: 100 }]} placeholder="Your feedback or problem..." value={content} onChangeText={setContent} multiline />
            <ButtonC title="Send" onPress={sendFeedback} style={styles.button} />
          </>
        ) : (
          <>
            <Input icon={<Icon name="mail" size={26} strokeWidth={1.6} />} placeholder="Enter your new email" onChangeText={(value) => (emailRef.current = value)} />
            <ButtonC title="Update Email" loading={loading} onPress={handleEmailChange} style={styles.button} />
            <View style={{ position: 'relative' }}>
              <Input icon={<Icon name="lock" size={26} strokeWidth={1.6} />} placeholder="Enter your new password" secureTextEntry={!showPassword} onChangeText={(value) => (passwordRef.current = value)} />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
                <Icon name="show" size={26} strokeWidth={1.6} />
              </Pressable>
            </View>
            <ButtonC title="Update Password" loading={loading} onPress={handlePasswordChange} style={styles.button} />
            {isAdmin && !showFeedbackPanel && (
              <Pressable onPress={() => setShowFeedbackPanel(true)}>
                <Text style={[styles.text, { color: theme.colors.primaryDark, marginTop: 10 }]}>View feedback</Text>
              </Pressable>
            )}
            {!isAdmin && (
              <Pressable onPress={() => setFeedbackMode(true)}>
                <Text style={[styles.text, { color: theme.colors.primaryDark, marginTop: 10 }]}>Feedback or problems</Text>
              </Pressable>
            )}
            {!isAdmin && userMessages.length > 0 && <MessageBox messages={userMessages} />}
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

export default Profile;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(5),
    paddingVertical: hp(1.25),
  },
  iconWrapper: {
    padding: wp(1.25),
    borderRadius: theme.radius.sm,
  },
  form: {
    width: '100%',
    gap: hp(1.875),
    marginTop: hp(1.25),
    paddingHorizontal: wp(5),
  },
  button: {
    height: hp(5),
    alignSelf: 'flex-start',
  },
  showPasswordIcon: {
    position: 'absolute',
    right: wp(2.5),
    top: '50%',
    transform: [{ translateY: -13 }],
  },
  inputText: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: wp(4),
    backgroundColor: '#fff',
  },
  feedbackCard: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  feedbackTitle: {
    fontWeight: 'bold',
    fontSize: wp(4.5),
    marginBottom: 5,
  },
  text: {
    fontSize: wp(4.5),
    textAlign: 'center',
    color: theme.colors.text,
  },
  footerText: {
    textAlign: 'center',
    color: theme.colors.text,
    fontSize: wp(4.5),
  },
  deleteButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  replyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 5,
    marginTop: 10,
  },
  showHiddenText: {
    fontSize: 14,
    textAlign: 'right',
    color: theme.colors.primaryDark,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  hiddenLabel: {
    fontSize: wp(3.5),
    color: theme.colors.primary,
    fontStyle: 'italic',
    marginBottom: 5,
  },
});