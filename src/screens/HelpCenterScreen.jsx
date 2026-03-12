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

const HelpCenterScreen = ({ navigation }) => {
  const { isDark } = useTheme();

  // Dynamic colors based on theme
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
          <Text style={[styles.headerTitle, { color: colors.text }]}>Help Center</Text>
        </View>

        {/* Content */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.question, { color: colors.text }]}>How does Fashion Planet work?</Text>
          <Text style={[styles.answer, { color: colors.subText }]}>
            Fashion Planet helps you discover, explore, and shop the latest
            fashion trends. You can browse outfits, try styles, and save your
            favorite looks.
          </Text>

          <Text style={[styles.question, { color: colors.text }]}>How can I edit my profile?</Text>
          <Text style={[styles.answer, { color: colors.subText }]}>
            Go to Settings → Profile to update your personal information,
            profile picture, and bio.
          </Text>

          <Text style={[styles.question, { color: colors.text }]}>How do I contact support?</Text>
          <Text style={[styles.answer, { color: colors.subText }]}>
            If you face any issues, you can contact our support team at
            support@fashionplanet.app. We usually respond within 24 hours.
          </Text>

          <Text style={[styles.question, { color: colors.text }]}>Is my data secure?</Text>
          <Text style={[styles.answer, { color: colors.subText }]}>
            Yes. We take data security seriously and use industry-standard
            practices to protect your personal information.
          </Text>
        </View>

        <Text style={[styles.footer, { color: colors.footerText }]}>Fashion Planet Support</Text>
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
  question: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 12,
  },
  answer: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
  },
  footer: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 40,
    marginBottom: 20,
  },
});

export default HelpCenterScreen;
