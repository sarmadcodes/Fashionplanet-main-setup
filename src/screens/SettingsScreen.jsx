import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiDeleteAccount } from '../services/apiService';

const SettingsScreen = ({ navigation }) => {
  // Get global dark/light mode
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const theme = isDark ? darkTheme : lightTheme;
  const [deletingAccount, setDeletingAccount] = useState(false);

  const performDeleteAccount = async () => {
    if (deletingAccount) return;

    try {
      setDeletingAccount(true);
      await apiDeleteAccount();

      try {
        await logout();
      } finally {
        Alert.alert('Account deleted', 'Your account has been permanently deleted.', [
          {
            text: 'OK',
            onPress: () => navigation.reset({ index: 0, routes: [{ name: 'LoginScreen' }] }),
          },
        ]);
      }
    } catch (error) {
      Alert.alert(
        'Delete failed',
        error?.message || 'We could not delete your account right now. Please try again.'
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const confirmDeleteAccount = () => {
    if (deletingAccount) return;

    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: performDeleteAccount,
        },
      ]
    );
  };

  /* -------- Reusable Setting Item -------- */
  const SettingItem = ({
    iconName,
    title,
    onPress,
    isLast,
    showArrow = true,
  }) => (
    <TouchableOpacity
      style={[
        styles.itemRow,
        { borderBottomColor: theme.border },
        isLast && { borderBottomWidth: 0 },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View
          style={[
            styles.iconCircle,
            { backgroundColor: theme.border, borderColor: theme.secondaryText },
          ]}
        >
          <Ionicons name={iconName} size={18} color={theme.text} />
        </View>
        <Text style={[styles.itemTitle, { color: theme.text }]}>{title}</Text>
      </View>

      {showArrow && (
        <Ionicons name="chevron-forward" size={16} color={theme.secondaryText} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      <ScrollView
        contentContainerStyle={styles.scrollBody}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: theme.card }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color={theme.secondaryText} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
        </View>

        {/* Dark Mode Toggle */}
        <View
          style={[
            styles.toggleContainer,
            { backgroundColor: theme.card },
          ]}
        >
          <View style={styles.itemLeft}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.border, borderColor: theme.secondaryText },
              ]}
            >
              <Ionicons name="moon" size={18} color={theme.text} />
            </View>
            <View>
              <Text style={[styles.toggleTitle, { color: theme.text }]}>Dark Mode</Text>
              <Text style={[styles.toggleSubtitle, { color: theme.secondaryText }]}>
                {isDark ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>

          <Switch
            trackColor={{ false: theme.secondaryText, true: theme.primary }}
            thumbColor={theme.secondaryText}
            onValueChange={toggleTheme}
            value={isDark}
          />
        </View>

        {/* Sections */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>Appearance</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <SettingItem
            iconName="images-outline"
            title="Background"
            onPress={() => navigation.navigate('BgSettingScreen')}
          />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>Account</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <SettingItem
            iconName="notifications"
            title="Notifications"
            onPress={() => navigation.navigate('NotificationsScreen')}
          />
          <SettingItem
            iconName="lock-closed"
            title="Privacy"
            onPress={() => navigation.navigate('PrivacyScreen')}
          />
          <SettingItem
            iconName="eye"
            title="Account Visibility"
            onPress={() => navigation.navigate('AccountVisibilityScreen')}
            isLast
          />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>Support</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <SettingItem
            iconName="help-circle"
            title="Help Center"
            onPress={() => navigation.navigate('HelpCenterScreen')}
          />
          <SettingItem
            iconName="document-text"
            title="Terms & Privacy"
            onPress={() => navigation.navigate('TermsAndPrivacyScreen')}
            isLast
          />
        </View>

        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>Account Actions</Text>
        <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
          <SettingItem
            iconName="log-out"
            title="Logout"
            showArrow={false}
            onPress={async () => {
              await logout();
              navigation.replace('LoginScreen');
            }}
            isLast
          />
        </View>

        {/* Delete Account */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={confirmDeleteAccount}
          disabled={deletingAccount}
        >
          <View style={[styles.deleteIconBox, { backgroundColor: "red" }]}>
            {deletingAccount ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <Ionicons name="trash" size={18} color='#000' />
            )}
          </View>
          <Text style={[styles.deleteText, { color:'red' }]}>{deletingAccount ? 'Deleting Account...' : 'Delete Account'}</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={[styles.footerText, { color: theme.secondaryText }]}>
          Fashion Planet v1.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  backButton: { width: 33, height: 33, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginRight: 20 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  scrollBody: { paddingBottom: 40 },
  toggleContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 50, marginTop: 20 },
  toggleTitle: { fontSize: 16, fontWeight: '600' },
  toggleSubtitle: { fontSize: 12 },
  sectionLabel: { fontSize: 14, fontWeight: '600', marginTop: 20, marginBottom: 10, marginLeft: 5 },
  sectionCard: { borderRadius: 10, overflow: 'hidden' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 36, height: 36, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginRight: 15, borderWidth: 1 },
  itemTitle: { fontSize: 15, fontWeight: '600' },
  deleteButton: { flexDirection: 'row', alignItems: 'center', borderRadius: 50, padding: 15, marginTop: 30, borderWidth: 1, borderColor: '#ED1C238C', backgroundColor: '#ed1c231d' },
  deleteIconBox: { width: 36, height: 36, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  deleteText: { fontSize: 15, fontWeight: '700' },
  footerText: { textAlign: 'center', fontSize: 12, marginTop: 40 },
});

export default SettingsScreen;
