import React, { useEffect } from 'react'
import { AuthProvider, useAuth } from '../constants/AuthContext'
import { useRouter, Stack } from 'expo-router'
import { supabase } from '../lib/supabase'
import { getUserData } from '../constants/userService'

const _layout = () => {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  )
}

const MainLayout = () => {
    const {setAuth, setUserData} = useAuth();
    const router = useRouter();

    useEffect(() => {
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session) {
            setAuth(session?.user);
            updateUserData(session?.user);
            router.replace('/home');
        } else {
          setAuth(session?.user);
          router.replace('/welcome');
        }
      })
    }, []);

    const updateUserData = async (user) => {
        let res = await getUserData(user?.id);
        if (res.succes) setUserData(res.data);
    }

  return (
    <Stack screenOptions = {{headerShown: false}} />
  )
}

export default _layout