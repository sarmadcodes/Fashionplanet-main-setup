import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Animated, Image, Alert, Modal, ActivityIndicator, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { apiGenerateOutfit, apiLogOutfitFeedback } from '../services/apiService';
import {
  GENERATE_MOOD_ICONS,
  GENERATE_MOODS,
  GENERATE_WEATHER_ICONS,
  GENERATE_WEATHERS,
} from '../config/uiOptions';

const MOODS = GENERATE_MOODS;
const WEATHERS = GENERATE_WEATHERS;
const MOOD_ICONS = GENERATE_MOOD_ICONS;
const WEATHER_ICONS = GENERATE_WEATHER_ICONS;

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

// ── Generating View ───────────────────────────────────────────
const GeneratingView = ({ theme, percent, width }) => {
  const heroHeight = Math.max(220, Math.min(340, Math.round(width * 0.82)));

  return (
    <View style={[genStyles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={genStyles.heroLoadingWrap}>
        <ShimmerBox w="100%" h={heroHeight} r={14} style={{ marginBottom: 20 }} />
        <CircularLoadingOverlay theme={theme} percent={percent} width={width} />
      </View>
      <View style={{ paddingHorizontal: 2 }}>
        <ShimmerBox w="52%" h={22} r={6} style={{ marginBottom: 16 }} />
        <ShimmerBox w="100%" h={13} r={5} style={{ marginBottom: 10 }} />
        <ShimmerBox w="100%" h={13} r={5} style={{ marginBottom: 10 }} />
        <ShimmerBox w="76%" h={13} r={5} style={{ marginBottom: 10 }} />
        <ShimmerBox w="88%" h={13} r={5} style={{ marginBottom: 20 }} />
        <ShimmerBox w="100%" h={52} r={12} style={{ marginBottom: 12 }} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <ShimmerBox w="48%" h={46} r={50} />
          <ShimmerBox w="48%" h={46} r={50} />
        </View>
        <ProgressLine theme={theme} percent={percent} />
      </View>
    </View>
  );
};

const genStyles = StyleSheet.create({
  wrap: { borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 24 },
  heroLoadingWrap: { position: 'relative' },
});

// ── Result Card ───────────────────────────────────────────────
const ResultCard = ({ result, mood, weather, theme, onRegenerate, onSave, onWore, onOpenFull, onOpenDetails }) => (
  <View style={[rcStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <TouchableOpacity style={rcStyles.imgWrap} activeOpacity={0.9} onPress={onOpenFull}>
      <Image source={{ uri: result.image }} style={rcStyles.img} />
      <View style={[rcStyles.aiOverlay, { backgroundColor: theme.primary }]}>
        <Ionicons name="sparkles" size={11} color="#141414" />
        <Text style={rcStyles.aiOverlayText}>AI Generated</Text>
      </View>
      <View style={[rcStyles.moodPill, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
        <Text style={rcStyles.moodPillText}>{mood}  ·  {weather}</Text>
      </View>
      <View style={rcStyles.expandHint}>
        <Ionicons name="expand-outline" size={15} color="#fff" />
      </View>
    </TouchableOpacity>
    <View style={{ padding: 18 }}>
      <Text style={[rcStyles.title, { color: theme.text }]}>{result.title}</Text>
      <Text style={[rcStyles.label, { color: theme.secondaryText }]}>ITEMS IN THIS LOOK</Text>
      {result.items.map((item, idx) => (
        <View key={idx} style={rcStyles.itemRow}>
          <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
          <Text style={[rcStyles.itemText, { color: theme.text }]}>{item}</Text>
        </View>
      ))}
      <View style={[rcStyles.tipBox, { backgroundColor: theme.primary + '12', borderColor: theme.primary + '40' }]}>
        <Ionicons name="bulb-outline" size={15} color={theme.primary} />
        <Text style={[rcStyles.tipText, { color: theme.text }]}>{result.tip}</Text>
      </View>
      <View style={[rcStyles.missingBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <View style={rcStyles.missingLeft}>
          <Ionicons name="bag-handle-outline" size={16} color={theme.secondaryText} />
          <View style={{ flex: 1 }}>
            <Text style={[rcStyles.missingLabel, { color: theme.secondaryText }]}>COMPLETE THE LOOK</Text>
            <Text style={[rcStyles.missingItem, { color: theme.text }]}>{result.missing}</Text>
            <Text style={[rcStyles.missingRetailer, { color: theme.secondaryText }]}>Available at {result.retailer}</Text>
          </View>
        </View>
        <TouchableOpacity style={[rcStyles.shopBtn, { backgroundColor: theme.primary }]} onPress={onWore}>
          <Text style={rcStyles.shopBtnText}>I Wore This</Text>
        </TouchableOpacity>
      </View>
      <View style={rcStyles.actionsRow}>
        <TouchableOpacity style={[rcStyles.outlineBtn, { borderColor: theme.border }]} onPress={onRegenerate}>
          <Ionicons name="refresh-outline" size={16} color={theme.text} />
          <Text style={[rcStyles.outlineBtnText, { color: theme.text }]}>Regenerate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rcStyles.outlineBtn, { borderColor: theme.border }]} onPress={onOpenDetails}>
          <Ionicons name="scan-outline" size={16} color={theme.text} />
          <Text style={[rcStyles.outlineBtnText, { color: theme.text }]}>Details</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rcStyles.outlineBtn, { borderColor: theme.border }]} onPress={onSave}>
          <Ionicons name="bookmark-outline" size={16} color={theme.text} />
          <Text style={[rcStyles.outlineBtnText, { color: theme.text }]}>Save Look</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const rcStyles = StyleSheet.create({
  card:           { borderRadius: 20, borderWidth: 1, marginTop: 24, overflow: 'hidden' },
  imgWrap:        { position: 'relative' },
  img:            { width: '100%', height: 340, resizeMode: 'cover' },
  aiOverlay:      { position: 'absolute', top: 12, left: 12, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 50 },
  aiOverlayText:  { color: '#141414', fontSize: 10, fontWeight: '800' },
  moodPill:       { position: 'absolute', bottom: 12, right: 12, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 50 },
  moodPillText:   { color: '#fff', fontSize: 11, fontWeight: '700' },
  expandHint:     { position: 'absolute', bottom: 12, left: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  title:          { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  label:          { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 10 },
  itemRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  itemText:       { fontSize: 14, flex: 1 },
  tipBox:         { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginTop: 12, marginBottom: 16 },
  tipText:        { flex: 1, fontSize: 12, lineHeight: 18 },
  missingBox:     { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16, gap: 12 },
  missingLeft:    { flex: 1, flexDirection: 'row', gap: 10 },
  missingLabel:   { fontSize: 9, fontWeight: '700', letterSpacing: 1, marginBottom: 2 },
  missingItem:    { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  missingRetailer:{ fontSize: 11 },
  shopBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50 },
  shopBtnText:    { color: '#141414', fontWeight: '700', fontSize: 12 },
  actionsRow:     { flexDirection: 'row', gap: 10, alignItems: 'center' },
  outlineBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 50, borderWidth: 1 },
  outlineBtnText: { fontSize: 12, fontWeight: '600' },
});

// ── Main Screen ───────────────────────────────────────────────
const GenerateOutfitsScreen = ({ navigation }) => {
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [mood, setMood]             = useState('Casual');
  const [weather, setWeather]       = useState('Sunny');
  const [generating, setGenerating] = useState(false);
  const [percent, setPercent]       = useState(0);
  const [result, setResult]         = useState(null);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [prefetchedOutfits, setPrefetchedOutfits] = useState({});
  const timerRef = useRef(null);
  const startedAtRef = useRef(0);
  const requestRef = useRef(0);
  const inFlightRef = useRef(false);
  const autoGenerateRef = useRef('');

  const getContextKey = (selectedMood, selectedWeather) => `${selectedMood}:${selectedWeather}`;

  const startGeneration = async (forceFresh = false) => {
    if (inFlightRef.current) return;

    const key = getContextKey(mood, weather);
    if (!forceFresh && prefetchedOutfits[key]) {
      setGenerating(true);
      setPercent(100);
      setTimeout(() => {
        setResult(prefetchedOutfits[key]);
        setGenerating(false);
      }, 350);
      return;
    }

    inFlightRef.current = true;

    requestRef.current += 1;
    const requestId = requestRef.current;

    setResult(null);
    setPercent(0);
    setGenerating(true);
    startedAtRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAtRef.current;
      const estimatedMs = 45000;
      const progressed = Math.round((elapsed / estimatedMs) * 95);
      setPercent(Math.max(2, Math.min(95, progressed)));
    }, 150);

    try {
      const generated = await apiGenerateOutfit({ mood, weather, isPrefetch: false, forceFresh });
      if (requestId !== requestRef.current) return;

      clearInterval(timerRef.current);
      setPercent(100);
      setPrefetchedOutfits((prev) => ({ ...prev, [key]: generated }));
      setTimeout(() => {
        setGenerating(false);
        setResult(generated);
      }, 250);
    } catch (error) {
      if (requestId !== requestRef.current) return;
      clearInterval(timerRef.current);
      setGenerating(false);
      setPercent(0);
      const rawMessage = error?.message || 'Could not generate outfit right now.';
      const isAiConfigError = /AI is not configured|OPENAI_API_KEY/i.test(rawMessage);
      Alert.alert(
        isAiConfigError ? 'AI Setup Required' : 'Unable to Generate Outfit',
        isAiConfigError
          ? 'AI is not configured on the backend yet. Add OPENAI_API_KEY in backend .env and restart the server.'
          : rawMessage
      );
    } finally {
      inFlightRef.current = false;
    }
  };

  useEffect(() => {
    const similarNonce = String(route?.params?.similarNonce || '');
    if (!similarNonce || autoGenerateRef.current === similarNonce) return;

    autoGenerateRef.current = similarNonce;

    const routeMood = String(route?.params?.initialMood || '').trim();
    const routeWeather = String(route?.params?.initialWeather || '').trim();

    if (MOODS.includes(routeMood)) {
      setMood(routeMood);
    }
    if (WEATHERS.includes(routeWeather)) {
      setWeather(routeWeather);
    }

    setResult(null);
    setPrefetchedOutfits({});

    setTimeout(() => {
      startGeneration(true);
    }, 0);
  }, [route?.params?.similarNonce]);

  useEffect(() => () => { clearInterval(timerRef.current); }, []);

  const handleLogFeedback = async (action) => {
    try {
      await apiLogOutfitFeedback({ generationId: result?.generationId || null, action });
      if (action === 'saved') {
        Alert.alert('Saved', 'Outfit saved to your AI history.');
      }
      if (action === 'worn') {
        Alert.alert('Logged', 'Great. We updated your wear history.');
      }
    } catch (error) {
      Alert.alert('Action Failed', error?.message || 'Could not update feedback.');
    }
  };

  const handleRegenerate = async () => {
    if (result?.generationId) {
      await handleLogFeedback('regenerated');
    }
    const key = getContextKey(mood, weather);
    setPrefetchedOutfits((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setResult(null);
    startGeneration(true);
  };

  const openDetailScreen = () => {
    if (!result) return;
    navigation.navigate('SingleOutfitScreen', {
      id: result.savedOutfitId || result.generationId || undefined,
      image: result.image,
      name: result.title,
      brand: result.source === 'ai' ? 'AI Generated' : 'Fashion Planet',
      category: 'AI Outfit',
      color: 'Mixed',
      season: weather,
      source: 'ai',
      aiMeta: {
        explanation: result.explanation,
        weatherNote: result.weatherNote,
        tips: result.tips || [],
        occasion: mood,
        preferredWeather: weather,
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
        <Text style={[styles.navTitle, { color: theme.text }]}>AI Outfit Generator</Text>
        <View style={[styles.aiBadge, { backgroundColor: theme.primary + '22', borderColor: theme.primary }]}>
          <Ionicons name="sparkles" size={11} color={theme.primary} />
          <Text style={[styles.aiBadgeText, { color: theme.primary }]}>AI</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>SELECT MOOD</Text>
        <View style={styles.moodGrid}>
          {MOODS.map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.moodChip, { borderColor: theme.border, backgroundColor: theme.card }, mood === m && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => { setMood(m); setResult(null); }}
              disabled={generating}
            >
              <Ionicons name={MOOD_ICONS[m]} size={16} color={mood === m ? '#141414' : theme.secondaryText} />
              <Text style={[styles.moodText, { color: mood === m ? '#141414' : theme.text }]}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: theme.secondaryText, marginTop: 22 }]}>WEATHER TODAY</Text>
        <View style={styles.weatherRow}>
          {WEATHERS.map((w) => (
            <TouchableOpacity
              key={w}
              style={[styles.weatherChip, { borderColor: theme.border, backgroundColor: theme.card }, weather === w && { backgroundColor: theme.primary, borderColor: theme.primary }]}
              onPress={() => { setWeather(w); setResult(null); }}
              disabled={generating}
            >
              <Ionicons name={WEATHER_ICONS[w]} size={22} color={weather === w ? '#141414' : theme.secondaryText} />
              <Text style={[styles.weatherText, { color: weather === w ? '#141414' : theme.text }]}>{w}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!generating && !result && (
          <TouchableOpacity style={[styles.genBtn, { backgroundColor: theme.primary }]} onPress={() => startGeneration(false)} activeOpacity={0.85}>
            <Ionicons name="sparkles" size={18} color="#141414" />
            <Text style={styles.genBtnText}>{prefetchedOutfits[getContextKey(mood, weather)] ? 'Show Ready Outfit' : 'Generate My Outfit'}</Text>
          </TouchableOpacity>
        )}

        {generating && <GeneratingView theme={theme} percent={percent} width={width} />}

        {result && !generating && (
          <ResultCard
            result={result}
            mood={mood}
            weather={weather}
            theme={theme}
            onRegenerate={handleRegenerate}
            onSave={() => handleLogFeedback('saved')}
            onWore={() => handleLogFeedback('worn')}
            onOpenFull={() => setShowFullPreview(true)}
            onOpenDetails={openDetailScreen}
          />
        )}
      </ScrollView>

      <Modal visible={showFullPreview} animationType="fade" transparent onRequestClose={() => setShowFullPreview(false)}>
        <View style={styles.previewBackdrop}>
          <View style={[styles.previewCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
            <TouchableOpacity style={styles.previewClose} onPress={() => setShowFullPreview(false)}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
            <Image source={{ uri: result?.image }} style={styles.previewImage} resizeMode="contain" />
            <View style={styles.previewMeta}>
              <Text style={[styles.previewTitle, { color: theme.text }]}>{result?.title || 'AI Outfit'}</Text>
              <Text style={[styles.previewText, { color: theme.secondaryText }]}>{result?.explanation || ''}</Text>
              <TouchableOpacity style={[styles.previewAction, { backgroundColor: theme.primary }]} onPress={() => { setShowFullPreview(false); openDetailScreen(); }}>
                <Text style={styles.previewActionText}>Open Full Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default GenerateOutfitsScreen;

const styles = StyleSheet.create({
  container:    { flex: 1, paddingHorizontal: 20 },
  nav:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 },
  backBtn:      { width: 38, height: 38, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  navTitle:     { fontSize: 17, fontWeight: '700' },
  aiBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50, borderWidth: 1 },
  aiBadgeText:  { fontSize: 11, fontWeight: '800' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12 },
  moodGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  moodChip:     { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 11, borderRadius: 50, borderWidth: 1.5 },
  moodText:     { fontSize: 13, fontWeight: '600' },
  weatherRow:   { flexDirection: 'row', gap: 10 },
  weatherChip:  { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 16, borderRadius: 16, borderWidth: 1.5 },
  weatherText:  { fontSize: 12, fontWeight: '600' },
  genBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, height: 54, borderRadius: 50, marginTop: 28 },
  genBtnText:   { color: '#141414', fontSize: 16, fontWeight: '700' },
  previewBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', justifyContent: 'center', paddingHorizontal: 16 },
  previewCard: { borderWidth: 1, borderRadius: 18, overflow: 'hidden' },
  previewClose: { position: 'absolute', top: 12, right: 12, zIndex: 2, width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '100%', height: 460, backgroundColor: '#0F0F0F' },
  previewMeta: { padding: 14 },
  previewTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  previewText: { fontSize: 12, lineHeight: 18 },
  previewAction: { marginTop: 12, alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 9 },
  previewActionText: { color: '#141414', fontWeight: '700', fontSize: 12 },
});