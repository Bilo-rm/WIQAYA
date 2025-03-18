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
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: confirmLogout, style: 'destructive' },
      ],
      { cancelable: true }
    );
  };

  const confirmLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert('Logged Out', 'You have successfully logged out.');
      navigation.navigate('LoginScreen');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
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
      'Change Password',
      'Enter your new password:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newPassword) => {
            try {
              await updatePassword(auth.currentUser, newPassword);
              Alert.alert('Success', 'Password updated successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to update password. Please try again.');
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
      'Update Email',
      'Enter your new email:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (newEmail) => {
            try {
              await updateEmail(auth.currentUser, newEmail);
              Alert.alert('Success', 'Email updated successfully.');
            } catch (error) {
              Alert.alert('Error', 'Failed to update email. Please try again.');
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
      <Text style={styles.header}>Settings</Text>

      <List.Section style={styles.section}>
        <List.Item
          title="Enable Notifications"
          right={() => (
            <Switch
              value={isNotificationsEnabled}
              onValueChange={toggleNotifications}
            />
          )}
        />
        <List.Item
          title="Dark Mode"
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
          title="Change Password"
          onPress={handleChangePassword}
        />
        <List.Item
          title="Update Email"
          onPress={handleUpdateEmail}
        />
        <List.Item
          title="Privacy Settings"
          onPress={() => navigation.navigate('PrivacySettingsScreen')}
        />
      </List.Section>

      <List.Section style={styles.section}>
        <List.Item
          title="Logout"
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
    color: '#2260FF',
    fontWeight: 'bold',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  logoutItem: {
    marginTop: 20,
    backgroundColor: '#FF5733',
    borderRadius: 10,
    paddingVertical: 10,
  },
  logoutText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});

export default SettingsScreen;