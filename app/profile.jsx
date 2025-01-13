import React, { useEffect, useState, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenWrapper from '../components/ScreenWrapper';
import BackButton from '../components/BackButton';
import Icon from '../assets/icons';
import { theme } from '../constants/theme';
import Input from '../components/Input';
import ButtonC from '../components/ButtonC';
import { supabase } from '../lib/supabase';

const Profile = () => {
    const router = useRouter();
    const [isGuest, setIsGuest] = useState(true);
    const [loading, setLoading] = useState(false);
    const emailRef = useRef(); // Referință pentru email
    const passwordRef = useRef(); // Referință pentru parolă

    useEffect(() => {
        const checkAuthStatus = async () => {
            const { data: { session }, error } = await supabase.auth.getSession();

            if (error) {
                console.error('Error checking session:', error);
            }

            setIsGuest(!session); // Dacă nu există sesiune, este guest
        };

        checkAuthStatus();
    }, []);

    const onLogout = async () => {
        console.log("Attempting to log out...");
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error("Logout error:", error);
                Alert.alert('Error', "Error signing out!");
                return;
            }

            console.log("Logout successful. Redirecting to Welcome...");
            router.replace('/'); // Redirecționare la ecranul principal
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
            const { error } = await supabase.auth.updateUser({
                email: emailRef.current.trim(),
            });
            setLoading(false);

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Success', 'Email updated successfully!');
            }
        } catch (err) {
            setLoading(false);
            Alert.alert('Error', 'An unexpected error occurred!');
        }
    };

    const handlePasswordChange = async () => {
        if (!passwordRef.current) {
            Alert.alert('Error', 'Please enter a valid password!');
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.updateUser({
                password: passwordRef.current.trim(),
            });
            setLoading(false);

            if (error) {
                Alert.alert('Error', error.message);
            } else {
                Alert.alert('Success', 'Password updated successfully!');
            }
        } catch (err) {
            setLoading(false);
            Alert.alert('Error', 'An unexpected error occurred!');
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
                        <Pressable onPress={() => router.push('signUp')}>
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
                        <Input
                            icon={<Icon name="lock" size={26} strokeWidth={1.6} />}
                            placeholder="Enter your new password"
                            secureTextEntry
                            onChangeText={(value) => (passwordRef.current = value)}
                        />
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
        justifyContent: 'flex-start', // Aliniază la început
        paddingHorizontal: 20,
    },
    text: {
        fontSize: 18,
        textAlign: 'center',
        color: theme.colors.text,
    },
    form: {
        width: '100%',
        gap: 15, // Spațiu mai mic între elemente
        marginTop: 10, // Mai aproape de header
        paddingHorizontal: 20,
    },
    button: {
        height: 40, // Înălțime mai mică
        alignSelf: 'flex-start', // Butoane mai compacte
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
});