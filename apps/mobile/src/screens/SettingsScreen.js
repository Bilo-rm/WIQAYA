import React, { useState } from 'react';
import { View, StyleSheet, Switch, Text, Alert } from 'react-native';
import { List } from 'react-native-paper';
import { signOut, updatePassword, updateEmail } from 'firebase/auth';
import { auth } from '../constants/FireBaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = ({ navigation }) => {
  const [isNotificationsEnabled, setIsNotificationsEnabled] = useState(false);
  const [isDarkModeEnabled, setIsDarkModeEnabled] = useState(false);

  // Load saved preferences on component mount
  React.useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const notificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
      const darkModeEnabled = await AsyncStorage.getItem('darkModeEnabled');
      setIsNotificationsEnabled(notificationsEnabled === 'true');
      setIsDarkModeEnabled(darkModeEnabled === 'true');
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', onPress: confirmLogout, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('تم تسجيل الخروج', 'تم تسجيل الخروج بنجاح.');
      navigation.navigate('LoginScreen');
    } catch (error) {
      Alert.alert('خطأ', 'فشل في تسجيل الخروج. يرجى المحاولة مرة أخرى.');
      console.error('Logout Error:', error);
    }
  };

  const toggleNotifications = async () => {
    const newValue = !isNotificationsEnabled;
    setIsNotificationsEnabled(newValue);
    try {
      await AsyncStorage.setItem('notificationsEnabled', newValue.toString());
      // Add logic to update backend with notification preferences
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  };

  const toggleDarkMode = async () => {
    const newValue = !isDarkModeEnabled;
    setIsDarkModeEnabled(newValue);
    try {
      await AsyncStorage.setItem('darkModeEnabled', newValue.toString());
      // Add logic to apply dark/light theme
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  };

  const handleChangePassword = async () => {
    Alert.prompt(
      'تغيير كلمة المرور',
      'أدخل كلمة مرورك الجديدة:',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: async (newPassword) => {
            try {
              await updatePassword(auth.currentUser, newPassword);
              Alert.alert('نجاح', 'تم تحديث كلمة المرور بنجاح.');
            } catch (error) {
              Alert.alert('خطأ', 'فشل في تحديث كلمة المرور. يرجى المحاولة مرة أخرى.');
              console.error('Password Update Error:', error);
            }
          },
        },
      ],
      'secure-text'
    );
  };

  const handleUpdateEmail = async () => {
    Alert.prompt(
      'تحديث البريد الإلكتروني',
      'أدخل بريدك الإلكتروني الجديد:',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حفظ',
          onPress: async (newEmail) => {
            try {
              await updateEmail(auth.currentUser, newEmail);
              Alert.alert('نجاح', 'تم تحديث البريد الإلكتروني بنجاح.');
            } catch (error) {
              Alert.alert('خطأ', 'فشل في تحديث البريد الإلكتروني. يرجى المحاولة مرة أخرى.');
              console.error('Email Update Error:', error);
            }
          },
        },
      ],
      'email-address'
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}></Text>

      <List.Section style={styles.section}>
        <List.Item
          title="تمكين الإشعارات"
          right={() => (
            <Switch
              value={isNotificationsEnabled}
              onValueChange={toggleNotifications}
            />
          )}
        />
        <List.Item
          title="الوضع المظلم"
          right={() => (
            <Switch
              value={isDarkModeEnabled}
              onValueChange={toggleDarkMode}
            />
          )}
        />
      </List.Section>

      <List.Section style={styles.section}>
        <List.Item
          title="تغيير كلمة المرور"
          onPress={handleChangePassword}
        />
        <List.Item
          title="تحديث البريد الإلكتروني"
          onPress={handleUpdateEmail}
        />
        <List.Item
          title="إعدادات الخصوصية"
          onPress={() => navigation.navigate('PrivacySettingsScreen')}
        />
      </List.Section>

      <List.Section style={styles.section}>
        <List.Item
          title="تسجيل الخروج"
          onPress={handleLogout}
          style={styles.logoutItem}
          titleStyle={styles.logoutText}
        />
      </List.Section>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    color: '#000',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  logoutItem: {
    marginTop: 20,
    backgroundColor: '#D1FF66',
    borderRadius: 10,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#000',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
