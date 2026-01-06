import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import MedicationsScreen from '../screens/MedicationsScreen';
import AddMedicationScreen from '../screens/AddMedicationScreen';
import RecordScreen from '../screens/RecordScreen';
import colors from '../theme/colors';
import { typography } from '../theme/styles';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Medications Stack Navigator
const MedicationsStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="MedicationsList" component={MedicationsScreen} />
            <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
        </Stack.Navigator>
    );
};

// Bottom Tab Navigator
const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Medications') {
                        iconName = focused ? 'medical' : 'medical-outline';
                    } else if (route.name === 'Record') {
                        iconName = focused ? 'document-text' : 'document-text-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textLight,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: colors.borderLight,
                    borderTopWidth: 1,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                },
                tabBarLabelStyle: {
                    ...typography.caption,
                    fontWeight: '600',
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Medications" component={MedicationsStack} />
            <Tab.Screen name="Record" component={RecordScreen} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
