import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { supabase } from '../lib/supabase'
import { getUserData } from '../constants/userService'
import ScreenWrapper from '../components/ScreenWrapper'
import BackButton from '../components/BackButton';
import { Video } from 'expo-av'

const VideoTest = () => {
  return (
    <ScreenWrapper>
      <BackButton/>
      
    </ScreenWrapper>
  )
}

export default VideoTest

const styles = StyleSheet.create({})