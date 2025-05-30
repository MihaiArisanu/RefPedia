import { Pressable, StyleSheet, View, Text, Modal } from 'react-native';
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import CircleButton from '../components/CircleButton';
import Icon from '../assets/icons';
import { theme } from '../constants/theme';
import { hp, wp } from '../constants/common';
import { auth } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const Home = ({ guest = false }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const isGuest = guest || params.guest === 'true';

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, 'messages', id), { read: true });
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, 'messages'),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const messages = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
        setNotifications(messages);
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Pressable onPress={toggleModal} style={styles.icon}>
            <Icon name="notification" size={wp(7.5)} color={theme.colors.dark} />
            {notifications.some((n) => n.read === false) && (
              <View style={styles.unreadBadge} />
            )}
          </Pressable>

          <Pressable onPress={() => router.push({ pathname: 'profile', params: { guest: isGuest } })} style={styles.icon}>
            <Icon name="user" size={wp(7.5)} color={theme.colors.dark} />
          </Pressable>
        </View>

        <View style={styles.buttonContainer}>
          <CircleButton title="Learn" onPress={() => router.push('learn')} />
          <CircleButton title="Recognise Hands Signal" onPress={() => router.push('testHands')} />
          <CircleButton title="Practice Hands Signals" onPress={() => router.push('practice')} />
          <CircleButton title="Video Test" onPress={() => router.push('video')} />
          <CircleButton title="Theoretical Test" onPress={() => router.push('theoretical')} />
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <View key={notification.id} style={{ marginBottom: 10, alignItems: 'center' }}>
                    <Text style={styles.notificationText}>{notification.message}</Text>
                    <Pressable
                      onPress={() => markAsRead(notification.id)}
                      style={styles.closeButton}
                    >
                      <Text style={styles.closeButtonText}>Mark as read</Text>
                    </Pressable>
                  </View>
                ))
              ) : (
                <Text style={styles.notificationText}>No new messages</Text>
              )}
              <Pressable onPress={toggleModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wp(5),
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    top: hp(2.5),
    right: wp(5),
    flexDirection: 'row',
    zIndex: 10,
  },
  icon: {
    marginLeft: wp(2.5),
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: hp(7.5),
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: wp(5),
    borderRadius: theme.radius.md,
    width: wp(80),
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: wp(5),
    fontWeight: theme.fonts.medium,
    marginBottom: hp(1.25),
  },
  notificationText: {
    fontSize: wp(4),
    marginBottom: hp(0.625),
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: hp(1),
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderRadius: theme.radius.md,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: wp(4),
    fontWeight: theme.fonts.bold,
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFA500',
  },
});
