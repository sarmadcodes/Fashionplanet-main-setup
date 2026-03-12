import { ActivityIndicator, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';

import BottomTabs from './src/navigation/BottomTabs'
import {
  AccountVisibilityScreen,
  AddItemsScreen,
  BgSettingScreen,
  EditProfileScreen,
  GenerateOutfitsScreen,
  HelpCenterScreen,
  InsightsScreen,
  LoginScreen,
  MyPostsScreen,
  NotificationsScreen,
  OnboardingScreen,
  OutfitsScreen,
  PrivacyScreen,
  RewardsScreen,
  SettingsScreen,
  SignupScreen,
  SingleOutfitScreen,
  StyleAvatarScreen,
  TermsAndPrivacyScreen,
  VirtualTryOnScreen,
  VouchersScreen,
  WeekPlanScreen,
} from './src/screens'

const App = () => {
  const Stack = createNativeStackNavigator();
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('is_logged_in').then((val) => {
      setInitialRoute(val === 'true' ? 'BottomTabs' : 'OnBoardingScreen');
    });
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#141414', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#C7DA2C" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="OnBoardingScreen" component={OnboardingScreen} />
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignupScreen" component={SignupScreen} />
        <Stack.Screen name="BottomTabs" component={BottomTabs} />

        <Stack.Screen name="AddItemsScreen" component={AddItemsScreen} />
        <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
        <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
        <Stack.Screen name="HelpCenterScreen" component={HelpCenterScreen} />
        <Stack.Screen name="TermsAndPrivacyScreen" component={TermsAndPrivacyScreen} />
        <Stack.Screen name="NotificationsScreen" component={NotificationsScreen} />
        <Stack.Screen name="PrivacyScreen" component={PrivacyScreen} />
        <Stack.Screen name="AccountVisibilityScreen" component={AccountVisibilityScreen} />
        <Stack.Screen name="WeekPlanScreen" component={WeekPlanScreen} />
        <Stack.Screen name="InsightsScreen" component={InsightsScreen} />
        <Stack.Screen name="OutfitsScreen" component={OutfitsScreen} />
        <Stack.Screen name="SingleOutfitScreen" component={SingleOutfitScreen} />
        <Stack.Screen name="RewardsScreen" component={RewardsScreen} />
        <Stack.Screen name="VouchersScreen" component={VouchersScreen} />
        <Stack.Screen name="BgSettingScreen" component={BgSettingScreen} />
        <Stack.Screen name="MyPostsScreen" component={MyPostsScreen} />

        <Stack.Screen name="GenerateOutfitsScreen" component={GenerateOutfitsScreen} />
        <Stack.Screen name="VirtualTryOnScreen" component={VirtualTryOnScreen} />
        <Stack.Screen name="StyleAvatarScreen" component={StyleAvatarScreen} />

          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
