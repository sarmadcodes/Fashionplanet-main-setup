import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, StatusBar, Animated, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';

// ── Outfit data — every combo has a unique men's fashion image ─
const AI_OUTFITS = {
  Casual: {
    Sunny: {
      title: 'Casual Sunny Look',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['White Linen Shirt', 'Light Chinos', 'Clean White Sneakers'],
      missing: 'Canvas Tote Bag', retailer: 'Zara',
      tip: 'Roll the sleeves for that effortless summer feel.',
    },
    Rainy: {
      title: 'Casual Rainy Day',
      image: 'https://images.pexels.com/photos/2896840/pexels-photo-2896840.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Oversized Hoodie', 'Slim Joggers', 'Waterproof Ankle Boots'],
      missing: 'Compact Umbrella', retailer: 'H&M',
      tip: 'Layer a windbreaker over the hoodie for extra protection.',
    },
    Cold: {
      title: 'Cosy Casual Winter',
      image: 'https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Chunky Knit Sweater', 'Dark Slim Jeans', 'Chelsea Boots'],
      missing: 'Wool Scarf', retailer: 'M&S',
      tip: 'Tuck the sweater slightly at the front for shape.',
    },
  },
  Business: {
    Sunny: {
      title: 'Power Summer Office',
      image: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Tailored Blazer', 'White Dress Shirt', 'Slim Fit Trousers', 'Oxford Shoes'],
      missing: 'Leather Belt', retailer: 'M&S',
      tip: 'Opt for lighter fabric blazers in breathable neutral tones.',
    },
    Rainy: {
      title: 'Sharp Rainy Office',
      image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Wool Overcoat', 'Navy Suit', 'Derby Shoes'],
      missing: 'Leather Briefcase', retailer: 'Next',
      tip: 'A wool overcoat keeps the sharp silhouette even in rain.',
    },
    Cold: {
      title: 'Winter Business Look',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Double Breasted Suit', 'Ribbed Turtleneck', 'Derby Shoes'],
      missing: 'Cashmere Overcoat', retailer: 'Zara',
      tip: 'The turtleneck replaces the tie for a modern executive look.',
    },
  },
  Party: {
    Sunny: {
      title: 'Day Party Look',
      image: 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Open Collar Linen Shirt', 'Tailored Shorts', 'Suede Loafers'],
      missing: 'Woven Leather Belt', retailer: 'ASOS',
      tip: 'Pair with a simple chain for the perfect day event look.',
    },
    Rainy: {
      title: 'Indoor Party Look',
      image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Satin Finish Shirt', 'Straight Leg Trousers', 'Chelsea Boots'],
      missing: 'Minimalist Watch', retailer: 'Zara',
      tip: 'Satin catches indoor lighting beautifully — keep it fitted.',
    },
    Cold: {
      title: 'Winter Night Out',
      image: 'https://images.pexels.com/photos/3766111/pexels-photo-3766111.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Velvet Blazer', 'Straight Leg Trousers', 'Ankle Boots'],
      missing: 'Wool Overcoat', retailer: 'H&M',
      tip: 'Velvet is winter party gold — rich texture, zero effort.',
    },
  },
  Weekend: {
    Sunny: {
      title: 'Weekend Brunch',
      image: 'https://images.pexels.com/photos/4349759/pexels-photo-4349759.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Linen Shirt', 'Chino Shorts', 'Espadrilles'],
      missing: 'Polarised Sunglasses', retailer: 'Mango',
      tip: 'Linen breathes well in the heat — ideal for a long sunny afternoon.',
    },
    Rainy: {
      title: 'Cosy Weekend',
      image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Fleece Zip-Up', 'Wide Leg Joggers', 'Slip-on Sneakers'],
      missing: 'Ribbed Beanie', retailer: 'Uniqlo',
      tip: 'Monochrome tonal sets look instantly more put-together.',
    },
    Cold: {
      title: 'Cold Weekend Casual',
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Sherpa Lined Jacket', 'Dark Slim Jeans', 'White Leather Trainers'],
      missing: 'Thermal Base Layer', retailer: 'H&M',
      tip: 'Sherpa jackets give cosy volume without looking overly bulky.',
    },
  },
};

const MOODS    = ['Casual', 'Business', 'Party', 'Weekend'];
const WEATHERS = ['Sunny', 'Rainy', 'Cold'];
const MOOD_ICONS    = { Casual: 'walk-outline', Business: 'briefcase-outline', Party: 'wine-outline', Weekend: 'cafe-outline' };
const WEATHER_ICONS = { Sunny: 'sunny-outline', Rainy: 'rainy-outline', Cold: 'snow-outline' };

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

// ── Generating View ───────────────────────────────────────────
const GeneratingView = ({ theme, percent }) => (
  <View style={[genStyles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <ShimmerBox w="100%" h={300} r={14} style={{ marginBottom: 20 }} />
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

const genStyles = StyleSheet.create({
  wrap: { borderRadius: 20, borderWidth: 1, padding: 16, marginTop: 24 },
});

// ── Result Card ───────────────────────────────────────────────
const ResultCard = ({ result, mood, weather, theme, onRegenerate }) => (
  <View style={[rcStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={rcStyles.imgWrap}>
      <Image source={{ uri: result.image }} style={rcStyles.img} />
      <View style={[rcStyles.aiOverlay, { backgroundColor: theme.primary }]}>
        <Ionicons name="sparkles" size={11} color="#141414" />
        <Text style={rcStyles.aiOverlayText}>AI Generated</Text>
      </View>
      <View style={[rcStyles.moodPill, { backgroundColor: 'rgba(0,0,0,0.55)' }]}>
        <Text style={rcStyles.moodPillText}>{mood}  ·  {weather}</Text>
      </View>
    </View>
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
        <TouchableOpacity style={[rcStyles.shopBtn, { backgroundColor: theme.primary }]}>
          <Text style={rcStyles.shopBtnText}>Shop</Text>
        </TouchableOpacity>
      </View>
      <View style={rcStyles.actionsRow}>
        <TouchableOpacity style={[rcStyles.outlineBtn, { borderColor: theme.border }]} onPress={onRegenerate}>
          <Ionicons name="refresh-outline" size={16} color={theme.text} />
          <Text style={[rcStyles.outlineBtnText, { color: theme.text }]}>Regenerate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rcStyles.outlineBtn, { borderColor: theme.border }]}>
          <Ionicons name="bookmark-outline" size={16} color={theme.text} />
          <Text style={[rcStyles.outlineBtnText, { color: theme.text }]}>Save Look</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rcStyles.shareBtn, { backgroundColor: theme.primary }]}>
          <Ionicons name="share-social-outline" size={16} color="#141414" />
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
  shareBtn:       { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});

// ── Main Screen ───────────────────────────────────────────────
const GenerateOutfitsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [mood, setMood]             = useState('Casual');
  const [weather, setWeather]       = useState('Sunny');
  const [generating, setGenerating] = useState(false);
  const [percent, setPercent]       = useState(0);
  const [result, setResult]         = useState(null);
  const timerRef = useRef(null);

  const startGeneration = () => {
    setResult(null);
    setPercent(0);
    setGenerating(true);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += Math.floor(Math.random() * 3) + 2;
      if (p >= 100) {
        p = 100;
        setPercent(100);
        clearInterval(timerRef.current);
        setTimeout(() => {
          setGenerating(false);
          setResult(AI_OUTFITS[mood]?.[weather] || AI_OUTFITS['Casual']['Sunny']);
        }, 500);
      } else {
        setPercent(p);
      }
    }, 160);
  };

  useEffect(() => () => { clearInterval(timerRef.current); }, []);
  const handleRegenerate = () => { setResult(null); startGeneration(); };

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
          <TouchableOpacity style={[styles.genBtn, { backgroundColor: theme.primary }]} onPress={startGeneration} activeOpacity={0.85}>
            <Ionicons name="sparkles" size={18} color="#141414" />
            <Text style={styles.genBtnText}>Generate My Outfit</Text>
          </TouchableOpacity>
        )}

        {generating && <GeneratingView theme={theme} percent={percent} />}

        {result && !generating && (
          <ResultCard result={result} mood={mood} weather={weather} theme={theme} onRegenerate={handleRegenerate} />
        )}
      </ScrollView>
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
});