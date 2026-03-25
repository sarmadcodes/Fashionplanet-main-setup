import React, { useState, useCallback, useRef } from 'react';
import {
  Image, ScrollView, StatusBar, StyleSheet, Text,
  TouchableOpacity, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchAiOutfits, apiFetchOutfits, apiFetchProfile, apiFetchSavedPosts } from '../services/apiService';
import { getSavedPosts } from '../services/appStore';

// ─── Skeleton ─────────────────────────────────────────────────
const Skeleton = ({ w, h, r = 8, style }) => {
  const { isDark } = useTheme();
  return (
    <View style={[{ width: w, height: h, borderRadius: r, backgroundColor: isDark ? '#2A2A2A' : '#E8E8E8' }, style]} />
  );
};

// ─── Menu items ───────────────────────────────────────────────
const MENU_ITEMS = [
  { label: 'My Outfits',       icon: 'shirt-outline',    screen: 'OutfitsScreen'  },
  { label: 'Saved Posts',      icon: 'bookmark-outline', screen: 'SavedPostsScreen' },
  { label: 'Rewards & Points', icon: 'gift-outline',     screen: 'RewardsScreen'  },
  { label: 'Vouchers',         icon: 'pricetag-outline', screen: 'VouchersScreen' },
  { label: 'Week Planner',     icon: 'calendar-outline', screen: 'WeekPlanScreen' },
  { label: 'Insights',         icon: 'bar-chart-outline',screen: 'InsightsScreen'  },
];

// ─── Initials Avatar — no local asset needed ──────────────────
const InitialsAvatar = ({ name, size = 72, theme }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'DS';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#141414', fontWeight: '800', fontSize: size * 0.35 }}>{initials}</Text>
    </View>
  );
};

const ProfileAvatar = ({ uri, name, size = 72, theme }) => {
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return <InitialsAvatar name={name} size={size} theme={theme} />;
};

// ─── Saved Post Card ──────────────────────────────────────────
const SavedPostCard = ({ item, theme, width, onPress }) => (
  <TouchableOpacity
    style={[{
      width: (width - 52) / 2,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: theme.card,
      borderWidth: 0.5,
      borderColor: theme.border,
    }]}
    onPress={() => onPress?.(item)}
    activeOpacity={0.8}
  >
    {item.images && item.images.length > 0 && (
      <Image
        source={{ uri: item.images[0] }}
        style={{ width: '100%', height: 140, resizeMode: 'cover' }}
      />
    )}
    <View style={{ padding: 10 }}>
      <Text style={[{ fontSize: 12, fontWeight: '700', color: theme.text }]} numberOfLines={1}>
        {item.userName}
      </Text>
      <Text style={[{ fontSize: 11, color: theme.secondaryText, marginTop: 2 }]} numberOfLines={2}>
        {item.caption}
      </Text>
      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Ionicons name="heart" size={12} color="#E53E3E" />
          <Text style={[{ fontSize: 10, color: theme.secondaryText }]}>{item.likes}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
          <Ionicons name="chatbubble" size={12} color={theme.primary} />
          <Text style={[{ fontSize: 10, color: theme.secondaryText }]}>{item.comments}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Outfit thumbnail card ────────────────────────────────────
const OutfitThumbCard = ({ item, theme, onPress }) => (
  <TouchableOpacity
    style={[thumbStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => onPress(item)}
    activeOpacity={0.8}
  >
    <Image
      source={typeof item.image === 'string' ? { uri: item.image } : item.image}
      style={thumbStyles.img}
    />
    <View style={thumbStyles.info}>
      <Text style={[thumbStyles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[thumbStyles.sub, { color: theme.secondaryText }]}>{item.subtitle}</Text>
    </View>
  </TouchableOpacity>
);

const thumbStyles = StyleSheet.create({
  card:  { flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 0.5 },
  img:   { width: '100%', height: 110, resizeMode: 'cover' },
  info:  { padding: 10 },
  title: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  sub:   { fontSize: 11 },
});

// ─── Main Screen ──────────────────────────────────────────────
const ProfileScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const { updateUser } = useAuth();
  const { width } = useWindowDimensions();
  const theme = isDark ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(true);
  const hasLoadedOnceRef = useRef(false);
  const loadingRef = useRef(false);
  const updateUserRef = useRef(updateUser);
  const [profile, setProfile] = useState(null);
  const [recentOutfits, setRecentOutfits] = useState([]);
  const [aiOutfits, setAiOutfits] = useState([]);
  const [aiAvatars, setAiAvatars] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);

  updateUserRef.current = updateUser;

  const load = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      if (!hasLoadedOnceRef.current) {
        setLoading(true);
      }

      const [profileResult, outfitsResult, aiLooksResult, savedResult] = await Promise.allSettled([
        apiFetchProfile(),
        apiFetchOutfits(),
        apiFetchAiOutfits(),
        apiFetchSavedPosts(),
      ]);

      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value);
        updateUserRef.current?.(profileResult.value);
      }

      if (outfitsResult.status === 'fulfilled') {
        setRecentOutfits((outfitsResult.value || []).filter((item) => item?.source !== 'ai').slice(0, 3).map((item) => ({
          ...item,
          subtitle: item.category || item.brand || 'Outfit',
        })));
      }

      if (aiLooksResult.status === 'fulfilled') {
        const normalizedAiLooks = (aiLooksResult.value || []).map((item) => ({
          ...item,
          subtitle: item?.aiMeta?.occasion || item?.category || 'AI Outfit',
        }));

        setAiOutfits(normalizedAiLooks
          .filter((item) => String(item?.aiMeta?.occasion || '').toLowerCase() !== 'style-avatar')
          .slice(0, 4));

        setAiAvatars(normalizedAiLooks
          .filter((item) => String(item?.aiMeta?.occasion || '').toLowerCase() === 'style-avatar')
          .slice(0, 4));
      }

      if (savedResult.status === 'fulfilled') {
        setSavedPosts((savedResult.value || []).map((p) => ({
          ...p,
          id: p.id || p._id,
        })));
      } else {
        setSavedPosts((getSavedPosts() || []).map((p) => ({
          ...p,
          id: p.id || p._id,
        })));
      }

      hasLoadedOnceRef.current = true;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useFocusEffect(
    useCallback(() => { load(); }, [load])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 110 }}>

          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text }]}>Profile</Text>
            <TouchableOpacity
              style={[styles.settingsBtn, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('SettingsScreen')}
            >
              <Ionicons name="settings-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Profile card */}
          <View style={[styles.profileCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {loading ? (
              <View style={styles.profileCardInner}>
                <Skeleton w={72} h={72} r={36} />
                <View style={{ flex: 1, gap: 8, marginLeft: 16 }}>
                  <Skeleton w={140} h={14} />
                  <Skeleton w={100} h={12} />
                  <Skeleton w={160} h={11} />
                </View>
              </View>
            ) : (
              <View style={styles.profileCardInner}>
                <ProfileAvatar uri={profile?.avatar} name={profile?.fullName} size={72} theme={theme} />
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[styles.fullName, { color: theme.text }]}>{profile?.fullName}</Text>
                  <Text style={[styles.username, { color: theme.secondaryText }]}>@{profile?.username || 'new_user'}</Text>
                  <Text style={[styles.email, { color: theme.secondaryText }]}>{profile?.email}</Text>
                  {profile?.bio ? (
                    <Text style={[styles.bio, { color: theme.secondaryText }]} numberOfLines={2}>
                      {profile.bio}
                    </Text>
                  ) : null}
                </View>
              </View>
            )}

            {/* Stats */}
            <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
              {loading ? (
                [1, 2, 3].map(i => (
                  <View key={i} style={styles.statItem}>
                    <Skeleton w={32} h={18} />
                    <Skeleton w={40} h={11} style={{ marginTop: 4 }} />
                  </View>
                ))
              ) : (
                <>
                  <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{profile?.itemsCount ?? 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Items</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: theme.text }]}>{profile?.outfitsCount ?? 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Outfits</Text>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <Text style={[styles.statVal, { color: theme.primary }]}>{profile?.points ?? 0}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>Points</Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* Edit profile button */}
          <CustomButton
            text="Edit Profile"
            icon="pencil-outline"
            onPress={() => navigation.navigate('EditProfileScreen')}
          />

          {/* Recent Outfits */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Outfits</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OutfitsScreen', {})}>
              <Text style={[styles.seeAll, { color: theme.secondaryText }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.outfitRow}>
            {recentOutfits.map(item => (
              <OutfitThumbCard
                key={item.id}
                item={item}
                theme={theme}
                onPress={() => navigation.navigate('OutfitsScreen', { product: item })}
              />
            ))}
            {recentOutfits.length === 0 ? (
              <View style={[styles.emptyRecent, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Ionicons name="images-outline" size={24} color={theme.secondaryText} />
                <Text style={[styles.emptyRecentText, { color: theme.secondaryText }]}>No recent outfits yet</Text>
              </View>
            ) : null}
          </View>

          {/* AI Generated Outfits */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Generated Outfits</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OutfitsScreen', { filter: 'ai', filterSubtype: 'outfit' })}>
              <Text style={[styles.seeAll, { color: theme.secondaryText }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.outfitRow}>
            {aiOutfits.map(item => (
              <OutfitThumbCard
                key={item.id}
                item={item}
                theme={theme}
                onPress={() => navigation.navigate('SingleOutfitScreen', {
                  id: item.id,
                  image: item.image,
                  name: item.title,
                  brand: item.brand,
                  category: item.category,
                  color: item.color,
                  season: item.season,
                  source: item.source,
                  aiMeta: item.aiMeta,
                })}
              />
            ))}
            {aiOutfits.length === 0 ? (
              <View style={[styles.emptyRecent, { backgroundColor: theme.card, borderColor: theme.border }]}> 
                <Ionicons name="sparkles-outline" size={24} color={theme.secondaryText} />
                <Text style={[styles.emptyRecentText, { color: theme.secondaryText }]}>No AI outfits generated yet</Text>
              </View>
            ) : null}
          </View>

          {/* AI Generated Avatars */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>AI Generated Avatars</Text>
            <TouchableOpacity onPress={() => navigation.navigate('OutfitsScreen', { filter: 'ai', filterSubtype: 'avatar' })}>
              <Text style={[styles.seeAll, { color: theme.secondaryText }]}>See all</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.outfitRow}>
            {aiAvatars.map(item => (
              <OutfitThumbCard
                key={item.id}
                item={item}
                theme={theme}
                onPress={() => navigation.navigate('SingleOutfitScreen', {
                  id: item.id,
                  image: item.image,
                  name: item.title,
                  brand: item.brand,
                  category: item.category,
                  color: item.color,
                  season: item.season,
                  source: item.source,
                  aiMeta: item.aiMeta,
                })}
              />
            ))}
            {aiAvatars.length === 0 ? (
              <View style={[styles.emptyRecent, { backgroundColor: theme.card, borderColor: theme.border }]}> 
                <Ionicons name="person-circle-outline" size={24} color={theme.secondaryText} />
                <Text style={[styles.emptyRecentText, { color: theme.secondaryText }]}>No AI avatars generated yet</Text>
              </View>
            ) : null}
          </View>

          {/* Saved Posts */}
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Saved Posts</Text>
            <TouchableOpacity onPress={() => navigation.navigate('SavedPostsScreen')}>
              <Text style={[styles.seeAll, { color: theme.secondaryText }]}>
                {savedPosts.length > 0 ? 'See all' : 'Open'}
              </Text>
            </TouchableOpacity>
          </View>

          {savedPosts.length > 0 ? (
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {savedPosts.slice(0, 4).map((post) => (
                <SavedPostCard
                  key={post.id}
                  item={post}
                  theme={theme}
                  width={width - 40}
                  onPress={() => navigation.navigate('SavedPostsScreen', { postId: post.id })}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.emptyRecent, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 20 }]}> 
              <Ionicons name="bookmark-outline" size={24} color={theme.secondaryText} />
              <Text style={[styles.emptyRecentText, { color: theme.secondaryText }]}>No saved posts yet</Text>
            </View>
          )}

          {/* Quick Access */}
          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 16, marginBottom: 12 }]}>
            Quick Access
          </Text>
          {MENU_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.menuRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: theme.primary + '18' }]}>
                <Ionicons name={item.icon} size={18} color={theme.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: theme.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={16} color={theme.secondaryText} />
            </TouchableOpacity>
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container:        { flex: 1, paddingHorizontal: 20 },
  headerRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 16 },
  title:            { fontSize: 22, fontWeight: '700' },
  settingsBtn:      { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  profileCard:      { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' },
  profileCardInner: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  fullName:         { fontSize: 17, fontWeight: '700' },
  username:         { fontSize: 12, marginTop: 3 },
  email:            { fontSize: 12, marginTop: 2 },
  bio:              { fontSize: 12, marginTop: 5, lineHeight: 16 },
  statsRow:         { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingVertical: 14 },
  statItem:         { flex: 1, alignItems: 'center' },
  statVal:          { fontSize: 18, fontWeight: '800' },
  statLabel:        { fontSize: 11, marginTop: 2 },
  statDivider:      { width: 1, height: 32 },
  sectionRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, marginTop: 8 },
  sectionTitle:     { fontSize: 16, fontWeight: '700' },
  seeAll:           { fontSize: 12 },
  outfitRow:        { flexDirection: 'row', gap: 10, marginBottom: 8 },
  emptyRecent:      { flex: 1, borderWidth: 1, borderRadius: 14, padding: 18, alignItems: 'center', justifyContent: 'center', minHeight: 110 },
  emptyRecentText:  { fontSize: 12, marginTop: 6 },
  menuRow:          { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1 },
  menuIcon:         { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuLabel:        { flex: 1, fontSize: 14, fontWeight: '500' },
});