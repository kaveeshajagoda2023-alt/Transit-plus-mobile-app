import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PassengerCheckoutScreen from '../screens/PassengerCheckout';
import DigitalQRPassScreen from '../screens/DigitalQRPass';
import TicketHistoryScreen from '../screens/TicketHistory';
import TicketDetailsScreen from '../screens/TicketDetails';
import QRScannerScreen from '../screens/QRScanner';
import ProfileScreen from '../screens/Profile';
import BottomNavigation from '../components/BottomNavigation';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DummyScreen = () => null;

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="CheckoutTab"
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.primaryDarkNavy },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Tab.Screen name="CheckoutTab" component={PassengerCheckoutScreen} options={{ title: 'Passenger Checkout' }} />
      <Tab.Screen name="Routes" component={DummyScreen} options={{ title: 'Transit Routes' }} />
      <Tab.Screen name="Tickets" component={TicketHistoryScreen} options={{ title: 'Ticket History' }} />
      <Tab.Screen name="Alerts" component={DummyScreen} options={{ title: 'Alerts' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Passenger Profile' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: { backgroundColor: colors.primaryDarkNavy },
          headerTintColor: colors.white,
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="PassengerCheckout"
          component={PassengerCheckoutScreen}
          options={{ title: 'Passenger Checkout' }}
        />
        <Stack.Screen
          name="DigitalQRPass"
          component={DigitalQRPassScreen}
          options={{ title: 'Digital QR Transit Pass' }}
        />
        <Stack.Screen
          name="TicketHistory"
          component={TicketHistoryScreen}
          options={{ title: 'Ticket History' }}
        />
        <Stack.Screen
          name="TicketDetails"
          component={TicketDetailsScreen}
          options={{ title: 'Ticket Details' }}
        />
        <Stack.Screen
          name="QRScanner"
          component={QRScannerScreen}
          options={{ title: 'QR Scanner' }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: 'Profile' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
