import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '../context/AuthContext';
import BottomNavigation from '../components/BottomNavigation';
import { colors } from '../theme';
import { EXTERNAL_SCREENS } from './ExternalModules';

// Auth
import SplashScreen from '../screens/Splash';
import LoginScreen from '../screens/Login';
import RegisterScreen from '../screens/Register';
// Tabs
import HomeScreen from '../screens/Home';
import BuyTicketScreen from '../screens/BuyTicket';
import TicketHistoryScreen from '../screens/TicketHistory';
import QRScannerScreen from '../screens/QRScanner';
import ProfileScreen from '../screens/Profile';
// Ticket purchase flow
import FareSummaryScreen from '../screens/FareSummary';
import PassengerCheckoutScreen from '../screens/PassengerCheckout';
import PaymentProcessingScreen from '../screens/PaymentProcessing';
import PaymentResultScreen from '../screens/PaymentResult';
// Tickets
import TicketDetailsScreen from '../screens/TicketDetails';
import DigitalQRPassScreen from '../screens/DigitalQRPass';
import EditTicketScreen from '../screens/EditTicket';
import CancelTicketScreen from '../screens/CancelTicket';
// Payments & profile
import PaymentMethodsScreen from '../screens/PaymentMethods';
import AddPaymentMethodScreen from '../screens/AddPaymentMethod';
import PaymentHistoryScreen from '../screens/PaymentHistory';
import PaymentReceiptScreen from '../screens/PaymentReceipt';
import EditProfileScreen from '../screens/EditProfile';
// Scanner
import ScanResultScreen from '../screens/ScanResult';
import ScanHistoryScreen from '../screens/ScanHistory';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const stackScreenOptions = {
  headerStyle: { backgroundColor: colors.primaryDarkNavy },
  headerTintColor: colors.white,
  headerTitleStyle: { fontWeight: '600' },
  contentStyle: { backgroundColor: colors.lightBackground },
};

// Tab screens draw their own header (ScreenHeader) to match the Milestone 02 design
const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <BottomNavigation {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="BuyTicket" component={BuyTicketScreen} options={{ title: 'Buy Ticket' }} />
      <Tab.Screen name="Tickets" component={TicketHistoryScreen} options={{ title: 'My Tickets' }} />
      <Tab.Screen name="Scan" component={QRScannerScreen} options={{ title: 'Scan' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { status } = useAuth();

  if (status === 'loading') return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={stackScreenOptions}>
        {status !== 'signedIn' ? (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </Stack.Group>
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} options={{ headerShown: false }} />

            {/* Purchase flow: Buy Ticket tab -> Fare Summary -> Checkout -> Processing -> Result */}
            <Stack.Screen name="FareSummary" component={FareSummaryScreen} options={{ title: 'Fare Summary' }} />
            <Stack.Screen name="PassengerCheckout" component={PassengerCheckoutScreen} options={{ title: 'Passenger Checkout' }} />
            <Stack.Screen
              name="PaymentProcessing"
              component={PaymentProcessingScreen}
              options={{ headerShown: false, gestureEnabled: false, animation: 'fade' }}
            />
            <Stack.Screen name="PaymentResult" component={PaymentResultScreen} options={{ headerShown: false, gestureEnabled: false }} />

            {/* Tickets */}
            <Stack.Screen name="TicketDetails" component={TicketDetailsScreen} options={{ title: 'Ticket Details' }} />
            <Stack.Screen name="DigitalQRPass" component={DigitalQRPassScreen} options={{ title: 'Digital QR Transit Pass' }} />
            <Stack.Screen name="EditTicket" component={EditTicketScreen} options={{ title: 'Change Trip' }} />
            <Stack.Screen name="CancelTicket" component={CancelTicketScreen} options={{ title: 'Cancel Ticket' }} />

            {/* Payments & profile */}
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Payment Methods' }} />
            <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} options={{ title: 'Add Card' }} />
            <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} options={{ title: 'Payment History' }} />
            <Stack.Screen name="PaymentReceipt" component={PaymentReceiptScreen} options={{ title: 'Receipt' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />

            {/* Scanner */}
            <Stack.Screen name="ScanResult" component={ScanResultScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ScanHistory" component={ScanHistoryScreen} options={{ title: 'Scan History' }} />

            {/* Other members' modules (see ExternalModules.js) */}
            {EXTERNAL_SCREENS.map((s) => (
              <Stack.Screen key={s.name} name={s.name} component={s.component} options={s.options} />
            ))}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
