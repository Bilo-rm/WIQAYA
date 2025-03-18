import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, Image, View, TouchableOpacity, Text } from "react-native";
import { useTheme } from "react-native-paper";

const AuthScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [displayText, setDisplayText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const animationRef = useRef(null);
  const currentIndex = useRef(0);
  const descriptionText = 'مساعدك الصحي الشخصي'; // Verified Arabic text
  const typingSpeed = 150;
  const delayAfterComplete = 5000;

  useEffect(() => {
    let mounted = true;
    
    const typeText = () => {
      if (!mounted) return;
      
      if (currentIndex.current < descriptionText.length) {
        setDisplayText(prev => 
          descriptionText.slice(0, currentIndex.current + 1)
        );
        currentIndex.current++;
        animationRef.current = setTimeout(typeText, typingSpeed);
      } else {
        animationRef.current = setTimeout(() => {
          currentIndex.current = 0;
          setDisplayText('');
          typeText();
        }, delayAfterComplete);
      }
    };

    typeText();

    return () => {
      mounted = false;
      clearTimeout(animationRef.current);
    };
  }, []);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: "#ffff" }]}>
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require("../../../assets/logo.png")}
          accessibilityLabel="App Logo"
        />
        <Text variant="headlineMedium" style={styles.appName}>
          وقاية
        </Text>
        <Text style={styles.appText}>
          {displayText}
          <Text style={[styles.cursor, { opacity: cursorVisible ? 1 : 0 }]}>|</Text>
        </Text>
      </View>

      <Text variant="bodyMedium" style={styles.description}>
        مرحبًا بك في وقاية!
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.navigate("LoginScreen")}
        accessibilityLabel="Log In"
      >
        <Text style={styles.buttonText}>تسجيل الدخول</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signUpButton}
        onPress={() => navigation.navigate("CreateAccount")}
        accessibilityLabel="Sign Up"
      >
        <Text style={styles.signUpButtonText}>إنشاء حساب</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => navigation.navigate("HomeScreen")}
        accessibilityLabel="Proceed Without an Account"
      >
        <Text style={styles.skipButtonText}>المتابعة بدون حساب</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
    padding: 20,
  },
  logo: {
    width: 140,
    height: 140,
    marginBottom: 20,
  },
  appName: {
    color: '#020D07',
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
  },
  cursor: {
    color: '#020D07',
    fontSize: 14,
  },
  appText: {
    color: '#020D07',
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
  description: {
    color: '#020D07',
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#D1FF66',
    borderRadius: 25,
    width: "80%",
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  signUpButton: {
    borderWidth: 1,
    borderColor: '#4A5497',
    borderRadius: 25,
    width: "80%",
    paddingVertical: 10,
    alignItems: "center",
  },
  buttonText: {
    color: '#020D07',
    fontSize: 16,
    fontWeight: "bold",
  },
  signUpButtonText: {
    color: '#020D07',
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 20,
  },
  skipButtonText: {
    color: '#020D07',
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default AuthScreen;