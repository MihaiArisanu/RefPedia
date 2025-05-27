import { Alert, Pressable, StyleSheet, Text ,View } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import { hp, wp } from '../constants/common';
import { theme } from '../constants/theme';
import Input from '../components/Input';
import Icon from '../assets/icons';
import ButtonC from '../components/ButtonC';
import { useRouter } from 'expo-router';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import app from '../lib/firebase';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
  
  WebBrowser.maybeCompleteAuthSession();
  
  const Login = () => {
    const router = useRouter();
    const emailRef = useRef();
    const passwordRef = useRef();
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
  
    const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  
    const [request, response, promptAsync] = Google.useAuthRequest({
      iosClientId: '395377408799-7auq977j9ifkosoqrc6seictp2dopfj5.apps.googleusercontent.com',
      webClientId: '395377408799-n1jerqm8an2nc650u1irsiu2uum5qr48.apps.googleusercontent.com',
      redirectUri,
    });
  
    useEffect(() => {
      console.log("✅ REDIRECT URI:", redirectUri);
      handleSignInWithGoogle();
    }, [response]);
  
    async function handleSignInWithGoogle() {
      const cachedUser = await AsyncStorage.getItem('@user');
      if (cachedUser) {
        setUserInfo(JSON.parse(cachedUser));
        return;
      }
  
      if (response?.type === 'success') {
        await getUserInfo(response.authentication.accessToken);
      }
    }
  
    const getUserInfo = async (token) => {
      if (!token) return;
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = await userInfoResponse.json();
        await AsyncStorage.setItem('@user', JSON.stringify(user));
        setUserInfo(user);
        Alert.alert('Success', `Welcome, ${user.name}`);
        router.push('home');
      } catch (error) {
        console.log('Error fetching user info:', error);
      }
    };
  
    const onSubmit = async () => {
      if (!emailRef.current || !passwordRef.current) {
        Alert.alert('Login', 'Please fill all the fields!');
        return;
      }
  
      const email = emailRef.current.trim();
      const password = passwordRef.current.trim();
  
      setLoading(true);
  
      const auth = getAuth(app);
  
      try {
        await signInWithEmailAndPassword(auth, email, password);
        setLoading(false);
        Alert.alert('Success', 'You are logged in!');
        router.push('home');
      } catch (error) {
        setLoading(false);
        Alert.alert('Error', error.message);
      }
    };
  
    return (
      <ScreenWrapper bg="white">
        <StatusBar style="dark" />
        <View style={styles.container}>
          <View>
            <Text style={styles.welcomeText}>Hey,</Text>
            <Text style={styles.welcomeText}>Welcome Back</Text>
          </View>
  
          <View style={styles.form}>
            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              Please login to continue
            </Text>
  
            <Input
              icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
              placeholder="Enter your email"
              onChangeText={(value) => (emailRef.current = value)}
            />
  
            <View style={{ position: 'relative' }}>
              <Input
                icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                onChangeText={(value) => (passwordRef.current = value)}
              />
              <Pressable
                onPress={() => setShowPassword(!showPassword)}
                style={styles.showPasswordIcon}
              >
                <Icon name="show" size={26} strokeWidth={1.6} />
              </Pressable>
            </View>
  
            <Pressable onPress={() => router.push('forgot')}>
              <Text style={styles.forgotPassword}>Forgot password?</Text>
            </Pressable>
  
            <ButtonC title={'Login'} loading={loading} onPress={onSubmit} />
  
            <ButtonC
              title="Continue with Google"
              loading={false}
              onPress={() => promptAsync()}
              style={{ marginTop: 10 }}
            />
          </View>
  
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account?</Text>
            <Pressable onPress={() => router.push('signUp')}>
              <Text
                style={[
                  styles.footerText,
                  {
                    color: theme.colors.primaryDark,
                    fontWeight: theme.fonts.semibold,
                  },
                ]}
              >
                Sign up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScreenWrapper>
    );
  };
  
  export default Login;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      gap: 45,
      paddingHorizontal: wp(5),
    },
    welcomeText: {
      fontSize: hp(4),
      fontWeight: theme.fonts.bold,
      color: theme.colors.text,
    },
    form: {
      gap: 25,
    },
    showPasswordIcon: {
      position: 'absolute',
      right: 10,
      top: '50%',
      transform: [{ translateY: -13 }],
    },
    forgotPassword: {
      textAlign: 'right',
      fontWeight: theme.fonts.semibold,
      color: theme.colors.text,
      marginTop: hp(1),
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
    },
    footerText: {
      textAlign: 'center',
      color: theme.colors.text,
      fontSize: hp(1.6),
    },
  });