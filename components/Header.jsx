import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import React, { useRef, useState } from 'react';
import ScreenWrapper from '../components/ScreenWrapper';
import { StatusBar } from 'expo-status-bar';
import Header from '../components/Header'; // Importăm noua componentă Header
import { hp, wp } from '../constants/common';
import { theme } from '../constants/theme';
import Input from '../components/Input';
import Icon from '../assets/icons';
import ButtonC from '../components/ButtonC';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';

const ForgotPassword = () => {
    const router = useRouter();
    const emailRef = useRef();
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState(false);

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const onSubmit = async () => {
        if (!emailRef.current) {
            Alert.alert('Forgot Password', 'Please enter your email address!');
            return;
        }

        const email = emailRef.current.trim();

        if (!validateEmail(email)) {
            Alert.alert('Invalid Email', 'Please enter a valid email address!');
            return;
        }

        setLoading(true);

        const { error } = await supabase.auth.resetPasswordForEmail(email);

        setLoading(false);

        if (error) {
            Alert.alert('Error', error.message);
        } else {
            setSuccessMessage(true);
        }
    };

    if (successMessage) {
        return (
            <ScreenWrapper bg="white">
                <StatusBar style="dark" />
                <View style={styles.container}>
                    <Header title="Forgot Password" showBackButton />
                    <View style={styles.successContainer}>
                        <Icon name="check-circle" size={100} color={theme.colors.success} />
                        <Text style={styles.successHeaderText}>Email Sent!</Text>
                        <Text style={styles.successSubHeaderText}>
                            If this email is registered, you will receive a password reset link
                            shortly.
                        </Text>
                        <ButtonC
                            title="Back to Login"
                            onPress={() => router.push('login')}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper bg="white">
            <StatusBar style="dark" />
            <View style={styles.container}>
                {/* Utilizăm Header în locul header-ului anterior */}
                <Header title="Forgot Password" showBackButton />

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
    successContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        paddingHorizontal: wp(5),
    },
    successHeaderText: {
        fontSize: hp(3.5),
        fontWeight: theme.fonts.bold,
        color: theme.colors.success,
        textAlign: 'center',
    },
    successSubHeaderText: {
        fontSize: hp(2),
        color: theme.colors.text,
        textAlign: 'center',
    },
});