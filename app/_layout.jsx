import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from '../constants/AuthContext'
import { useRouter, Stack } from 'expo-router'
import { auth } from '../lib/firebase'
import { onAuthStateChanged } from 'firebase/auth';
import { getUserData } from '../constants/userService'

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

const MainLayout = () => {
    const { setAuth, setUserData } = useAuth();
    const router = useRouter();

    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
            setAuth(user);
            updateUserData(user);
            router.replace('/home');
        } else {
            setAuth(null);
            router.replace('/welcome');
        }
      });

      return () => unsubscribe();

    }, []);

    const updateUserData = async (user) => {
        let res = await getUserData(user?.uid);
        if (res.succes) setUserData(res.data); 
    }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  )
}

export default _layout;