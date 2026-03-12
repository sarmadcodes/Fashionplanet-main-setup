import React, { useState, useRef, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Animated, Image, useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';

// ── Unique men's fashion images — no repeats ──────────────────
const TRYON_OUTFITS = [
  { id: 't1', label: 'Smart Casual',   image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 't2', label: 'Power Suit',     image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 't3', label: 'Street Style',   image: 'https://images.pexels.com/photos/2896840/pexels-photo-2896840.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 't4', label: 'Weekend Casual', image: 'https://images.pexels.com/photos/4349759/pexels-photo-4349759.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 't5', label: 'Business Look',  image: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 't6', label: 'Winter Layer',   image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

// ── Shimmer — high contrast visible pulse ─────────────────────
const ShimmerBox = ({ w, h, r = 10, style }) => {
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

// ── Animated progress line ────────────────────────────────────
const ProgressLine = ({ theme, percent }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: percent / 100, duration: 300, useNativeDriver: false }).start();
  }, [percent]);
  const lineW = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={pgStyles.track}>
      <View style={[pgStyles.bg, { backgroundColor: theme.primary + '28' }]} />
      <Animated.View style={[pgStyles.fill, { width: lineW, backgroundColor: theme.primary }]} />
    </View>
  );
};

const pgStyles = StyleSheet.create({
  track: { height: 3, borderRadius: 3, overflow: 'hidden', marginTop: 16, position: 'relative' },
  bg:    { ...StyleSheet.absoluteFillObject, borderRadius: 3 },
  fill:  { height: '100%', borderRadius: 3 },
});

const VirtualTryOnScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { width } = useWindowDimensions();
  const cardWidth = (width - 52) / 2;

  const [selected, setSelected] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [percent, setPercent]   = useState(0);
  const [result, setResult]     = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => { clearInterval(timerRef.current); }, []);

  const tryOn = (item) => {
    setSelected(item);
    setResult(null);
    setPercent(0);
    setLoading(true);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.floor(Math.random() * 4) + 2;
      if (p >= 100) {
        p = 100;
        setPercent(100);
        clearInterval(timerRef.current);
        setTimeout(() => { setLoading(false); setResult(item); }, 400);
      } else {
        setPercent(p);
      }
    }, 130);
  };

  const handleSaveLook = async () => {
    if (!result) return;
    try {
      const existing = await AsyncStorage.getItem('saved_looks');
      const saved = existing ? JSON.parse(existing) : [];
      const alreadySaved = saved.find((s) => s.id === result.id);
      if (alreadySaved) {
        Alert.alert('Already Saved', 'This look is already in your saved looks.');
        return;
      }
      saved.unshift({ ...result, savedAt: new Date().toISOString() });
      await AsyncStorage.setItem('saved_looks', JSON.stringify(saved));
      Alert.alert('Saved!', 'Look saved to your collection.');
    } catch {
      Alert.alert('Error', 'Could not save look. Try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>Virtual Try-On</Text>
        <View style={[styles.aiBadge, { backgroundColor: '#6C63FF22', borderColor: '#6C63FF' }]}>
          <Ionicons name="body-outline" size={11} color="#6C63FF" />
          <Text style={[styles.aiBadgeText, { color: '#6C63FF' }]}>AI</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Select an outfit below to see how it looks on your avatar
        </Text>

        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>CHOOSE AN OUTFIT</Text>
        <View style={styles.grid}>
          {TRYON_OUTFITS.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.gridCard,
                { width: cardWidth },
                { borderColor: selected?.id === item.id ? theme.primary : theme.border, borderWidth: selected?.id === item.id ? 2 : 0.5 },
              ]}
              onPress={() => tryOn(item)}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Image source={{ uri: item.image }} style={styles.gridImg} />
              {selected?.id === item.id && (
                <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                  <Ionicons name="checkmark" size={12} color="#141414" />
                </View>
              )}
              <View style={styles.gridLabel}>
                <Text style={[styles.gridLabelText, { color: theme.text }]} numberOfLines={1}>{item.label}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading — shimmer + progress line */}
        {loading && (
          <View style={[styles.loadingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <ShimmerBox w="100%" h={320} r={14} style={{ marginBottom: 16 }} />
            <ShimmerBox w="56%" h={18} r={6} style={{ marginBottom: 10 }} />
            <ShimmerBox w="100%" h={12} r={5} style={{ marginBottom: 8 }} />
            <ShimmerBox w="82%" h={12} r={5} style={{ marginBottom: 18 }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ShimmerBox w="48%" h={44} r={50} />
              <ShimmerBox w="48%" h={44} r={50} />
            </View>
            <ProgressLine theme={theme} percent={percent} />
          </View>
        )}

        {/* Result */}
        {result && !loading && (
          <View style={[styles.resultCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: result.image }} style={styles.resultImg} />
              <View style={[styles.resultBadge, { backgroundColor: '#6C63FF' }]}>
                <Ionicons name="checkmark-circle" size={14} color="#fff" />
                <Text style={styles.resultBadgeText}>Try-On Complete</Text>
              </View>
            </View>
            <View style={{ padding: 16 }}>
              <Text style={[styles.resultTitle, { color: theme.text }]}>{result.label}</Text>
              <Text style={[styles.resultSub, { color: theme.secondaryText }]}>
                This look fits your style profile with a 91% match score.
              </Text>
              <View style={styles.resultActions}>
                <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleSaveLook}> 
                  <Ionicons name="bookmark-outline" size={16} color="#141414" />
                  <Text style={styles.saveBtnText}>Save Look</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.border }]} onPress={() => tryOn(result)}>
                  <Ionicons name="refresh-outline" size={16} color={theme.text} />
                  <Text style={[styles.outlineBtnText, { color: theme.text }]}>Retry</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default VirtualTryOnScreen;

const styles = StyleSheet.create({
  container:      { flex: 1, paddingHorizontal: 20 },
  nav:            { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  backBtn:        { width: 38, height: 38, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  navTitle:       { fontSize: 17, fontWeight: '700' },
  aiBadge:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },
  aiBadgeText:    { fontSize: 11, fontWeight: '800' },
  subtitle:       { fontSize: 13, lineHeight: 20, marginBottom: 20 },
  sectionLabel:   { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  gridCard:       { borderRadius: 14, overflow: 'hidden' },
  gridImg:        { width: '100%', height: 170, resizeMode: 'cover' },
  selectedBadge:  { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  gridLabel:      { padding: 8 },
  gridLabelText:  { fontSize: 12, fontWeight: '600' },
  loadingCard:    { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 20 },
  resultCard:     { borderRadius: 16, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
  resultImg:      { width: '100%', height: 340, resizeMode: 'cover' },
  resultBadge:    { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50 },
  resultBadgeText:{ color: '#fff', fontSize: 10, fontWeight: '800' },
  resultTitle:    { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  resultSub:      { fontSize: 13, lineHeight: 18, marginBottom: 16 },
  resultActions:  { flexDirection: 'row', gap: 10 },
  saveBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 50 },
  saveBtnText:    { color: '#141414', fontWeight: '700', fontSize: 13 },
  outlineBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 50, borderWidth: 1 },
  outlineBtnText: { fontSize: 13, fontWeight: '600' },
});