import {
  ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View, ActivityIndicator, RefreshControl, Animated, Image,
} from 'react-native';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import QuickactionCard from '../components/cards/QuickactionCard';
import StyleCard from '../components/cards/StyleCard';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchWardrobeItems, apiFetchHomeData } from '../services/mockApi';

// ─── Skeleton ────────────────────────────────────────────────────────────────
const Skeleton = ({ w, h, r = 10, style }) => {
  const { isDark } = useTheme();
  return (
    <View
      style={[
        { width: w, height: h, borderRadius: r, backgroundColor: isDark ? '#1F1F1F' : '#ECECEC' },
        style,
      ]}
    />
  );
};

// ─── Weather Banner ───────────────────────────────────────────────────────────
const WeatherBanner = ({ theme, navigation, weather = 'Sunny', temp = '22°C' }) => (
  <TouchableOpacity
    style={[bannerStyles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => navigation.navigate('GenerateOutfitsScreen')}
    activeOpacity={0.7}
  >
    <View style={bannerStyles.left}>
      <View style={[bannerStyles.iconBox, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name="sunny" size={24} color={theme.primary} />
      </View>
      <View>
        <Text style={[bannerStyles.label, { color: theme.secondaryText }]}>Today's Weather</Text>
        <Text style={[bannerStyles.value, { color: theme.text }]}>{weather} • {temp}</Text>
      </View>
    </View>
    <View style={bannerStyles.weatherCta}>
      <Text style={[bannerStyles.ctaText, { color: theme.primary }]}>Generate Outfit</Text>
      <Ionicons name="chevron-forward" size={18} color={theme.primary} />
    </View>
  </TouchableOpacity>
);

const bannerStyles = StyleSheet.create({
  wrap:    { flexDirection: 'row', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'space-between', borderWidth: 0.5, marginBottom: 24, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3 },
  left:    { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  label:   { fontSize: 12, marginBottom: 3, fontWeight: '500' },
  value:   { fontWeight: '700', fontSize: 14 },
  ctaText: { fontWeight: '700', fontSize: 13 },
  weatherCta: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});

// ─── Recent Outfit Card ───────────────────────────────────────────────────────
const RecentOutfitCard = ({ item, theme, onPress }) => (
  <TouchableOpacity
    style={[rcStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => onPress(item)}
    activeOpacity={0.75}
  >
    <Image source={typeof item.image === 'string' ? { uri: item.image } : item.image} style={rcStyles.img} />
    <View style={rcStyles.info}>
      <Text style={[rcStyles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[rcStyles.sub, { color: theme.secondaryText }]}>{item.subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const rcStyles = StyleSheet.create({
  card:  { width: 130, borderRadius: 14, overflow: 'hidden', borderWidth: 0.5, marginRight: 12 },
  img:   { width: '100%', height: 160, resizeMode: 'cover' },
  info:  { padding: 10 },
  title: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  sub:   { fontSize: 11, fontWeight: '500' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [wardrobeItems, setWardrobe] = useState([]);
  const [homeData, setHomeData]     = useState({ greeting: 'Welcome back', weather: 'Sunny', temp: '22°C', recentOutfits: [] });
  const [error, setError]           = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => { load(); }, [])
  );

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const [items, data] = await Promise.all([
        apiFetchWardrobeItems(),
        apiFetchHomeData(),
      ]);
      setWardrobe(items);
      setHomeData(data);
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    } catch (err) {
      setError('Failed to load. Pull down to refresh.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      const [items, data] = await Promise.all([
        apiFetchWardrobeItems(),
        apiFetchHomeData(),
      ]);
      setWardrobe(items);
      setHomeData(data);
    } catch {
      setError('Failed to refresh. Try again.');
    } finally {
      setRefreshing(false);
    }
  };

  const PLACEHOLDER_WARDROBE = [
    { id: 'ph1', title: 'Dresses',  subtitle: `${wardrobeItems.filter(i => i.category === 'Dresses').length} items`, image: 'https://img.freepik.com/free-photo/beautiful-girl-with-black-hair-holding-decorated-denim-jacket_197531-7370.jpg' },
    { id: 'ph2', title: 'Jeans',    subtitle: `${wardrobeItems.filter(i => i.category === 'Bottoms').length} items`, image: 'https://img.freepik.com/free-photo/high-fashion-look-glamor-stylish-beautiful-young-brunette-woman-model-summer-bright-hipster-cloth-glasses-coat_158538-14034.jpg?semt=ais_hybrid&w=740&q=80' },
    { id: 'ph3', title: 'Shoes',    subtitle: `${wardrobeItems.filter(i => i.category === 'Shoes').length} items`,  image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdxvigm7qiPd718ZM649bYgdTiZNNN1UhFpw&s' },
  ];

  const displayWardrobe = wardrobeItems.length > 0 ? wardrobeItems.slice(0, 3) : PLACEHOLDER_WARDROBE;
  const recentOutfits = homeData.recentOutfits || [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View>
              <Text style={[styles.greeting, { color: theme.secondaryText }]}>{homeData.greeting || 'Welcome back'}</Text>
            <Text style={[styles.pageTitle, { color: theme.text }]}>Your Wardrobe</Text>
          </View>
          <TouchableOpacity
            style={[styles.notifBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => navigation.navigate('NotificationsScreen')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={{ paddingBottom: 100 }}>
            <Skeleton w="100%" h={80} r={16} style={{ marginBottom: 24 }} />
            <Skeleton w={140} h={16} r={6} style={{ marginBottom: 12 }} />
            <View style={styles.skeletonRow}>
              {[1, 2, 3].map(i => <Skeleton key={i} w="30%" h={100} r={12} />)}
            </View>
            <Skeleton w={160} h={16} r={6} style={{ marginBottom: 12, marginTop: 24 }} />
            <View style={styles.skeletonRow}>
              {[1, 2, 3].map(i => <Skeleton key={i} w="30%" h={140} r={12} />)}
            </View>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={48} color={theme.secondaryText} />
            <Text style={[styles.errorTitle, { color: theme.text }]}>{error}</Text>
            <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={load}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Animated.View style={[{ opacity: fadeAnim }, { paddingBottom: 110 }]}>
            {/* Weather Banner */}
            <WeatherBanner theme={theme} navigation={navigation} weather={homeData.weather} temp={homeData.temp} />

            {/* Quick Actions */}
            <QuickactionCard theme={theme} />

            {/* My Wardrobe Section */}
            <View style={styles.sectionRow}>
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>My Wardrobe</Text>
                <Text style={[styles.sectionSub, { color: theme.secondaryText }]}>
                  {wardrobeItems.length} item{wardrobeItems.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Wardrobe')} activeOpacity={0.7}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>

            {wardrobeItems.length === 0 ? (
              <View style={[styles.emptyWardrobeBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="shirt" size={40} color={theme.secondaryText} />
                <Text style={[styles.emptyWardrobeTitle, { color: theme.text }]}>Empty Wardrobe</Text>
                <Text style={[styles.emptyWardrobeSub, { color: theme.secondaryText }]}>
                  Add your first item to get started
                </Text>
                <TouchableOpacity
                  style={[styles.emptyWardrobeBtn, { backgroundColor: theme.primary }]}
                  onPress={() => navigation.navigate('AddItemsScreen')}
                >
                  <Ionicons name="add" size={16} color="#141414" />
                  <Text style={styles.emptyWardrobeBtnText}>Add Item</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <StyleCard
                type="standard"
                data={displayWardrobe}
                theme={theme}
                onPress={({ item }) => navigation.navigate('OutfitsScreen', { product: item })}
              />
            )}

            {/* Recent Outfits Section */}
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Outfits</Text>
              <TouchableOpacity onPress={() => navigation.navigate('OutfitsScreen', {})} activeOpacity={0.7}>
                <Text style={[styles.seeAll, { color: theme.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
              {recentOutfits.map(item => (
                <RecentOutfitCard
                  key={item.id}
                  item={item}
                  theme={theme}
                  onPress={() => navigation.navigate('OutfitsScreen', { product: item })}
                />
              ))}
              {recentOutfits.length === 0 && (
                <View style={[styles.emptyWardrobeBox, { backgroundColor: theme.card, borderColor: theme.border, width: '100%' }]}>
                  <Ionicons name="images-outline" size={36} color={theme.secondaryText} />
                  <Text style={[styles.emptyWardrobeTitle, { color: theme.text }]}>No recent outfits yet</Text>
                  <Text style={[styles.emptyWardrobeSub, { color: theme.secondaryText }]}>Add wardrobe items to generate your recent looks.</Text>
                </View>
              )}
            </ScrollView>

            {/* FAB */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddItemsScreen')}
                style={[styles.fab, { backgroundColor: theme.primary }]}
                activeOpacity={0.75}
              >
                <Ionicons name="add" size={28} color="#141414" />
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container:            { flex: 1, paddingHorizontal: 20 },
  headerRow:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 16 },
  greeting:             { fontSize: 13, fontWeight: '500' },
  pageTitle:            { fontSize: 28, fontWeight: '700', marginTop: 4 },
  notifBtn:             { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 0.5, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 1 }, shadowRadius: 2 },
  sectionRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  sectionTitle:         { fontSize: 18, fontWeight: '700' },
  sectionSub:           { fontSize: 12, marginTop: 2, fontWeight: '500' },
  seeAll:               { fontSize: 13, fontWeight: '600' },
  skeletonRow:          { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  errorState:           { alignItems: 'center', justifyContent: 'center', paddingVertical: 100, gap: 16 },
  errorTitle:           { fontSize: 18, fontWeight: '700' },
  retryBtn:             { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 50 },
  retryText:            { color: '#141414', fontWeight: '700', fontSize: 14 },
  emptyWardrobeBox:     { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: 'center', gap: 12, marginBottom: 24 },
  emptyWardrobeTitle:   { fontSize: 16, fontWeight: '700' },
  emptyWardrobeSub:     { fontSize: 13, textAlign: 'center', lineHeight: 18 },
  emptyWardrobeBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50, marginTop: 8 },
  emptyWardrobeBtnText: { color: '#141414', fontWeight: '700', fontSize: 14 },
  fab:                  { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 5, marginTop: 16 },
});