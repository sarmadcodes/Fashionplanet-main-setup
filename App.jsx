import { ActivityIndicator, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { initializeStore } from './src/services/appStore';

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
    let mounted = true;

    const bootstrap = async () => {
      // Initialize store from AsyncStorage before rendering app routes.
      await initializeStore();
      const [isLoggedIn, session, token] = await Promise.all([
        AsyncStorage.getItem('is_logged_in'),
        AsyncStorage.getItem('user_session'),
        AsyncStorage.getItem('auth_token'),
      ]);
      const hasValidSession = Boolean(session);
      const hasLikelyJwt = typeof token === 'string' && /^[^.]+\.[^.]+\.[^.]+$/.test(token);
      if (mounted) {
        setInitialRoute(isLoggedIn === 'true' && hasValidSession && hasLikelyJwt ? 'BottomTabs' : 'OnBoardingScreen');
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, backgroundColor: '#141414', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#C7DA2C" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
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
    </GestureHandlerRootView>
  )
}

export default App
