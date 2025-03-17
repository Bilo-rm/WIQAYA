import React, { useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../constants/FireBaseConfig';
import { useNavigation } from '@react-navigation/native';

const CreateAccount = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const validateFields = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    if (!password || password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateAccount = async () => {
    if (!validateFields()) return;
    
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigation.navigate('HomeScreen');
    } catch (error) {
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFirebaseError = (error) => {
    const newErrors = {};
    switch (error.code) {
      case 'auth/email-already-in-use':
        newErrors.email = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        newErrors.email = 'Please provide a valid email address';
        break;
      case 'auth/weak-password':
        newErrors.password = 'Password should be at least 6 characters';
        break;
      default:
        newErrors.general = 'An unexpected error occurred. Please try again.';
    }
    setErrors(newErrors);
  };

  const clearError = (field) => {
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Account</Text>
      <Text style={styles.subtitle}>Join our community to get started</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        onFocus={() => clearError('email')}
        mode="outlined"
        style={styles.input}
        placeholder="example@example.com"
        placeholderTextColor="#94A3B8"
        error={!!errors.email}
        autoCapitalize="none"
        keyboardType="email-address"
        textColor="#020D07"
      />
      {errors.email && <HelperText type="error" style={styles.errorText}>{errors.email}</HelperText>}

      <TextInput
        label="Password"
        secureTextEntry={!passwordVisible}
        value={password}
        onChangeText={setPassword}
        onFocus={() => clearError('password')}
        mode="outlined"
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#94A3B8"
        error={!!errors.password}
        right={<TextInput.Icon 
          icon={passwordVisible ? 'eye-off' : 'eye'} 
          onPress={() => setPasswordVisible(!passwordVisible)}
          color="#64748B"
        />}
        textColor="#020D07"
      />
      {errors.password && <HelperText type="error" style={styles.errorText}>{errors.password}</HelperText>}

      <TextInput
        label="Confirm Password"
        secureTextEntry={!confirmPasswordVisible}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        onFocus={() => clearError('confirmPassword')}
        mode="outlined"
        style={styles.input}
        placeholder="••••••••"
        placeholderTextColor="#94A3B8"
        error={!!errors.confirmPassword}
        right={<TextInput.Icon 
          icon={confirmPasswordVisible ? 'eye-off' : 'eye'} 
          onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
          color="#64748B"
        />}
        textColor="#020D07"
      />
      {errors.confirmPassword && <HelperText type="error" style={styles.errorText}>{errors.confirmPassword}</HelperText>}

      <Button
        mode="contained"
        onPress={handleCreateAccount}
        style={styles.signupButton}
        labelStyle={styles.buttonLabel}
        disabled={loading}
        contentStyle={styles.buttonContent}
      >
        {loading ? <ActivityIndicator color="#020D07" size={24} /> : 'Create Account'}
      </Button>

      <TouchableOpacity 
        onPress={() => navigation.navigate('LoginScreen')}
        style={styles.loginLinkContainer}
      >
        <Text style={styles.loginText}>
          Already have an account?{' '}
          <Text style={styles.loginLink}>Log in</Text>
        </Text>
      </TouchableOpacity>

      {errors.general && <HelperText type="error" style={styles.generalError}>{errors.general}</HelperText>}
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
  errorText: {
    color: '#020D07',
    backgroundColor: '#FED7D7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 8,
  },
  signupButton: {
    backgroundColor: '#B7FF11',
    borderRadius: 14,
    marginTop: 24,
    marginBottom: 32,
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
    height: 24,
  },
  buttonContent: {
    height: 56,
  },
  loginLinkContainer: {
    marginTop: 16,
  },
  loginText: {
    textAlign: 'center',
    color: '#020D07',
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    color: '#020D07',
    fontWeight: '600',
    textDecorationLine: 'underline',
    letterSpacing: 0.15,
  },
  generalError: {
    color: '#020D07',
    backgroundColor: '#FED7D7',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    textAlign: 'center',
    marginHorizontal: 24,
  },
});

export default CreateAccount;