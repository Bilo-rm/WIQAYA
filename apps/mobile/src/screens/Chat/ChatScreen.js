import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native'; 
import Icon from 'react-native-vector-icons/FontAwesome';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OpenAIService from '../../services/OpenAIService';
import { auth } from '../../constants/FireBaseConfig';
import { fetchDocumentById } from '../../constants/firebaseFunctions';
import Markdown from 'react-native-markdown-display';

// Use the same COLORS object from the HealthDashboard
const COLORS = {
  primary: '#D1FF66',
  secondary: '#D1FF66',
  background: '#f3f4f6',
  white: '#FFFFFF',
  black: '#000',
  gray: '#E5E7EB',
  red: '#FF0263',
  pink: '#ec4899',
  blue: '#4A5497',
  green: '#22c55e',
  lightGray: '#D0D9FF',
  darkGray: '#ccc',
};

const ChatScreen = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const userId = auth.currentUser ?.uid;
  const scrollViewRef = useRef();

  useEffect(() => {
    if (!userId) {
      setLoadingMessages(false);
      return;
    }

    const loadMessages = async () => {
      try {
        const storedMessages = await AsyncStorage.getItem(`chat_${userId}`);
        if (storedMessages) {
          setMessages(JSON.parse(storedMessages));
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        Alert.alert( 'خطأ، فشل في تحميل تاريخ الدردشة.');
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [userId]);

  const saveMessages = useCallback(
    async (updatedMessages) => {
      if (!userId) return;
      try {
        await AsyncStorage.setItem(`chat_${userId}`, JSON.stringify(updatedMessages));
      } catch (error) {
        console.error('Error saving messages:', error);
        Alert.alert('خطأ، فشل في حفظ تاريخ الدردشة.');
      }
    },
    [userId]
  );

  const handleDeleteMessages = () => {
    Alert.alert(
      'حذف الدردشة',
      'هل أنت متأكد أنك تريد حذف جميع بيانات الدردشة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف',
          style: 'destructive',
          onPress: async () => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(async () => {
              setMessages([]);
              await AsyncStorage.removeItem(`chat_${userId}`);
              fadeAnim.setValue(1);
            });
          },
        },
      ]
    );
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      Alert.alert('لا يمكن أن تكون الرسالة فارغة!');
      return;
    }
  
    const userMessage = {
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sender: 'User',
      text: inputText,
      timestamp: new Date().toISOString(),
    };
  
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputText('');
    setIsLoading(true);
  
    try {
      const response = await fetch('http://192.168.10.157:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputText }),
      });
  
      const data = await response.json();
  
      if (data.response) {
        const aiMessage = {
          id: `${Date.now()}_AI_${Math.random().toString(36).substr(2, 9)}`,
          sender: 'AI',
          text: data.response,
          timestamp: new Date().toISOString(),
        };
  
        setMessages((prevMessages) => [...prevMessages, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('خطأ، فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
      Keyboard.dismiss();
    }
  };
  
/*
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputText('');
    setIsLoading(true);

    try {
      await saveMessages(updatedMessages);

      const [user, lifestyle, medicalHistory] = await Promise.all([
        fetchDocumentById('users', userId),
        fetchDocumentById('lifestyle', userId),
        fetchDocumentById('medicalHistory', userId),
      ]);

      const aiResponse = await OpenAIService.sendMessage(updatedMessages, userId, {
        user,
        lifestyle,
        medicalHistory,
      });

      if (aiResponse) {
        const aiMessage = {
          id: `${Date.now()}_AI_${Math.random().toString(36).substr(2, 9)}`,
          sender: 'AI',
          text: aiResponse,
          timestamp: new Date().toISOString(),
        };

        const finalMessages = [...updatedMessages, aiMessage];
        setMessages(finalMessages);
        await saveMessages(finalMessages);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('خطأ، فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
      Keyboard.dismiss();
    }
  };*/

  const renderMessage = (msg) => (
    <View
      key={msg.id}
      style={[
        styles.messageRow,
        msg.sender === 'User ' ? styles.userMessageRow : styles.aiMessageRow,
      ]}
    >
      {msg.sender === 'AI' && (
        <Image
          source={require('../../../assets/ai-avatar.png')}
          style={styles.avatar}
        />
      )}
      <View
        style={[
          styles.messageBubble,
          msg.sender === 'User ' ? styles.userBubble : styles.aiBubble,
        ]}
      >
        {msg.sender === 'AI' ? (
          <Markdown
            style={{
              body: { fontSize: 14, color: COLORS.black },
              strong: { fontWeight: 'bold' },
              heading1: { fontSize: 20, fontWeight: 'bold' },
              bullet_list: { marginVertical: 5 },
            }}
          >
            {msg.text}
          </Markdown>
        ) : (
          <Text style={styles.userText}>{msg.text}</Text>
        )}
      </View>
      {msg.sender === 'User ' && (
        <Image
          source={require('../../../assets/male-avatar.png')}
          style={styles.avatar}
        />
      )}
    </View>
  );

  if (loadingMessages) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color={COLORS.blue} />
        <Text style={styles.loadingText}>جاري تحميل الدردشة...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
       <View style={styles.header}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteMessages}>
          <Text style={styles.deleteButtonText}>حذف</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.chatContainer}
        ref={scrollViewRef}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {messages.map(renderMessage)}
        </Animated.View>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.blue} />
            <Text style={styles.loadingText}>دكتور جي بي تي يكتب...</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="اسأل دكتور الذكاء الاصطناعي ......"
          placeholderTextColor={COLORS.darkGray}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.disabledButton]}
          onPress={!isLoading ? handleSendMessage : null}
          disabled={isLoading}
        >
          <Icon name="paper-plane" size={25} color={COLORS.primary} />
          <Text style={styles.sendButtonText}>إرسال</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 60,
    backgroundColor: "transparent",
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomColor: COLORS.gray,
  },
  headerText: {
    fontSize: 20,
    color: COLORS.black,
    fontWeight: '600',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  aiMessageRow: {
    justifyContent: 'flex-start',
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 15,
    borderRadius: 20,
  },
  aiBubble: {
    backgroundColor: COLORS.lightGray,
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: COLORS.black,
    alignSelf: 'flex-end',
  },
  aiText: {
    color: COLORS.black,
    fontSize: 16,
  },
  userText: {
    color: COLORS.white,
    fontSize: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    backgroundColor: COLORS.white,
  },
  input: {
    flex: 1,
    minHeight: 45,
    maxHeight: 100,
    backgroundColor: COLORS.background,
    borderRadius: 22.5,
    paddingHorizontal: 15,
    fontSize: 16,
    color: COLORS.black,
    paddingTop: 12,
  },
  sendButton: {
    backgroundColor: COLORS.black,
    borderRadius: 22.5,
    paddingVertical: 5,
    paddingHorizontal: 20,
    marginLeft: 10,
  },
  sendButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: COLORS.darkGray,
  },
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.blue,
  },
  deleteButton: {
    position: 'absolute',
    right: 15,
    top: 15,
    padding: 15,
    backgroundColor: COLORS.black,
    borderRadius: 5,
    
  },
  deleteButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default ChatScreen;