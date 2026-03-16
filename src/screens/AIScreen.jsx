import React, { useEffect, useState, useRef } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchAiStats } from '../services/apiService';

// ── Shimmer skeleton — high contrast ─────────────────────────
const Skeleton = ({ w, h, r = 8, style }) => {
  const { isDark } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const bg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [isDark ? '#2E2E2E' : '#CECECE', isDark ? '#484848' : '#EBEBEB'],
  });
  return <Animated.View style={[{ width: w, height: h, borderRadius: r, backgroundColor: bg }, style]} />;
};

const FEATURES = [
  { title: 'Generate Outfit',  desc: 'AI builds the perfect look for your mood and weather.',  icon: 'sparkles-outline',     screen: 'GenerateOutfitsScreen', color: '#D4AF37' },
  { title: 'Virtual Try-On',   desc: 'See clothes on your avatar before you wear them.',       icon: 'body-outline',          screen: 'VirtualTryOnScreen',    color: '#6C63FF' },
  { title: 'Style Avatar',     desc: 'Build your digital twin and explore unlimited styles.',  icon: 'person-circle-outline', screen: 'StyleAvatarScreen',     color: '#FF6B6B' },
];

// ── Main Screen ───────────────────────────────────────────────
const AIScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [loading, setLoading]     = useState(true);
  const [stats, setStats]         = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const statsData = await apiFetchAiStats();
      setStats(statsData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 110 }}>

          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>AI Styling</Text>
              <Text style={[styles.sub, { color: theme.secondaryText }]}>Your personal fashion assistant</Text>
            </View>
            <View style={[styles.aiPill, { backgroundColor: theme.primary + '22', borderColor: theme.primary }]}>
              <Ionicons name="sparkles" size={13} color={theme.primary} />
              <Text style={[styles.aiPillText, { color: theme.primary }]}>AI Powered</Text>
            </View>
          </View>

          {/* Stats Card */}
          <View style={[styles.statsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {loading ? (
              <View style={styles.statsRow}>
                {[1, 2, 3].map(i => (
                  <View key={i} style={styles.statItem}>
                    <Skeleton w={44} h={28} r={6} style={{ marginBottom: 8 }} />
                    <Skeleton w={52} h={11} r={5} />
                  </View>
                ))}
              </View>
            ) : (
              <>
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: theme.primary }]}>{stats?.outfitsGenerated}+</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Outfits</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: theme.primary }]}>{stats?.tryOns}+</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Try-ons</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: theme.primary }]}>{stats?.matchScore}%</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Match Score</Text>
                  </View>
                </View>
                <View style={[styles.statsFooter, { borderTopColor: theme.border }]}>
                  <Ionicons name="trending-up-outline" size={13} color={theme.primary} />
                  <Text style={[styles.statsFooterText, { color: theme.secondaryText }]}>
                    Style score improved 12% this week
                  </Text>
                </View>
              </>
            )}
          </View>

          {/* AI Features */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Features</Text>
          {FEATURES.map((feat, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.featureCard, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => navigation.navigate(feat.screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.featureIcon, { backgroundColor: feat.color + '20' }]}>
                <Ionicons name={feat.icon} size={24} color={feat.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.featureTitle, { color: theme.text }]}>{feat.title}</Text>
                <Text style={[styles.featureDesc, { color: theme.secondaryText }]}>{feat.desc}</Text>
              </View>
              <View style={[styles.featureArrow, { backgroundColor: theme.primary + '18' }]}>
                <Ionicons name="arrow-forward" size={15} color={theme.primary} />
              </View>
            </TouchableOpacity>
          ))}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('GenerateOutfitsScreen')}
            activeOpacity={0.8}
          >
            <Ionicons name="sparkles" size={18} color="#141414" />
            <Text style={styles.ctaBtnText}>Generate New Outfit</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AIScreen;

const styles = StyleSheet.create({
  container:       { flex: 1, paddingHorizontal: 20 },
  headerRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 20 },
  title:           { fontSize: 22, fontWeight: '700' },
  sub:             { fontSize: 13, marginTop: 3 },
  aiPill:          { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, borderWidth: 1 },
  aiPillText:      { fontSize: 12, fontWeight: '700' },
  statsCard:       { borderRadius: 16, borderWidth: 1, marginBottom: 24, overflow: 'hidden' },
  statsRow:        { flexDirection: 'row', alignItems: 'center', padding: 20 },
  statItem:        { flex: 1, alignItems: 'center' },
  statVal:         { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  statLabel:       { fontSize: 11 },
  statDivider:     { width: 1, height: 40 },
  statsFooter:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderTopWidth: 1 },
  statsFooterText: { fontSize: 11 },
  sectionTitle:    { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  featureCard:     { flexDirection: 'row', alignItems: 'center', borderRadius: 16, padding: 16, borderWidth: 1, marginBottom: 12, gap: 14 },
  featureIcon:     { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  featureTitle:    { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  featureDesc:     { fontSize: 12, lineHeight: 17 },
  featureArrow:    { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  ctaBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 52, borderRadius: 50 },
  ctaBtnText:      { color: '#141414', fontSize: 15, fontWeight: '700' },
});