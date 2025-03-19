import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, List, Divider } from 'react-native-paper';

const notifications = [
  { id: '1', title: 'تذكير بالموعد', description: 'لديك موعد مع الدكتور سميث الساعة 10:00 صباحًا غدًا.' },
  { id: '2', title: 'نتائج الفحص جاهزة', description: 'نتائج فحصك جاهزة للمراجعة.' },
  { id: '3', title: 'نصيحة صحية', description: 'اشرب على الأقل 8 أكواب من الماء اليوم لتحسين الترطيب.' },
  { id: '4', title: 'تحديث التأمين', description: 'تم تحديث بوليصة التأمين الخاصة بك بنجاح.' },
];

const NotificationScreen = () => {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.headerText}>
        الإشعارات
      </Text>
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <>
            <List.Item
              title={item.title}
              description={item.description}
              left={(props) => <List.Icon {...props} icon="bell-ring" />}
            />
            <Divider />
          </>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  headerText: {
    marginBottom: 20,
    fontWeight: 'bold',
  },
});

export default NotificationScreen;


