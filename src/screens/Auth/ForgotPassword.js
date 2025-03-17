import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, HelperText } from 'react-native-paper';
import { auth } from '../../constants/FireBaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleResetPassword = async () => {
        if (!email) {
            setError('Please enter your email.');
            setMessage('');
            return;
        }
    
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage('Check your email for a link to reset your password.');
            setError('');
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError('No user found with this email. Please enter a valid email.');
            } else if (err.code === 'auth/invalid-email') {
                setError('Invalid email format. Please enter a valid email address.');
            } else {
                setError('An error occurred. Please try again.');
            }
            setMessage('');
        }
    };

    return (
        <View style={styles.container}>
            <Text variant="headlineLarge" style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>Enter your email to receive a reset link</Text>
            
            <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                placeholder="example@example.com"
                placeholderTextColor="#94A3B8"
            />
            
            <Button 
                mode="contained" 
                onPress={handleResetPassword} 
                style={styles.button}
                labelStyle={styles.buttonLabel}
            >
                Reset Password
            </Button>
            
            {message && <HelperText type="info" visible style={styles.messageText}>{message}</HelperText>}
            {error && <HelperText type="error" visible style={styles.errorText}>{error}</HelperText>}

            <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.footerText}>
                    Remembered your password? <Text style={styles.linkText}>Log in</Text>
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 32,
        backgroundColor: '#F8FAFC',
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        color: '#020D07',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 16,
        color: '#020D07',
        textAlign: 'center',
        marginBottom: 48,
        fontWeight: '500',
        lineHeight: 24,
    },
    input: {
        marginBottom: 20,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#EDF2F7',
        shadowColor: '#1A202C',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    button: {
        backgroundColor: '#B7FF11',
        borderRadius: 14,
        paddingVertical: 16,
        marginBottom: 24,
        shadowColor: '#48BB78',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 4,
    },
    buttonLabel: {
        color: '#020D07',
        fontWeight: '600',
        fontSize: 16,
        letterSpacing: 0.25,
    },
    messageText: {
        color: '#020D07',
        backgroundColor: '#B7FF11',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: 'center',
    },
    errorText: {
        color: '#020D07',
        backgroundColor: '#FED7D7',
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
        textAlign: 'center',
    },
    footerText: {
        textAlign: 'center',
        color: '#020D07',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 24,
    },
    linkText: {
        color: '#020D07',
        fontWeight: '600',
        textDecorationLine: 'underline',
        letterSpacing: 0.15,
    },
});

export default ForgotPassword;