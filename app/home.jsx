import { Pressable, StyleSheet, View, Text, Modal } from 'react-native';
import React, { useState } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import CircleButton from '../components/CircleButton';
import Icon from '../assets/icons';
import { theme } from '../constants/theme';

const Home = ({ guest = false }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [notifications, setNotifications] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);

  const isGuest = guest || params.guest === 'true';

  const toggleModal = () => {
    setModalVisible(!modalVisible);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Pressable onPress={toggleModal} style={styles.icon}>
            <Icon name="notification" size={30} color={theme.colors.dark} />
          </Pressable>

          <Pressable onPress={() => router.push({ pathname: 'profile', params: { guest: isGuest } })} style={styles.icon}>
            <Icon name="user" size={30} color={theme.colors.dark} />
          </Pressable>
        </View>

        <View style={styles.buttonContainer}>
          <CircleButton title="Learn" onPress={() => router.push('learn')} />
          <CircleButton title="Recogise Hands Signal" onPress={() => router.push('testHands')} />
          <CircleButton title="Practice Hands Signals" onPress={() => router.push('practice')} />
          <CircleButton title="Video Test" onPress={() => router.push('video')} />
          <CircleButton title="Theoretical Test" onPress={() => router.push('theoretical')} />
        </View>

        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Notifications</Text>
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <Text key={index} style={styles.notificationText}>
                    {notification}
                  </Text>
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
    padding: 20,
    position: 'relative',
  },
  iconContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    zIndex: 10,
  },
  icon: {
    marginLeft: 10,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingTop: 60,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: theme.radius.md,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: theme.fonts.medium,
    marginBottom: 10,
  },
  notificationText: {
    fontSize: 16,
    marginBottom: 5,
    color: theme.colors.text,
    fontWeight: theme.fonts.medium,
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: theme.fonts.bold,
  },
});