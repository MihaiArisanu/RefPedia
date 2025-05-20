// components/MessageBox.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { collection, query, where, orderBy, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { wp, hp } from '../constants/common';
import { theme } from '../constants/theme';
import Icon from '../assets/icons';

const MessageBox = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchUnreadMessages = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, 'messages'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        const fetchedMessages = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));

        setMessages(fetchedMessages);
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchUnreadMessages();
  }, []);

  const markAsRead = async (id) => {
    await updateDoc(doc(db, 'messages', id), { read: true });
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)));
  };

  const deleteMessage = async (id) => {
    await deleteDoc(doc(db, 'messages', id));
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  if (messages.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notificări:</Text>
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.messageRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.message, item.read && styles.read]}>{item.message}</Text>
            </View>
            {!item.read && (
              <TouchableOpacity onPress={() => markAsRead(item.id)} style={styles.iconButton}>
                <Icon name="check" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => deleteMessage(item.id)} style={styles.iconButton}>
              <Icon name="trash" size={20} color={theme.colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default MessageBox;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: wp(4),
    marginTop: hp(2),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: wp(4.5),
    fontWeight: 'bold',
    marginBottom: hp(1),
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  message: {
    fontSize: wp(4),
    color: theme.colors.text,
  },
  read: {
    opacity: 0.5,
  },
  iconButton: {
    marginLeft: wp(2),
    padding: 4,
  },
});
