import React, { useState, useEffect ,useRef } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Animated, Dimensions, Modal, PanResponder } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { auth, onAuthStateChanged } from '../constants/FireBaseConfig'; 
import { fetchDocumentById } from "../constants/firebaseFunctions";
import axios from 'axios';

// Define color constants for consistent styling
const COLORS = {
  primary: '#D1FF66',
  background: '#f3f4f6',
  white: '#FFFFFF',
  black: '#000',
  red: '#FF6B6B',
  gray: '#E5E7EB',
};

// Main screen component
const HomeScreen = () => {
  const navigation = useNavigation();

  // State variables to manage component state
  const [searchQuery, setSearchQuery] = useState('');
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(1));
  const [menuVisible, setMenuVisible] = useState(false);
  const [timeRange, setTimeRange] = useState('weekly');
  const [modalVisible, setModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [riskResults, setRiskResults] = useState(null);
  const [userName, setUserName] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState({ x: 0, y: 0, value: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const userId = auth.currentUser  ? auth.currentUser .uid : null;


  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser ) => {
      console.log("Auth state changed, user:", firebaseUser );
      if (firebaseUser ) {
        fetchUserData(firebaseUser .uid);
      } else {
        setUserName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchUserData = async (userId) => {
    if (!userId) {
      console.error('No user ID found');
      return;
    }

    try {
      const userData = await fetchDocumentById('users', userId);
      if (userData && userData.name) {
        setUserName(userData.name);
        fetchHealthTips(userId);
      } else {
        throw new Error('No user data found for the provided userId');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage('Failed to load user data. Please try again.');
    }
  };

  // Generate sample data based on time range
  const generateChartData = (range) => {
    const baseData = {
      weekly: {
        labels: ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت', 'الأحد'],
        heartRate: [0, 70, 72, 75, 78, 76, 74, 73],
        bloodPressure: [0, 118, 122, 125, 130, 128, 135, 132],
      },
      monthly: {
        labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
        heartRate: [71, 73, 76, 75],
        bloodPressure: [120, 125, 130, 128],
      },
    };

    return {
      labels: baseData[range].labels,
      heartRate: baseData[range].heartRate,
      bloodPressure: baseData[range].bloodPressure,
    };
  };

  // Handlers for various actions
  const handleSearchChange = (text) => setSearchQuery(text);
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  const handleNavigation = (screen) => {
    navigation.navigate(screen);
    closeMenu();
  };

  const handleCheckHealth = async () => {
    try {
      // Prepare the data to be sent to the API
      const healthData = {
        age: parseInt(age),
        weight: parseInt(weight),
        bp: bloodPressure,
        heartRate: parseInt(heartRate),
      };
  
      console.log('Sending health data:', healthData);
  
      // Make a POST request to the /predict endpoint
      const response = await axios.post('http://192.168.10.157:5000/predict', healthData);
  
      console.log('Health check response:', response.data);
  
      // Extract the response data
      const { diabetes_risk, hypertension_risk, advice } = response.data;
  
      // Update the state with the results
      setRiskResults({
        diabetesRisk: diabetes_risk,
        hypertensionRisk: hypertension_risk,
        tips: advice,
      });
    } catch (error) {
      console.error('Error during health check:', error.response?.data || error.message);
      setErrorMessage('Failed to check health. Please try again.');
    }
  };
  // PanResponder for touch events
  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        const chartWidth = Dimensions.get('window').width - 32;
        const data = generateChartData(timeRange);

        // Calculate index of the nearest data point
        const index = Math.floor((locationX / chartWidth) * data.labels.length);
        if (index >= 0 && index < data.labels.length) {
          const value = {
            heartRate: data.heartRate[index],
            bloodPressure: data.bloodPressure[index],
          };
          setTooltipData({
            x: locationX,
            y: locationY,
            value: `السكري  : ${value.heartRate}, ضغط الدم: ${value.bloodPressure}`,
          });
          setTooltipVisible(true);
        }
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setTooltipData((prev) => ({ ...prev, x: locationX, y: locationY }));
      },
      onPanResponderRelease: () => {
        setTooltipVisible(false);
      },
    })
  ).current;

  // Scaling factor for heart rate to match blood pressure scale
  const heartRateScalingFactor = 1; // Adjust this factor based on your data range

  const riskResultsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (riskResults) {
      Animated.timing(riskResultsAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      riskResultsAnim.setValue(0);
    }
  }, [riskResults]);
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
         <View style={styles.headerRow}>
         </View>
    
        <Text style={styles.headerText}>مرحبًا {userName}!</Text> 
        <Text style={styles.subtitle}>لنضع صحتك في المقام الأول اليوم.</Text>
      </View>

      {/* Main Content Section */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated Quote Section */}
        {quoteVisible && (
          <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
            <Text style={styles.quoteText}> مؤشر خطر الأصابة :</Text>
          </Animated.View>
        )}


        {/* Enhanced Chart Section */}
        <View style={styles.graphContainer} {...panResponder.panHandlers}>
          <View style={styles.timeFilters}>
            {['weekly', 'monthly'].map((range, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterButton,
                  timeRange === range ? styles.activeFilter : styles.inactiveFilter,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.filterText,
                    timeRange === range ? styles.activeFilterText : styles.inactiveText,
                  ]}
                >
                  {index === 0 ? 'أسبوع' : 'شهر'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>



          {/* Enhanced Health Data Chart */}
          <LineChart
            data={{
              labels: generateChartData(timeRange).labels,
              datasets: [
                {
                  data: generateChartData(timeRange).bloodPressure,
                  color: (opacity = 1) => `rgba(255,107,107,${opacity})`, // Coral red
                  strokeWidth: 3,
                  withDots: true,
                  withShadow: true,
                  dashed: false,
                },
                {
                  data: generateChartData(timeRange).heartRate.map(hr => hr * heartRateScalingFactor),
                  color: (opacity = 1) => `rgba(209,255,102,${opacity})`, // Neon lime
                  strokeWidth: 3,
                  withDots: true,
                  withShadow: true,
                  dashed: true, // Add dashed effect for differentiation
                },
              ],
            }}
            width={Dimensions.get('window').width - 32}
            height={260}
            chartConfig={{
              backgroundGradientFrom: "#2A2F4F", // Dark navy
              backgroundGradientTo: "#4A506B", // Medium navy
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              labelColor: (opacity = 1) => `rgba(255,255,255,${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "5",
                strokeWidth: "2",
                stroke: "#FFFFFF",
                fill: "#FFFFFF",
              },
              propsForBackgroundLines: {
                stroke: "rgba(255,255,255,0.2)",
                strokeDasharray: "",
              },
              propsForLabels: {
                fontWeight: "bold",
                fontSize: 12
              },
              yAxisLabel: '',
              yAxisSuffix: '',
              yAxisInterval: 1,
              fillShadowGradient: '#FFFFFF',
              fillShadowGradientOpacity: 0.1,
            }}
            bezier
            style={styles.chart}
          />

          
      <View style={styles.legendContainer}>
           <View style={styles.legendItem}>
             <View style={[styles.legendColorBox, { backgroundColor: COLORS.primary }]} />
             <Text style={styles.legendText}>  السكري</Text>
           </View>
           <View style={styles.legendItem}>
             <View style={[styles.legendColorBox, { backgroundColor: COLORS.red }]} />
             <Text style={styles.legendText}>ضغط الدم</Text>
           </View>
         </View>

        </View>

        {/* Enhanced Tooltip */}
        {tooltipVisible && (
          <Animated.View style={[styles.tooltipContainer, { left: tooltipData.x - 100, top: tooltipData.y - 60 }]}>
            <View style={styles.tooltipPointer}/>
            <View style={styles.tooltipContent}>
              <Text style={styles.tooltipText}>{tooltipData.value}</Text>
              <View style={styles.tooltipLine}/>
              <View style={styles.tooltipFooter}>
                <Text style={styles.tooltipDate}>{new Date().toLocaleDateString('ar-EG')}</Text>
                <TouchableOpacity onPress={() => setTooltipVisible(false)}>
                  <Icon name="times-circle" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Health Check Modal */}
      <View style={styles.container}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>تقييم الصحة</Text>
          <Text style={styles.aiTitle}>تحليل الصحة بواسطة الذكاء الاصطناعي</Text>
          <TextInput
            style={styles.input}
            placeholder="الوزن (كجم)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="العمر (سنوات)"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="معدل ضربات القلب"
            value={heartRate}
            onChangeText={setHeartRate}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="ضغط الدم"
            value={bloodPressure}
            onChangeText={setBloodPressure}
          />

          <TouchableOpacity style={styles.checkButton} onPress={handleCheckHealth}>
            <Text style={styles.checkButtonText}>تحقق</Text>
          </TouchableOpacity>

          {riskResults && (
            <Animated.View style={[styles.resultsContainer, { opacity: riskResultsAnim }]}>
              <View style={styles.resultCard}>
                <Text style={styles.resultTitle}>نتائج التحليل</Text>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>مخاطر ارتفاع ضغط الدم:</Text>
                  <Text style={styles.resultValue}>{riskResults.hypertensionRisk}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>مخاطر السكري:</Text>
                  <Text style={styles.resultValue}>{riskResults.diabetesRisk}</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={styles.resultLabel}>نصائح:</Text>
                  <Text style={styles.resultTips}>{riskResults.tips}</Text>
                </View>
              </View>
            </Animated.View>
          )}



          {/* the fuction here is still for closing when we had modal, we should chnage it to function for watch integration */}
          <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>الحصول على البيانات من الساعة الذكية</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* <PedometerTracker /> */}
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  // Main container style
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: 30,
  },


  // Header styles
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  headerText: {
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: 32,
    paddingTop: 50,
  },
  subtitle: {
    color: COLORS.black,
    textAlign: 'right',
    fontSize: 16,
    marginTop: 5,
  },
  icon: {
    backgroundColor: COLORS.primary,
    color: COLORS.black,
  },



  // Chart container styles
  graphContainer: {
    backgroundColor:'#2A2F4F',
    margin: 16,
    borderRadius: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    overflow: 'hidden',
  },
  timeFilters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 8,
  },
   legendContainer: {
     flexDirection: 'row',
     justifyContent: 'space-around',
     padding: 10,
     backgroundColor: "#2A2F4F",
     borderBottomWidth: 1,
     borderBottomColor: COLORS.gray,
   },
   legendColorBox: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderRadius: 25,
  },
  legend: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 9,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 5,
  },
  legendText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  quoteCard: {
    backgroundColor: COLORS.transparent,
    borderColor: COLORS.black,
    borderWidth: 1,
    padding: 8,
    margin: 13,
    borderRadius: 10,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    justifyContent: 'right',
    alignItems: 'right',
  },
  quoteText: {
    color: COLORS.black,
    fontSize: 13,
    textAlign: 'right',
  },
  filterButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 5,
  },
  filterText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 14,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  activeFilterText: {
    color: COLORS.black,
  },

  inactiveFilter: {
    backgroundColor: '#4A506B', 
  },
  inactiveText: {
    color: '#FFFFFF',
  },



  chart: {
    marginVertical: 10,
    paddingRight: 10,
    paddingTop: 20,
    marginBottom: 40,
  },
  chartHeader: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 15,
  },

  
  // Tooltip styles
  tooltipContainer: {
    position: 'absolute',
    backgroundColor: 'rgba(42,47,79,0.95)',
    borderRadius: 10,
    padding: 12,
    width: 200,
    zIndex: 1000,
    elevation: 10,
  },
  tooltipPointer: {
    position: 'absolute',
    top: -10,
    left: '50%',
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(42,47,79,0.95)',
    transform: [{ translateX: -10 }],
  },
  tooltipContent: {
    position: 'relative',
    zIndex: 1001,
  },
  tooltipText: {
    color: '#FFF',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  tooltipLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginVertical: 8,
  },
  tooltipFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tooltipDate: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
  },
  closeTooltip: {
    color: 'red',
    marginTop: 5,
    textAlign: 'right',
  },
  // AI Analysis Card styles
  aiCard: {
    backgroundColor: COLORS.transparent,
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    elevation: 3,
    borderBlockColor: COLORS.black,
    borderBlockWidth: 1,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  aiButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 8,
    elevation: 2,
  },
  aiButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  


  // Modal styles
  modalContainer: {
    flex: 1,
    width: '94%',
    borderRadius: 22,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginTop: 40,
  },
  modalContent: {
    width: '90%',
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    position: 'absolute',
    bottom: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
    paddingBottom: 20,
    },
  input: {
    height: 40,
    borderColor: COLORS.gray,
    color: "red",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '85%',
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '85%',
  },
  checkButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 20,
    alignItems: 'center',
    width: '100%',
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 10,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2A2F4F',
    textAlign: 'center',
    marginBottom: 15,
    writingDirection: 'rtl', // Right-to-left text direction
  },
  resultItem: {
    flexDirection: 'row-reverse', // Reverse the row direction for Arabic layout
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  resultLabel: {
    fontSize: 16,
    color: '#4A506B',
    fontWeight: '600',
    textAlign: 'right', // Align Arabic text properly
    writingDirection: 'rtl',
    flex: 1, // Allow text to wrap inside container
  },
  resultValue: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: 'bold',
    textAlign: 'left',
    writingDirection: 'rtl',
    flexShrink: 1, // Prevents overflowing
  },
  resultTips: {
    fontSize: 14,
    color: '#4A506B',
    lineHeight: 22,
    textAlign: 'right',
    marginTop: 10,
    writingDirection: 'rtl',
    flexWrap: 'wrap', // Ensure text wraps inside the container
    overflow: 'hidden', // Prevent text from overflowing
  },


  closeButton: {
    width: '85%',
    textAlign: 'center',
    color: COLORS.black,
    marginTop: 15,
    fontWeight: 'bold',
    padding: 10,
    borderRadius: 5,
    borderColor: COLORS.black,
    borderWidth: 1,
    marginBottom: 40,
  },
  closeButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
    alignContent: 'center',
    textAlign: 'center',
  },
});

export default HomeScreen;