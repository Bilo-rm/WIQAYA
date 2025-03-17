import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Keyboard } from 'react-native';
import { TextInput, Button, Text, HelperText, IconButton } from 'react-native-paper';
import * as Google from 'expo-auth-session/providers/google';
import { auth, GoogleAuthProvider, signInWithCredential, signInWithEmailAndPassword } from '../../constants/FireBaseConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Importing MaterialCommunityIcons for Google icon

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isGoogleLoggingIn, setGoogleLoggingIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      setGoogleLoggingIn(true);
      signInWithCredential(auth, credential)
        .then((userCredential) => {
          console.log('User  signed in with Google', userCredential.user);
          setGoogleLoggingIn(false);
          navigation.navigate('HomeScreen');
        })
        .catch((error) => {
          setGoogleLoggingIn(false);
          console.error('Google Sign-In error:', error);
          setErrorMessage('Google login failed. Please try again.');
        });
    }
  }, [response]);

  const handleGoogleLogin = async () => {
    if (request) {
      setErrorMessage('');
      try {
        await promptAsync();
      } catch (error) {
        console.error("Google login failed", error);
        setErrorMessage('Google login failed. Please try again.');
      }
    } else {
      console.log("Google request not available.");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please fill in both fields.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    Keyboard.dismiss();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error("Login error:", error);
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error) => {
    switch (error.code) {
      case 'auth/wrong-password':
        setErrorMessage('Incorrect password. Please try again.');
        break;
      case 'auth/user-not-found':
        setErrorMessage('No account found with this email.');
        break;
      case 'auth/invalid-credential':
        setErrorMessage('Invalid credentials. Please check your email and password.');
        break;
      case 'auth/invalid-email':
        setErrorMessage('Please enter a valid email address.');
        break;
      default:
        setErrorMessage('Login failed. Please try again later.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>
      <Text style={styles.subtitle}>Welcome Back</Text>

      {errorMessage && <HelperText type="error" visible>{errorMessage}</HelperText>}

      <TextInput 
        label="Email" 
        value={email} 
        onChangeText={setEmail} 
        mode="outlined" 
        style={styles.input}
        placeholder="example@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        returnKeyType="next"
        error={errorMessage.includes("email")}
        textColor="#020D07"
      />

      <TextInput 
        label="Password" 
        secureTextEntry={secureTextEntry} 
        value={password} 
        onChangeText={setPassword} 
        mode="outlined" 
        style={styles.input}
        placeholder="********"
        right={<TextInput.Icon icon={secureTextEntry ? "eye-off" : "eye"} onPress={() => setSecureTextEntry(!secureTextEntry)} />}
 error={errorMessage.includes("password")}
        textColor="#020D07"
      />

      <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <Button 
        mode="contained" 
        onPress={handleLogin} 
        style={styles.loginButton} 
        disabled={loading}
        labelStyle={styles.buttonLabel}
      >
        {loading ? <ActivityIndicator size="small" color="#020D07" /> : "Log In"}
      </Button>

      <Text style={styles.orText}>or Sign in with</Text>

      <View style={styles.socialContainer}>
        <TouchableOpacity 
          style={styles.googleButton} 
          onPress={handleGoogleLogin} 
          disabled={loading || isGoogleLoggingIn || !request}
        >
          <MaterialCommunityIcons name="google" size={24} color="#020D07" />
          <Text style={styles.googleButtonText}>Sign in with Google</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate('CreateAccount')}>
        <Text style={styles.signUpText}>Don’t have an account? <Text style={styles.signUpLink}>Sign Up</Text></Text>
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
  forgotPassword: {
    textAlign: 'right',
    color: '#020D07',
    marginBottom: 24,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 8,
  },
  loginButton: {
    backgroundColor: '#B7FF11',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 24,
    elevation: 4,
  },
  buttonLabel: {
    color: '#020D07',
    fontWeight: '600',
    fontSize: 16,
  },
  orText: {
    color: '#020D07',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginVertical: 20,
  },
  socialContainer: {
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    color: '#020D07',
    fontSize: 16,
    marginLeft: 8,
  },
  signUpText: {
    textAlign: 'center',
    color: '#020D07',
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  signUpLink: {
    color: '#020D07',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default LoginScreen;