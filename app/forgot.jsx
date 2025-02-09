import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import BackButton from '../components/BackButton';
import { hp, wp } from '../constants/common';
import { theme } from '../constants/theme';
import Input from '../components/Input';
import Icon from '../assets/icons';
import ButtonC from '../components/ButtonC';
import { useRouter } from 'expo-router';
import { auth } from '../lib/firebase';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
    const router = useRouter();
    const emailRef = useRef();
    const [loading, setLoading] = useState(false);

    const onSubmit = async () => {
        if (!emailRef.current) {
            Alert.alert('Forgot Password', 'Please enter your email address!');
            return;
        }

        const email = emailRef.current.trim();

        setLoading(true);

        try {
            await sendPasswordResetEmail(auth, email);
            setLoading(false);

            Alert.alert(
                'Success',
                'If this email is registered, you will receive a password reset link shortly.'
            );
            router.push('login');
        } catch (error) {
            setLoading(false);
            Alert.alert('Error', error.message); 
        }
    };

    return (
        <ScreenWrapper bg="white">
            <StatusBar style="dark" />
            <View style={styles.container}>
                <BackButton />

                {/* Header */}
                <View>
                    <Text style={styles.headerText}>Forgot Password?</Text>
                    <Text style={styles.subHeaderText}>
                        Enter your email below to reset your password.
                    </Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <Input
                        icon={<Icon name="mail" size={26} strokeWidth={1.6} />}
                        placeholder="Enter your email"
                        onChangeText={(value) => (emailRef.current = value)}
                    />
                    {/* Reset Button */}
                    <ButtonC title="Send Reset Code" loading={loading} onPress={onSubmit} />
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Remembered your password?</Text>
                    <Pressable onPress={() => router.push('login')}>
                        <Text
                            style={[
                                styles.footerText,
                                { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold },
                            ]}
                        >
                            Log in
                        </Text>
                    </Pressable>
                </View>
            </View>
        </ScreenWrapper>
    );
};

export default ForgotPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 45,
        paddingHorizontal: wp(5),
    },
    headerText: {
        fontSize: hp(4),
        fontWeight: theme.fonts.bold,
        color: theme.colors.text,
    },
    subHeaderText: {
        fontSize: hp(2),
        color: theme.colors.text,
        marginTop: hp(1),
    },
    form: {
        gap: 25,
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