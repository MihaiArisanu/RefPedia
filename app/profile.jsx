import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Icon from '../assets/icons';
import { theme } from '../constants/theme';
import Input from '../components/Input';
import ButtonC from '../components/ButtonC';
import { auth } from '../lib/firebase';
import { updateEmail, updatePassword, signOut, onAuthStateChanged } from 'firebase/auth';

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
        console.log("Attempting to log out...");
        try {
            await signOut(auth);
            console.log("Logout successful. Redirecting to Welcome...");
            router.replace('/');
        } catch (err) {
            console.error("Unexpected error during logout:", err);
            Alert.alert('Error', "An unexpected error occurred!");
        }
    };

    const handleEmailChange = async () => {
        if (!emailRef.current) {
            Alert.alert('Error', 'Please enter a valid email!');
            return;
        }

        try {
            setLoading(true);
            const user = auth.currentUser;
            if (user) {
                await updateEmail(user, emailRef.current.trim());
                Alert.alert('Success', 'Email updated successfully!');
            } else {
                Alert.alert('Error', 'No user is signed in.');
            }
        } catch (err) {
            console.error('Error updating email:', err);
            Alert.alert('Error', 'An unexpected error occurred!');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordRef.current) {
            Alert.alert('Error', 'Please enter a valid password!');
            return;
        }

        try {
            setLoading(true);
            const user = auth.currentUser;
            if (user) {
                await updatePassword(user, passwordRef.current.trim());
                Alert.alert('Success', 'Password updated successfully!');
            } else {
                Alert.alert('Error', 'No user is signed in.');
            }
        } catch (err) {
            console.error('Error updating password:', err);
            Alert.alert('Error', 'An unexpected error occurred!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScreenWrapper>
            <View style={styles.header}>
                <BackButton />
                <TouchableOpacity style={styles.iconWrapper} onPress={onLogout}>
                    <Icon name="logout" color={theme.colors.dark} />
                </TouchableOpacity>
            </View>
            <View style={styles.form}>
                {isGuest ? (
                    <View>
                        <Pressable onPress={() => router.push('login')}>
                            <Text
                                style={[
                                    styles.footerText,
                                    { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold },
                                ]}
                            >
                                Login
                            </Text>
                        </Pressable>
                        <Text style={styles.text}>
                            Please login to access all the features that the app has.
                        </Text>
                    </View>
                ) : (
                    <>
                        <Input
                            icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
                            placeholder="Enter your new email"
                            onChangeText={(value) => (emailRef.current = value)}
                        />
                        <ButtonC
                            title="Update Email"
                            loading={loading}
                            onPress={handleEmailChange}
                            style={styles.button}
                        />

                        <View style={{ position: 'relative' }}>
                            <Input
                                icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                                placeholder="Enter your new password"
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

                        <ButtonC
                            title="Update Password"
                            loading={loading}
                            onPress={handlePasswordChange}
                            style={styles.button}
                        />
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
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    iconWrapper: {
        padding: 5,
        borderRadius: theme.radius.sm,
    },
    container: {
        flex: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
    },
    text: {
        fontSize: 18,
        textAlign: 'center',
        color: theme.colors.text,
    },
    form: {
        width: '100%',
        gap: 15,
        marginTop: 10,
        paddingHorizontal: 20,
    },
    button: {
        height: 40,
        alignSelf: 'flex-start',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
        textAlign: 'center',
    },
    footerText: {
        textAlign: 'center',
        color: theme.colors.text,
        fontSize: 18,
    },
    showPasswordIcon: {
        position: 'absolute',
        right: 10,
        top: '50%',
        transform: [{ translateY: -13 }], // Centrare în câmpul de input
    },
});