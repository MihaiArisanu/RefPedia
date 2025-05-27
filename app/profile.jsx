import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Icon from '../assets/icons';
import { theme } from '../constants/theme';
import Input from '../components/Input';
import ButtonC from '../components/ButtonC';
import { auth } from '../lib/firebase';
import { updateEmail, updatePassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { hp, wp } from '../constants/common';

const Profile = () => {
  const router = useRouter();
  const [isGuest, setIsGuest] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const emailRef = useRef();
  const passwordRef = useRef();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsGuest(!user);
    });
    return unsubscribe;
  }, []);

  const onLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/welcome');
    } catch (err) {
      console.error('Unexpected error during logout:', err);
    }
  };

  const handleEmailChange = async () => {
    if (!emailRef.current) return;
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        await updateEmail(user, emailRef.current.trim());
        alert('Email updated!');
      }
    } catch (err) {
      console.error('Email error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordRef.current) return;
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, passwordRef.current.trim());
        alert('Password updated!');
      }
    } catch (err) {
      console.error('Password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper style={{ flex: 1 }}>
      <View style={styles.header}>
        <BackButton onPress={onLogout} />
        {!isGuest && (
          <Pressable onPress={onLogout} style={styles.iconWrapper}>
            <Icon name="logout" color={theme.colors.dark} />
          </Pressable>
        )}
      </View>

      <View style={styles.form}>
        {isGuest ? (
          <View style={styles.guestContainer}>
            <Text style={styles.text}>
              Please{' '}
              <Text style={styles.loginLink} onPress={() => router.push('login')}>
                Login
              </Text>{' '}
              to access your account settings.
            </Text>
          </View>
        ) : (
          <>
            <Input
              icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
              placeholder="Noul email"
              onChangeText={(value) => (emailRef.current = value)}
            />
            <ButtonC title="Update Email" loading={loading} onPress={handleEmailChange} style={styles.button} />

            <View style={{ position: 'relative' }}>
              <Input
                icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                placeholder="Noua parolă"
                secureTextEntry={!showPassword}
                onChangeText={(value) => (passwordRef.current = value)}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordIcon}>
                <Icon name="show" size={24} strokeWidth={1.6} />
              </Pressable>
            </View>

            <ButtonC title="Update Password" loading={loading} onPress={handlePasswordChange} style={styles.button} />

            <Pressable onPress={() => router.push('feedback')}>
              <Text style={styles.link}>Feedback sau probleme</Text>
            </Pressable>
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
    flex: 1,
    width: '100%',
    gap: hp(1.875),
    marginTop: hp(1.25),
    paddingHorizontal: wp(5),
  },
  text: {
    fontSize: wp(4.5),
    color: theme.colors.text,
    textAlign: 'center',
  },
  link: {
    fontSize: wp(4.5),
    color: theme.colors.primaryDark,
    textAlign: 'center',
    marginTop: 10,
  },
  button: {
    height: hp(5),
    alignSelf: 'flex-start',
  },
  showPasswordIcon: {
    position: 'absolute',
    right: wp(2),
    top: '50%',
    transform: [{ translateY: -13 }],
    padding: 4,
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(5),
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});