import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator } from 'react-native';
import * as Notifications from 'expo-notifications';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/services/firebaseConfig';
import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthScreen from './src/screens/AuthScreen';
import StorageService from './src/services/StorageService';
import { Medication } from './src/models/Medication';
import { MedicationLog } from './src/models/MedicationLog';
import SyncService from './src/services/SyncService';

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF231F7C',
  });
}

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Handle user state changes
  function onAuthStateChangedHandler(user) {
    setUser(user);
    if (initializing) setInitializing(false);

    // If user logs in/out, re-init sync if needed
    if (user && !initializing) {
      SyncService.initialize();
    }
  }

  useEffect(() => {
    const subscriber = onAuthStateChanged(auth, onAuthStateChangedHandler);
    return subscriber; // unsubscribe on unmount
  }, []);

  useEffect(() => {
    initializeSampleData();
    // SyncService is initialized in auth listener or manually here if needed
    // But better to wait for auth state to be known.
    if (user) {
      SyncService.initialize();
    }
  }, [user]);

  const initializeSampleData = async () => {
    // Request notification permissions
    const { status } = await Notifications.requestPermissionsAsync();

    // Refresh notifications to ensure schedule is topped up
    await StorageService.refreshNotifications();

    // Check if we already have data
    const existingMeds = await StorageService.getMedications();

    if (existingMeds.length === 0) {
      // Add sample medications matching the Canva design
      const aspirin = new Medication({
        name: 'Aspirin',
        dosage: '100mg',
        times: ['08:00'],
        frequency: 'daily',
        notes: 'Take with food',
      });

      const metformin = new Medication({
        name: 'Metformin',
        dosage: '500mg',
        times: ['08:00', '20:00'],
        frequency: 'twice_daily',
        notes: 'For diabetes management',
      });

      const lisinopril = new Medication({
        name: 'Lisinopril',
        dosage: '10mg',
        times: ['21:00'],
        frequency: 'daily',
        notes: 'Blood pressure medication',
      });

      await StorageService.addMedication(aspirin);
      await StorageService.addMedication(metformin);
      await StorageService.addMedication(lisinopril);

      // Add some sample logs for the week
      const today = new Date();
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);

        // Aspirin 8:00 AM
        const aspirinLog = new MedicationLog({
          medicationId: aspirin.id,
          medicationName: `${aspirin.name} ${aspirin.dosage}`,
          scheduledTime: new Date(date.setHours(8, 0, 0, 0)),
          takenTime: i < 6 ? new Date(date.setHours(8, 15, 0, 0)) : null,
          status: i < 6 ? 'taken' : 'pending',
        });

        // Metformin 8:00 AM
        const metforminAM = new MedicationLog({
          medicationId: metformin.id,
          medicationName: `${metformin.name} ${metformin.dosage}`,
          scheduledTime: new Date(date.setHours(8, 0, 0, 0)),
          takenTime: i < 6 ? new Date(date.setHours(8, 20, 0, 0)) : null,
          status: i < 6 ? 'taken' : 'pending',
        });

        // Metformin 8:00 PM
        const metforminPM = new MedicationLog({
          medicationId: metformin.id,
          medicationName: `${metformin.name} ${metformin.dosage}`,
          scheduledTime: new Date(date.setHours(20, 0, 0, 0)),
          takenTime: i < 6 && i !== 2 ? new Date(date.setHours(20, 10, 0, 0)) : null,
          status: i < 6 && i !== 2 ? 'taken' : (i === 2 ? 'missed' : 'pending'),
        });

        // Lisinopril 9:00 PM
        const lisinoprilLog = new MedicationLog({
          medicationId: lisinopril.id,
          medicationName: `${lisinopril.name} ${lisinopril.dosage}`,
          scheduledTime: new Date(date.setHours(21, 0, 0, 0)),
          takenTime: i < 6 && i !== 1 ? new Date(date.setHours(21, 5, 0, 0)) : null,
          status: i < 6 && i !== 1 ? 'taken' : (i === 1 ? 'missed' : 'pending'),
        });

        if (i < 6) {
          await StorageService.addLog(aspirinLog);
          await StorageService.addLog(metforminAM);
          await StorageService.addLog(metforminPM);
          await StorageService.addLog(lisinoprilLog);
        }
      }
    }
  };

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <Stack.Screen name="Main" component={BottomTabNavigator} />
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

