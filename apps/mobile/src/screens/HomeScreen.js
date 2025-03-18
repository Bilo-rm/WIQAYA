import React, { useState, useEffect } from 'react';
import { LineChart } from 'react-native-chart-kit';
import { View, ScrollView, Text, TouchableOpacity, StyleSheet, TextInput, Animated, Dimensions, Modal, PanResponder } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';
import { Menu, Divider } from 'react-native-paper';
import { auth, onAuthStateChanged } from '../constants/FireBaseConfig'; 
import { fetchDocumentById } from "../constants/firebaseFunctions";

// Define color constants for consistent styling
const COLORS = {
  primary: '#D1FF66',
  background: '#f3f4f6',
  white: '#FFFFFF',
  black: '#000',
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
        heartRate: [70, 72, 75, 78, 76, 74, 73],
        bloodPressure: [118, 122, 125, 130, 128, 135, 132],
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

  const handleCheckHealth = () => {
    const hypertensionRisk = (parseInt(weight) + parseInt(age)) % 100;
    const diabetesRisk = (parseInt(weight) + parseInt(age)) % 50;

    setRiskResults({
      hypertensionRisk,
      diabetesRisk,
      tips: "زيادة النشاط البدني وتناول الطعام الصحي.",
    });
    console.log(hypertensionRisk, diabetesRisk);  
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
            value: `معدل ضربات القلب: ${value.heartRate}, ضغط الدم: ${value.bloodPressure}`,
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
  const heartRateScalingFactor = 2; // Adjust this factor based on your data range

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Icon.Button name="bell" size={25} style={styles.icon} onPress={() => navigation.navigate('NotificationScreen')} />
          <TextInput style={styles.searchBar} placeholder="بحث..." value={searchQuery} onChangeText={handleSearchChange} />
          <Icon.Button name="user" size={60} style={styles.icon} onPress={() => navigation.navigate('ProfileScreen')} />
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={<Icon.Button name="ellipsis-v" size={30} onPress={openMenu} style={styles.icon} />}
            style={styles.menu}
          >
            <Menu.Item onPress={() => handleNavigation('SettingsScreen')} title="الإعدادات" icon="cog" titleStyle={styles.menuItemText} style={styles.menuItem} />
            <Menu.Item onPress={() => handleNavigation('ProfileScreen')} title="الملف الشخصي" icon="user" titleStyle={styles.menuItemText} style={styles.menuItem} />
            <Menu.Item onPress={() => handleNavigation('NearbyHospitalScreen')} title="المستشفى القريب" icon="hospital" titleStyle={styles.menuItemText} style={styles.menuItem} />
            <Divider style={styles.menuDivider} />
          </Menu>
        </View>
        <Text style={styles.headerText}>مرحبًا، {userName}!</Text> 
        <Text style={styles.subtitle}>لنضع صحتك في المقام الأول اليوم.</Text>
      </View>

      {/* Main Content Section */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Animated Quote Section */}
        {quoteVisible && (
          <Animated.View style={[styles.quoteCard, { opacity: fadeAnim }]}>
            <Text style={styles.quoteText}>"أعظم ثروة هي الصحة."</Text>
          </Animated.View>
        )}

        {/* Legend for the chart */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: '#D1FF66' }]} />
            <Text style={styles.legendText}>معدل ضربات القلب</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColorBox, { backgroundColor: COLORS.black }]} />
            <Text style={styles.legendText}>ضغط الدم</Text>
          </View>
        </View>

        {/* Chart Section */}
        <View style={styles.graphContainer} {...panResponder.panHandlers}>
          <View style={styles.timeFilters}>
            {['weekly', 'monthly'].map((range, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.filterButton,
                  timeRange === range && styles.activeFilter,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text style={styles.filterText}>{index === 0 ? 'أسبوع' : 'شهر'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Health Data Chart */}
          <LineChart
            data={{
              labels: generateChartData(timeRange).labels,
              datasets: [
                {
                  data: generateChartData(timeRange).bloodPressure,
                  color: (opacity = 1) => COLORS.black,
                  strokeWidth: 2,
                  label: 'ضغط الدم',
                },
                {
                  data: generateChartData(timeRange).heartRate.map(hr => hr * heartRateScalingFactor), // Scale heart rate
                  color: (opacity = 1) => '#D1FF66',
                  strokeWidth: 2,
                  label: 'معدل ضربات القلب',
                },
              ],
            }}
            width={Dimensions.get('window').width - 32}
            height={220}
            chartConfig={{
              backgroundGradientFrom: COLORS.white,
              backgroundGradientTo: COLORS.white,
              decimalPlaces: 0,
              color: (opacity = 1) => COLORS.black,
              labelColor: (opacity = 1) => COLORS.black,
              style: { borderRadius: 16 },
              propsForDots: {
                r: '1',
                strokeWidth: '2',
                stroke: '#D1FF66',
              },
              propsForBackgroundLines: {
                stroke: COLORS.gray,
                strokeDasharray: '',
              },
              yAxisLabel: '',
              yAxisSuffix: '',
              yAxisInterval: 1, // Optional, default is 1
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Tooltip for the chart */}
        {tooltipVisible && (
          <View style={[styles.tooltip, { left: tooltipData.x, top: tooltipData.y }]}>
            <Text style={styles.tooltipText}>{tooltipData.value}</Text>
            <TouchableOpacity onPress={() => setTooltipVisible(false)}>
              <Text style={styles.closeTooltip}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* AI Health Analysis Card */}
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>تحليل الصحة بواسطة الذكاء الاصطناعي</Text>
          <TouchableOpacity style={styles.aiButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.aiButtonText}>تحقق</Text>
          </TouchableOpacity>
        </View>

        {/* Health Metrics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>مقاييس الصحة</Text>
            <Icon name="chevron-left" size={20} color={COLORS.black} />
          </View>
          <View style={styles.metricsGrid}>
            {[
              { title: 'ضغط الدم', subtitle: 'أحدث الاتجاهات', value: '+1.23%' },
              { title: 'مستوى السكر في الدم', subtitle: 'مخاطر السكري', value: '-0.45%' },
              { title: 'تغير معدل ضربات القلب', subtitle: 'مؤشر التوتر', value: '+0.76%' },
              { title: 'مؤشر كتلة الجسم والوزن', subtitle: 'تتبع تغيرات الوزن', value: '+2.34%' },
            ].map((metric, index) => (
              <View key={index} style={styles.metricCard}>
                <Text style={styles.metricTitle}>{metric.title}</Text>
                <Text style={styles.metricSubtitle}>{metric.subtitle}</Text>
                <Text style={styles.metricValue}>{metric.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Input Field for AI Interaction */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputField}
            placeholder="اسأل دكتور الذكاء الاصطناعي ......"
            placeholderTextColor={COLORS.gray}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Icon name="paper-plane" size={25} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Health Check Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تقييم الصحة</Text>
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
              <View style={styles.resultsContainer}>
                <Text style={styles.resultText}>مخاطر ارتفاع ضغط الدم: {riskResults.hypertensionRisk}%</Text>
                <Text style={styles.resultText}>مخاطر السكري: {riskResults.diabetesRisk}%</Text>
                <Text style={styles.resultText}>نصائح: {riskResults.tips}</Text>
              </View>
            )}
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>إغلاق</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// Styles
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
    paddingVertical: 65,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuItemText: {
    color: "#000",
    fontWeight: 'bold',
    fontSize: 16,
  },
  menuDivider: {
    backgroundColor: COLORS.gray,
    marginVertical: 8,
  },
  headerText: {
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'right',
    fontSize: 32,
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
  searchBar: {
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: 15,
    fontSize: 16,
    marginTop: 5,
    width: '50%',
  },
  // Chart container styles
  graphContainer: {
    backgroundColor: COLORS.white,
    margin: 16,
    borderRadius: 16,
    elevation: 5,
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
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    padding: 9,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  legendColorBox: {
    width: 20,
    height: 20,
    marginRight: 5,
    borderRadius: 25,
  },
  legendText: {
    fontSize: 14,
    color: COLORS.black,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterText: {
    fontSize: 14,
  },
  activeFilter: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    paddingRight: 10,
  },
  // Tooltip styles
  tooltip: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  tooltipText: {
    color: 'white',
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
  // Health Metrics Section styles
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
    color: COLORS.black,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    backgroundColor: COLORS.gray,
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 16,
    height: 120,
    elevation: 3,
    borderBlockColor: COLORS.black,
    borderBlockWidth: 1,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  metricSubtitle: {
    fontSize: 12,
    textAlign: 'right',
  },
  metricValue: {
    fontSize: 16,
    color: COLORS.black,
    marginTop: 4,
    textAlign: 'right',
  },
  // Input Field styles
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.gray,
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 16,
    backgroundColor: COLORS.white,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: COLORS.black,
  },
  sendButton: {
    marginLeft: 10,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '100%',
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
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: COLORS.gray,
    color: "red",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
    width: '100%',
  },
  checkButton: {
    backgroundColor: COLORS.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: '100%',
  },
  checkButtonText: {
    color: COLORS.black,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  resultsContainer: {
    marginTop: 15,
    alignItems: 'center',
    width: '100%',
  },
  resultText: {
    textAlign: 'center',
    marginVertical: 5,
  },
  closeButton: {
    width: '100%',
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

// Export the main screen component
export default HomeScreen;