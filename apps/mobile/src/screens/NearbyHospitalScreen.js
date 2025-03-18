import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Linking,
  ScrollView,
  FlatList,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

// Updated Theme Constants with professional palette
const COLORS = {
  primary: '#B7FF11',
  secondary: '#2D3047',
  background: '#F8F9FA',
  text: '#2D3047',
  textLight: '#6C757D',
  error: '#DC3545',
  white: '#FFFFFF',
  black: '#000000',
  accent: '#FF6B6B',
};

const FONTS = {
  regular: 'Inter-Regular',
  bold: 'Inter-Bold',
};

const SIZES = {
  base: 16,
  small: 14,
  large: 18,
  xLarge: 24,
};

const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
};

// Health-Related Amenity Types
const HEALTH_AMENITY_TYPES = [
  { label: 'Hospitals', value: 'hospital' },
  { label: 'Pharmacies', value: 'pharmacy' },
  { label: 'Clinics', value: 'clinic' },
  { label: 'Doctors', value: 'doctors' },
  { label: 'Dentists', value: 'dentist' },
  { label: 'Opticians', value: 'optician' },
];

// Custom Hook for Location and Amenities
const useLocationAndAmenities = (amenityType) => {
  const [location, setLocation] = useState(null);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setLoading(false);
          return;
        }

        let currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);

        if (currentLocation) {
          await fetchNearbyAmenities(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude,
            amenityType
          );
        }
      };

      fetchData();
    }, [amenityType])
  );

  const fetchNearbyAmenities = async (latitude, longitude, amenityType) => {
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];(node["amenity"="${amenityType}"](around:10000,${latitude},${longitude});way["amenity"="${amenityType}"](around:10000,${latitude},${longitude}););out;`;

    try {
      const response = await fetch(overpassUrl);
      const data = await response.json();

      if (data && data.elements) {
        const validAmenities = data.elements.filter((amenity) => amenity.lat && amenity.lon);
        setAmenities(validAmenities);
      } else {
        setErrorMsg('No valid data available');
      }
    } catch (error) {
      setErrorMsg('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return { location, amenities, loading, errorMsg };
};

// Optimized SearchBar Component with memoization
const SearchBar = React.memo(({ searchQuery, handleSearch, clearSearch, selectedAmenity, setSelectedAmenity }) => (
  <View style={styles.searchContainer}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.filterChipsContainer}
    >
      {HEALTH_AMENITY_TYPES.map((type) => (
        <TouchableOpacity
          key={type.value}
 style={[
            styles.filterChip,
            selectedAmenity === type.value && styles.filterChipActive,
          ]}
          onPress={() => setSelectedAmenity(type.value)}
          activeOpacity={0.7}
        >
          <MaterialCommunityIcons 
            name={getAmenityIcon(type.value)} 
            size={20} 
            color={selectedAmenity === type.value ? COLORS.white : COLORS.primary} 
          />
          <Text style={[
            styles.filterChipText,
            selectedAmenity === type.value && styles.filterChipTextActive,
          ]}>
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
    
    <View style={styles.searchBar}>
      <MaterialCommunityIcons 
        name="magnify" 
        size={24} 
        color={COLORS.textLight} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={styles.searchInput}
        placeholder={`Search ${selectedAmenity}s...`}
        placeholderTextColor={COLORS.textLight}
        value={searchQuery}
        onChangeText={handleSearch}
        autoCapitalize="none"
      />
      {searchQuery !== '' && (
        <TouchableOpacity 
          onPress={clearSearch} 
          style={styles.clearButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialCommunityIcons 
            name="close-circle" 
            size={20} 
            color={COLORS.textLight} 
          />
        </TouchableOpacity>
      )}
    </View>
  </View>
));

// Enhanced Details Panel with overlay
const AmenityDetailsPanel = ({ selectedAmenity, animation, closeDetails }) => {
  const overlayOpacity = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.4]
  });

  return (
    <>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]} />
      <Animated.View 
        style={[
          styles.detailsPanel,
          {
            transform: [{ 
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [400, 0]
              }) 
            }]
          }
        ]}
      >
        <View style={styles.panelHeader}>
          <Text style={styles.amenityName}>
            {selectedAmenity.tags?.name || 'Unnamed Amenity'}
          </Text>
          <TouchableOpacity 
            onPress={closeDetails} 
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons 
              name="close" 
              size={24} 
              color={COLORS.textLight} 
            />
          </TouchableOpacity>
        </View>

        <View style={styles.panelContent}>
          <InfoRow icon="map-marker" text={selectedAmenity.tags?.address || 'Address not available'} />
          <InfoRow icon="phone" text={selectedAmenity.tags?.phone || 'Phone not listed'} />
          
          {selectedAmenity.tags?.website && (
            <ActionButton
              icon="web"
              label="Visit Website"
              onPress={() => Linking.openURL(selectedAmenity.tags.website)}
            />
          )}
          
          <ActionButton
            icon="directions"
            label="Get Directions"
            onPress={() => openGoogleMaps(selectedAmenity.lat, selectedAmenity.lon)}
          />
        </View>
      </Animated.View>
    </>
  );
};

// Optimized main component with performance improvements
const NearbyHealthAmenitiesScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAmenity, setSelectedAmenity] = useState('hospital');
  const [selectedAmenityDetails, setSelectedAmenityDetails] = useState(null);
  const [animation] = useState(new Animated.Value(0));
  const { location, amenities, loading, errorMsg } = useLocationAndAmenities(selectedAmenity);

  const filteredAmenities = useMemo(() => {
    if (!searchQuery) return amenities;
    const query = searchQuery.toLowerCase();
    return amenities.filter(amenity => 
      amenity.tags?.name?.toLowerCase().includes(query) ||
      amenity.tags?.address?.toLowerCase().includes(query)
    );
  }, [searchQuery, amenities]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const openDetails = (amenity) => {
    setSelectedAmenityDetails(amenity);
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDetails = () => {
    Animated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setSelectedAmenityDetails(null));
  };

  const openGoogleMaps = (lat, lon) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`);
  };

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.loadingIndicator} />;
  }

  if (errorMsg) {
    return <Text style={styles.errorText}>{errorMsg}</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 0,
          longitude: location?.coords.longitude || 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {filteredAmenities.map((amenity) => (
          <Marker
            key={amenity.id}
            coordinate={{ latitude: amenity.lat, longitude: amenity.lon }}
            title={amenity.tags?.name}
            onPress={() => openDetails(amenity)}
          />
        ))}
      </MapView>

      <SearchBar
        searchQuery={searchQuery}
        handleSearch={handleSearch}
        clearSearch={clearSearch}
        selectedAmenity={selectedAmenity}
        setSelectedAmenity={setSelectedAmenity}
      />

      {selectedAmenityDetails && (
        <AmenityDetailsPanel
          selectedAmenity={selectedAmenityDetails}
          animation={animation}
          closeDetails={closeDetails}
        />
      )}
    </View>
  );
};

// New helper components
const InfoRow = ({ icon, text }) => (
  <View style={styles.infoRow}>
    <MaterialCommunityIcons 
      name={icon} 
      size={20} 
      color={COLORS.textLight} 
      style={styles.infoIcon} 
    />
    <Text style={styles.infoText}>{text}</Text>
  </View>
);

const ActionButton = ({ icon, label, onPress }) => (
  <TouchableOpacity 
    style={styles.actionButton} 
    onPress={onPress}
    activeOpacity={0.8}
  >
    <MaterialCommunityIcons 
      name={icon} 
      size={20} 
      color={COLORS.white} 
    />
    <Text style={styles.actionButtonText}>{label}</Text>
  </TouchableOpacity>
);

// Enhanced styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  map: {
    flex: 1,
  },
  searchContainer: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: SIZES.base,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.base,
    paddingVertical: SIZES.base / 2,
    borderRadius: 30,
    backgroundColor: COLORS.white,
    marginRight: SIZES.base / 2,
    ...SHADOWS.light,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    marginLeft: SIZES.base / 2,
    color: COLORS.text,
    fontFamily: FONTS.bold,
    fontSize: SIZES.small,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 15,
    paddingHorizontal: SIZES.base,
    height: 50,
    marginTop: SIZES.base,
    ...SHADOWS.medium,
  },
  detailsPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: SIZES.base,
    ...SHADOWS.medium,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.base,
    paddingHorizontal: SIZES.base * 1.5,
    borderRadius: 12,
    marginTop: SIZES.base,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
    textAlign: 'center',
    marginTop: SIZES.base,
  },
  overlay: {
    position: 'absolute',
     top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.black,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amenityName: {
    fontSize: SIZES.large,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  closeButton: {
    padding: SIZES.base / 2,
  },
  panelContent: {
    marginTop: SIZES.base,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SIZES.base / 2,
  },
  infoIcon: {
    marginRight: SIZES.base / 2,
  },
  infoText: {
    color: COLORS.textLight,
    fontSize: SIZES.small,
  },
  actionButtonText: {
    color: COLORS.white,
    marginLeft: SIZES.base / 2,
    fontSize: SIZES.small,
  },
});

// Helper function for amenity icons
const getAmenityIcon = (type) => {
  const icons = {
    hospital: 'hospital-building',
    pharmacy: 'pharmacy',
    clinic: 'stethoscope',
    doctors: 'doctor',
    dentist: 'tooth-outline',
    optician: 'glasses',
  };
  return icons[type] || 'map-marker';
};

export default NearbyHealthAmenitiesScreen;