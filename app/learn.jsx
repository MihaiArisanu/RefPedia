import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import { VideoView, useVideoPlayer } from 'expo-video';

const Learn = () => {
  // Surse video pentru cele 10 lecții
  const videoSources = [
    { title: "Lesson 1", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Lesson 2", url: require('../assets/video/videoTalent.mp4') },
    { title: "Lesson 3", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Lesson 4", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Lesson 5", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
    { title: "Lesson 6", url: "https://www.w3schools.com/html/mov_bbb.mp4" },
  ];

  return (
    <ScreenWrapper style={styles.wrapper}>
      <BackButton />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {videoSources.map((video, index) => {
          const player = useVideoPlayer(video.url); // Fără redare automată

          return (
            <View key={index} style={styles.videoContainer}>
              <Text style={styles.videoTitle}>{video.title}</Text>

              {/* Adăugare useNativeControls */}
              <VideoView
                player={player}
                style={styles.video}
                useNativeControls={true} // Activează controalele native
              />
            </View>
          );
        })}
      </ScrollView>
    </ScreenWrapper>
  );
};

export default Learn;

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: '#FFFFFF',
    flex: 1,
  },
  scrollContainer: {
    padding: 10,
    flexGrow: 1, // Permite scrollul vertical
  },
  videoContainer: {
    width: '100%', // Ocupă întreaga lățime a ecranului
    marginBottom: 20,
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#000',
  },
  video: {
    width: '100%', // Lățime completă
    height: 200, // Înălțime suficientă pentru videoclip
  },
});