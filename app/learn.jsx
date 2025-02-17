import React from 'react';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import { VideoView, useVideoPlayer } from 'expo-video';
import { hp, wp } from '../constants/common';

const Learn = () => {
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
          const player = useVideoPlayer(video.url);

          return (
            <View key={index} style={styles.videoContainer}>
              <Text style={styles.videoTitle}>{video.title}</Text>

              <VideoView
                player={player}
                style={styles.video}
                useNativeControls={true}
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
    padding: wp(2.5),
    flexGrow: 1,
  },
  videoContainer: {
    width: '100%',
    marginBottom: hp(2.5),
  },
  videoTitle: {
    fontSize: wp(4),
    fontWeight: 'bold',
    marginBottom: hp(1.25),
    textAlign: 'center',
    color: '#000',
  },
  video: {
    width: '100%',
    height: hp(25),
  },
});
