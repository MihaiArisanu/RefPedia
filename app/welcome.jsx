import React from 'react';
import { StyleSheet, Image, Text, View, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../constants/theme';
import { hp, wp } from '../constants/common';
import ButtonC from '../components/ButtonC';
import ScreenWrapper from '../components/ScreenWrapper';
import { useRouter } from 'expo-router';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';

const Welcome = () => {
    const router = useRouter();

    const continueAsGuest = async () => {
        await signOut(auth);
        router.push({
            pathname: 'home',
            params: { guest: 'true' },
        });
    };

    return (
        <ScreenWrapper bg="white">
            <StatusBar style="dark" />
            <View style={styles.container}>
                <Image
                    style={styles.welcomeImage}
                    resizeMode="contain"
                    source={require('../assets/images/welcomeIMG.jpg')}
                />

                <View style={{ gap: 20 }}>
                    <Text style={styles.title}>RefPedia</Text>
                    <Text style={styles.punchLine}>
                        Turn your passion for basketball into a professional career! 🏀
                    </Text>
                </View>

                <View style={styles.footer}>
                    <ButtonC
                        title="Getting Started"
                        buttonStyle={{ marginHorizontal: wp(3) }}
                        onPress={() => router.push('signUp')}
                    />
                    <View style={styles.bottomTextContainer}>
                        <Text style={styles.loginText}>Already have an account?</Text>
                        <Pressable onPress={() => router.push('login')}>
                            <Text
                                style={[
                                    styles.loginText,
                                    { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold },
                                ]}
                            >
                                Login
                            </Text>
                        </Pressable>
                        <Text style={styles.loginText}>Or continue as a</Text>
                        <Pressable onPress={continueAsGuest}>
                            <Text
                                style={[
                                    styles.loginText,
                                    { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold },
                                ]}
                            >
                                Guest
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default Welcome;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        paddingHorizontal: wp(4),
    },
    punchLine: {
        textAlign: 'center',
        paddingHorizontal: wp(10),
        fontSize: hp(1.7),
        color: theme.colors.text,
    },
    title: {
        color: theme.colors.text,
        fontSize: hp(4),
        fontWeight: theme.fonts.extraBold,
        textAlign: 'center',
    },
    welcomeImage: {
        alignSelf: 'center',
        height: hp(30),
        width: wp(100),
    },
    footer: {
        gap: 30,
        width: '100%',
    },
    bottomTextContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 5,
    },
    loginText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: hp(1.6),
    },
});