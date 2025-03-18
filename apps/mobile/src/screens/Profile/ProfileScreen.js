import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { Button } from "react-native-paper";
import { deleteUser } from "firebase/auth";
import { auth } from "../../constants/FireBaseConfig";
import { fetchDocumentById } from "../../constants/firebaseFunctions";

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [userName, setUserName] = useState("");
  const [userPhoto, setUserPhoto] = useState("");
  const [loading, setLoading] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

  const menuItems = [
    { title: "Personal Information", screen: "UserInformationScreen", icon: "person-outline" },
    { title: "Lifestyle Information", screen: "LifestyleScreen", icon: "fitness-outline" },
    { title: "Medical History", screen: "MedicalHistoryScreen", icon: "medkit-outline" },
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userData = await fetchDocumentById("users", user.uid);
          setUserName(userData?.name || "User");
          setUserPhoto(userData?.photoUrl || "");
        }
      } catch (error) {
        Alert.alert("Error", "Failed to load user profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const user = auth.currentUser;
              if (user) {
                await deleteUser(user);
                navigation.navigate("LoginScreen");
              }
            } catch (error) {
              Alert.alert("Error", "Failed to delete account");
            }
          },
        },
      ]
    );
  };

  const renderSection = (title, items) => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={styles.itemContainer}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={styles.itemContent}>
            <Icon name={item.icon} size={24} color="#020D07" style={styles.itemIcon} />
            <Text style={styles.itemText}>{item.title}</Text>
          </View>
          <Icon name="chevron-forward" size={24} color="#020D07" />
        </TouchableOpacity>
      ))}
    </View>
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.profileContainer}>
            {loading ? (
              <ActivityIndicator size="large" color="#020D07" />
            ) : (
              <>
                {userPhoto ? (
                  <Image source={{ uri: userPhoto }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {userName.charAt(0).toUpperCase() || "A"}
                    </Text>
                  </View>
                )}
                <Text style={styles.profileName}>{userName}</Text>
              </>
            )}
          </View>

          {renderSection("Account Settings", menuItems)}

          <Button
            mode="contained"
            style={styles.deleteButton}
            labelStyle={styles.deleteButtonText}
            onPress={handleDeleteAccount}
          >
            Delete Account
          </Button>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 32,
  },
  profileContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#B7FF11',
  },
  avatarPlaceholder: {
    backgroundColor: '#E2E8F0',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarText: {
    color: '#020D07',
    fontSize: 48,
    fontWeight: '700',
  },
  profileName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#020D07',
    letterSpacing: -0.5,
  },
  sectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#020D07',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  itemContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 16,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#020D07',
  },
  deleteButton: {
    backgroundColor: '#FED7D7',
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 40,
    elevation: 2,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default ProfileScreen;