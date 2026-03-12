import Ionicons from '@react-native-vector-icons/ionicons';
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const TermsAndPrivacyScreen = ({ navigation }) => {
  const { isDark } = useTheme();

  const colors = {
    background: isDark ? '#141414' : '#FFF',
    card: isDark ? '#2A2A2A' : '#F2F2F2',
    text: isDark ? '#FEFDFB' : '#141414',
    subText: isDark ? '#D9D9DA' : '#555',
    footerText: isDark ? '#555' : '#888',
    backBtnBg: isDark ? '#2A2A2A' : '#E0E0E0',
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.backBtnBg }]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={20} color={colors.subText} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Privacy</Text>
        </View>

        {/* Terms Section */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Terms of Service</Text>
          <Text style={[styles.text, { color: colors.subText }]}>
            By using Fashion Planet, you agree to follow all applicable rules
            and regulations. The app is intended for personal use only.
            Unauthorized commercial use is not allowed.
          </Text>
          <Text style={[styles.text, { color: colors.subText }]}>
            We reserve the right to modify or discontinue features at any time
            without prior notice.
          </Text>
        </View>

        {/* Privacy Section */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Privacy Policy</Text>
          <Text style={[styles.text, { color: colors.subText }]}>
            Fashion Planet respects your privacy. We collect only necessary
            information to provide a better experience, such as profile data
            and app usage behavior.
          </Text>
          <Text style={[styles.text, { color: colors.subText }]}>
            Your personal data is never sold to third parties. We implement
            security measures to keep your information safe.
          </Text>
        </View>

        <Text style={[styles.footer, { color: colors.footerText }]}>Last updated: February 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  backButton: {
    width: 33,
    height: 33,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 40,
    marginBottom: 20,
  },
});

export default TermsAndPrivacyScreen;
