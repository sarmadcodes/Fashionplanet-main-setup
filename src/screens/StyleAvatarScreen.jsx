import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Animated, Image,
  Alert,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { STYLE_AVATAR_TYPES } from '../config/uiOptions';
import { apiGenerateStyleAvatar } from '../services/apiService';

const STYLE_TYPES = STYLE_AVATAR_TYPES;

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

const CircularLoadingOverlay = ({ theme, percent, width }) => {
  const clamped = Math.max(0, Math.min(100, Number(percent) || 0));
  const ringSize = Math.max(92, Math.min(136, Math.round(width * 0.29)));
  const spinnerSize = Math.max(24, Math.round(ringSize * 0.27));

  return (
    <View style={circleStyles.overlay} pointerEvents="none">
      <View
        style={[
          circleStyles.ringHalo,
          {
            width: ringSize + 20,
            height: ringSize + 20,
            borderRadius: (ringSize + 20) / 2,
            backgroundColor: theme.primary + '22',
          },
        ]}
      />
      <View
        style={[
          circleStyles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderColor: theme.primary + '99',
            backgroundColor: 'rgba(0,0,0,0.46)',
          },
        ]}
      >
        <ActivityIndicator size={spinnerSize} color={theme.primary} />
        <Text style={circleStyles.percentText}>{Math.round(clamped)}%</Text>
      </View>
      <View style={[circleStyles.captionPill, { backgroundColor: 'rgba(0,0,0,0.52)', borderColor: theme.primary + '66' }]}>
        <Text style={circleStyles.loadingLabel}>Generating image...</Text>
      </View>
    </View>
  );
};

const circleStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 8,
    elevation: 8,
    gap: 10,
  },
  ringHalo: {
    position: 'absolute',
  },
  ring: {
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  captionPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  loadingLabel: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  percentText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});

const StyleAvatarScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { width } = useWindowDimensions();

  const [selectedStyles, setSelectedStyles] = useState([]);
  const [loading, setLoading]               = useState(false);
  const [percent, setPercent]               = useState(0);
  const [avatarDone, setAvatarDone]         = useState(false);
  const [avatarResult, setAvatarResult]     = useState(null);
  const timerRef = useRef(null);

  useEffect(() => () => { clearInterval(timerRef.current); }, []);

  const toggleStyle = (id) => {
    setSelectedStyles(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    setAvatarDone(false);
    setAvatarResult(null);
  };

  const startProgress = () => {
    let p = 6;
    setPercent(p);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      p += Math.floor(Math.random() * 5) + 3;
      if (p >= 92) {
        p = 92;
      }
      setPercent(p);
    }, 140);
  };

  const stopProgress = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const buildAvatar = async (forceFresh = false) => {
    if (selectedStyles.length === 0 || loading) return;

    const styleLabels = selectedStyles
      .map((id) => STYLE_TYPES.find((s) => s.id === id)?.label)
      .filter(Boolean);

    setAvatarDone(false);
    setAvatarResult(null);
    setLoading(true);
    startProgress();

    try {
      const result = await apiGenerateStyleAvatar({ styleTypes: styleLabels, forceFresh });
      stopProgress();
      setPercent(100);

      setAvatarResult({
        image: result.generatedImage,
        title: result.title,
        styleTypes: result.styleTypes,
        savedOutfitId: result.savedOutfitId,
        generationId: result.generationId,
        cacheHit: result.cacheHit,
      });
      setAvatarDone(Boolean(result.generatedImage));
      setTimeout(() => { setLoading(false); }, 220);
    } catch (error) {
      stopProgress();
      setLoading(false);
      setAvatarDone(false);
      setPercent(0);
      Alert.alert('Generation Failed', error?.message || 'Could not generate style avatar right now.');
    }
  };

  const handleOpenSavedAvatar = () => {
    if (!avatarResult?.image) return;

    navigation.navigate('SingleOutfitScreen', {
      id: avatarResult.savedOutfitId || avatarResult.generationId || undefined,
      image: avatarResult.image,
      name: avatarResult.title || 'Style Avatar',
      brand: 'AI Generated',
      category: 'AI Avatar',
      color: 'Mixed',
      season: 'All Season',
      source: 'ai',
      aiMeta: {
        occasion: 'style-avatar',
        explanation: avatarResult.styleTypes?.length
          ? `Generated from selected styles: ${avatarResult.styleTypes.join(', ')}.`
          : 'AI style avatar.',
      },
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>Style Avatar</Text>
        <View style={[styles.aiBadge, { backgroundColor: '#FF6B6B22', borderColor: '#FF6B6B' }]}>
          <Ionicons name="person-circle-outline" size={11} color="#FF6B6B" />
          <Text style={[styles.aiBadgeText, { color: '#FF6B6B' }]}>AI</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          Choose your style types and we will build your personalised fashion avatar.
        </Text>

        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>YOUR STYLE TYPES</Text>
        <View style={styles.styleGrid}>
          {STYLE_TYPES.map(s => {
            const active = selectedStyles.includes(s.id);
            return (
              <TouchableOpacity
                key={s.id}
                style={[
                  styles.styleCard,
                  { backgroundColor: theme.card, borderColor: active ? s.color : theme.border, borderWidth: active ? 2 : 0.5 },
                ]}
                onPress={() => toggleStyle(s.id)}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={[styles.styleIcon, { backgroundColor: s.color + '20' }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={[styles.styleLabel, { color: active ? s.color : theme.text }]}>{s.label}</Text>
                {active && <Ionicons name="checkmark-circle" size={16} color={s.color} style={{ position: 'absolute', top: 8, right: 8 }} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {!loading && !avatarDone && (
          <TouchableOpacity
            style={[styles.buildBtn, { backgroundColor: selectedStyles.length > 0 ? theme.primary : theme.card, opacity: selectedStyles.length > 0 ? 1 : 0.5 }]}
            onPress={() => buildAvatar(false)}
            disabled={selectedStyles.length === 0 || loading}
            activeOpacity={0.85}
          >
            <Ionicons name="person-circle-outline" size={18} color={selectedStyles.length > 0 ? '#141414' : theme.secondaryText} />
            <Text style={[styles.buildBtnText, { color: selectedStyles.length > 0 ? '#141414' : theme.secondaryText }]}>
              {selectedStyles.length === 0 ? 'Select at least 1 style' : 'Build My Avatar'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Loading — shimmer + progress line */}
        {loading && (
          <View style={[styles.loadingCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.heroLoadingWrap}>
              <ShimmerBox w="100%" h={300} r={14} style={{ marginBottom: 16 }} />
              <CircularLoadingOverlay theme={theme} percent={percent} width={width} />
            </View>
            <ShimmerBox w="54%" h={18} r={6} style={{ marginBottom: 10 }} />
            <ShimmerBox w="100%" h={12} r={5} style={{ marginBottom: 8 }} />
            <ShimmerBox w="86%" h={12} r={5} style={{ marginBottom: 8 }} />
            <ShimmerBox w="72%" h={12} r={5} style={{ marginBottom: 18 }} />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <ShimmerBox w="48%" h={44} r={50} />
              <ShimmerBox w="48%" h={44} r={50} />
            </View>
            <ProgressLine theme={theme} percent={percent} />
          </View>
        )}

        {/* Avatar result */}
        {avatarDone && !loading && (
          <View>
            <View style={[styles.resultHeader, { backgroundColor: theme.primary + '18', borderColor: theme.primary }]}>
              <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
              <Text style={[styles.resultHeaderText, { color: theme.primary }]}>Your style avatar is ready</Text>
            </View>

            <View style={[styles.avatarCardWide, { borderColor: theme.border, backgroundColor: theme.card }]}> 
              <Image source={{ uri: avatarResult?.image }} style={styles.avatarImgWide} />
              <View style={styles.avatarOverlayWide}>
                <Text style={styles.avatarOverlayTitle}>{avatarResult?.title || 'Style Avatar'}</Text>
                <Text style={styles.avatarOverlaySubtitle} numberOfLines={2}>
                  {(avatarResult?.styleTypes || []).join(' • ') || 'AI generated avatar'}
                </Text>
              </View>
            </View>

            {avatarResult?.cacheHit && (
              <View style={[styles.cacheBadge, { backgroundColor: theme.primary + '1F', borderColor: theme.primary }]}> 
                <Ionicons name="flash-outline" size={13} color={theme.primary} />
                <Text style={[styles.cacheBadgeText, { color: theme.primary }]}>Loaded from recent generation cache</Text>
              </View>
            )}

            <View style={styles.rebuiltActions}>
              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.primary }]} onPress={handleOpenSavedAvatar}> 
                <Ionicons name="open-outline" size={16} color="#141414" />
                <Text style={styles.saveBtnText}>View Saved Avatar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.border }]} onPress={() => buildAvatar(true)}>
                <Ionicons name="refresh-outline" size={16} color={theme.text} />
                <Text style={[styles.outlineBtnText, { color: theme.text }]}>Rebuild</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default StyleAvatarScreen;

const styles = StyleSheet.create({
  container:        { flex: 1, paddingHorizontal: 20 },
  nav:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  backBtn:          { width: 38, height: 38, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  navTitle:         { fontSize: 17, fontWeight: '700' },
  aiBadge:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },
  aiBadgeText:      { fontSize: 11, fontWeight: '800' },
  subtitle:         { fontSize: 13, lineHeight: 20, marginBottom: 20 },
  sectionLabel:     { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  styleGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  styleCard:        { width: '47%', borderRadius: 16, padding: 16, alignItems: 'center', gap: 10, position: 'relative' },
  styleIcon:        { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  styleLabel:       { fontSize: 13, fontWeight: '700' },
  buildBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 50, marginBottom: 24 },
  buildBtnText:     { fontSize: 15, fontWeight: '700' },
  loadingCard:      { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 20 },
  heroLoadingWrap:  { position: 'relative' },
  resultHeader:     { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  resultHeaderText: { fontSize: 13, fontWeight: '700' },
  avatarCardWide:   { borderRadius: 16, overflow: 'hidden', borderWidth: 1, marginBottom: 12 },
  avatarImgWide:    { width: '100%', height: 360, resizeMode: 'cover' },
  avatarOverlayWide:{ padding: 12, backgroundColor: 'rgba(10,10,10,0.56)' },
  avatarOverlayTitle:{ color: '#fff', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  avatarOverlaySubtitle:{ color: '#EEE', fontSize: 12, fontWeight: '600' },
  cacheBadge:       { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 16, alignSelf: 'flex-start' },
  cacheBadgeText:   { fontSize: 11, fontWeight: '700' },
  rebuiltActions:   { flexDirection: 'row', gap: 10, marginBottom: 20 },
  saveBtn:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 50 },
  saveBtnText:      { color: '#141414', fontWeight: '700', fontSize: 13 },
  outlineBtn:       { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 50, borderWidth: 1 },
  outlineBtnText:   { fontSize: 13, fontWeight: '600' },
});