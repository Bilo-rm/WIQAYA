import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart } from 'react-native-chart-kit';

const screenWidth = Dimensions.get('window').width;

const PedometerTracker = () => {
  const [steps, setSteps] = useState(0);
  const [isPedometerAvailable, setIsPedometerAvailable] = useState(false);

  // If you want to track each day of the week, you might store them in an array:
  const [weeklySteps, setWeeklySteps] = useState([0, 0, 0, 0, 0, 0, 0]);
  // Sunday = index 0, Monday = index 1, ... or whichever convention you prefer

  useEffect(() => {
    Pedometer.isAvailableAsync().then(setIsPedometerAvailable);

    let subscription;
    if (isPedometerAvailable) {
      subscription = Pedometer.watchStepCount(({ steps }) => {
        setSteps(steps);
        // Save the current day's steps to AsyncStorage or update the weekly array
        // For example, if you want to store only today's steps:
        AsyncStorage.setItem('dailySteps', steps.toString());
      });
    }

    // Load saved daily steps:
    AsyncStorage.getItem('dailySteps').then((savedSteps) => {
      if (savedSteps) setSteps(parseInt(savedSteps));
    });

    // Potentially load weekly steps from AsyncStorage:
    AsyncStorage.getItem('weeklySteps').then((data) => {
      if (data) {
        const parsed = JSON.parse(data);
        setWeeklySteps(parsed);
      }
    });

    return () => subscription?.remove();
  }, [isPedometerAvailable]);

  // Example: if you want to update the array with today's steps each time:
  useEffect(() => {
    // Suppose you use dayIndex = new Date().getDay(); // 0=Sunday, 1=Monday...
    const dayIndex = new Date().getDay(); 
    const newWeekly = [...weeklySteps];
    newWeekly[dayIndex] = steps; // store today's step count
    setWeeklySteps(newWeekly);
    AsyncStorage.setItem('weeklySteps', JSON.stringify(newWeekly));
  }, [steps]);

  // Prepare chart data
  const chartData = {
    labels: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
    ,  // or 'Sun','Mon','Tue','Wed','Thu','Fri','Sat'
    datasets: [
      {
        data: [2500, 3008, 5000, 4500, 4000, 4000, 1200], // your array of 7 day values
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Title / Subtitle */}
      <Text style={styles.mainTitle}>خطواتي</Text>
      <Text style={styles.subtitle}>هذا الأسبوع</Text>

      {/* Bar Chart */}
      <BarChart
        data={chartData}
        width={screenWidth * 0.9}       // slightly less than full width
        height={220}
        fromZero                       // ensures bars start at 0
        showValuesOnTopOfBars          // displays the value on top
        withInnerLines={false}         // remove background grid lines if you want
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(46, 204, 113, ${opacity})`, // green bars
          labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          barPercentage: 0.9, // adjust bar thickness
        }}
        style={styles.chartStyle}
      />

      {/* Streak / Milestone Section */}
      <View style={styles.streakContainer}>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>8000</Text>
          <Text style={styles.streakLabel}>أعلى عدد خطوات مسجلة</Text>
        </View>
        <View style={styles.streakItem}>
          <Text style={styles.streakValue}>4503</Text>
          <Text style={styles.streakLabel}>خطوات اليوم</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#f8f9fa', // example background
    flex: 1,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 16,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16, // round corners
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    // Shadow for Android
    elevation: 2,
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  streakItem: {
    alignItems: 'center',
  },
  streakValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
  },
  streakLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

export default PedometerTracker;