import React, { useState, useEffect } from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, Menu, IconButton, Divider } from 'react-native-paper';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { FontAwesome } from '@expo/vector-icons';


// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import AuthScreen from './src/screens/Auth/AuthScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import ForgotPassword from './src/screens/Auth/ForgotPassword';
import CreateAccount from './src/screens/Auth/CreateAccount';



import HomeScreen from './src/screens/HomeScreen';
import NearbyHospitalScreen from './src/screens/NearbyHospitalScreen';
import ProfileScreen from './src/screens/Profile/ProfileScreen';
import ChatScreen from './src/screens/Chat/ChatScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import NotificationScreen from './src/screens/NotificationScreen';




import { auth, onAuthStateChanged } from './src/constants/FireBaseConfig'; // Firebase Authentication
import 'react-native-gesture-handler'; // Ensure gesture handler is imported
import 'react-native-reanimated'; // Ensure Reanimated is imported

// Ignore specific log messages
LogBox.ignoreLogs([
  'Support for defaultProps will be removed from function components in a future major release.',
]);

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const App = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Firebase auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUserData(firebaseUser); // Store Firebase user data if logged in
      } else {
        setUserData(null); // Clear user data if not logged in
      }
      setLoading(false); // Set loading to false after auth check
    });
    return () => unsubscribe(); // Cleanup on component unmount
  }, []);

  if (loading) {
    return null; // Return null or loading spinner while auth is in progress
  }

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={'WelcomeScreen'}>
          {/* Authentication Flow */}
          <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="AuthScreen" component={AuthScreen} options={{ headerShown: false }} />
          <Stack.Screen name="LoginScreen" component={LoginScreen} options={{ title: 'Login' }} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ title: 'Reset Password' }} />
          <Stack.Screen name="CreateAccount" component={CreateAccount} options={{ title: 'Create Account' }} />

          {/* Main App Screens */}
          <Stack.Screen name="HomeScreen" component={Tabs} options={{ headerShown: false }} />
          <Stack.Screen name="DR.GPT" component={ChatScreen} options={{ title: "الدكتور جي بي تي" }} />
          <Stack.Screen name="NearbyHospitalScreen" component={NearbyHospitalScreen} options={{ title: "المستشفى القريب" , headerStyle: {backgroundColor: '#D1FF66', },headerTintColor: '#000000',}} />
          <Stack.Screen name="SettingsScreen" component={SettingsScreen} options={{ title: 'الإعدادات' , headerStyle: {backgroundColor: '#D1FF66', },headerTintColor: '#000000',}} />
          <Stack.Screen name="NotificationScreen" component={NotificationScreen} options={{ title: 'إشعار' , headerStyle: {backgroundColor: '#D1FF66', },headerTintColor: '#000000', }} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: "الملف الشخصي" , headerStyle: {backgroundColor: '#D1FF66', },headerTintColor: '#000000',}} />
          

         </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
};

const Tabs = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  const handleNavigation = (screen) => {
    navigation.navigate(screen);
    closeMenu();
  };

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: { backgroundColor: '#D1FF66' },
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#000',
        headerStyle: { backgroundColor: '#D1FF66' },
        headerTintColor: '#000',
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      {/* Tab for Home */}
      <Tab.Screen
        name="الشاشة الرئيسية"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" color={color} size={size} />
          ),
          headerShown: false,
        }}
      />
      
      {/* Tab for DR.GPT */}
      <Tab.Screen
        name="الدكتور جي بي تي"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="comments" color={color} size={size} />
          ),
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={<IconButton icon="dots-vertical" size={30} onPress={openMenu} />}
              style={{ color: '#FFF', position: 'absolute', top: 100, right: 15, left: 125 }}
            >
              <Menu.Item onPress={() => handleNavigation('SettingsScreen')} title="الإعدادات" />
              <Menu.Item onPress={() => handleNavigation('ProfileScreen')} title="الملف الشخصي" />
              <Menu.Item onPress={() => handleNavigation('NotificationScreen')} title="إشعار" />
              <Menu.Item onPress={() => handleNavigation('NearbyHospitalScreen')} title="المستشفى القريب" />
            </Menu>
          ),
        }}
      />

      

      {/* Tab for Nearby Hospitals and Doctors */}
      <Tab.Screen
        name="المستشفى القريب"
        component={NearbyHospitalScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="hospital-o" color={color} size={size} />
          ),
          headerRight: () => (
            <Menu
              visible={menuVisible}
              onDismiss={closeMenu}
              anchor={<IconButton icon="dots-vertical" size={30} onPress={openMenu} />}
              style={{ color: '#FFF', position: 'absolute', top: 100, right: 15, left: 125 }}
            >
              <Menu.Item onPress={() => handleNavigation('SettingsScreen')} title="الإعدادات" />
              <Menu.Item onPress={() => handleNavigation('ProfileScreen')} title="الملف الشخصي" />
              <Menu.Item onPress={() => handleNavigation('NearbyHospitalScreen')} title="المستشفى القريب" />
              <Menu.Item onPress={() => handleNavigation('NotificationScreen')} title='إشعار' />
            </Menu>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default App;
