import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import FilterGroup from '../components/FilterGroup';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

const myFilters = [
  { id: 1, name: 'Winter style' },
  { id: 2, name: 'Streetwear' },
  { id: 3, name: 'Minimalist' },
  { id: 4, name: 'Spring style' },
  { id: 5, name: 'Vintage' },
  { id: 6, name: 'Colorful' },
];

const STYLE_TIPS = [
  {
    title: 'How to build a capsule wardrobe',
    desc: 'A capsule wardrobe focuses on quality over quantity. Choose neutral colors, timeless silhouettes, and pieces that can be mixed and matched easily for multiple outfits.',
  },
  {
    title: 'Color matching basics',
    desc: 'Understanding color harmony helps you dress better. Stick to complementary colors, avoid overusing bright tones, and balance bold pieces with neutral shades.',
  },
  {
    title: 'Layering like a pro',
    desc: 'Layering adds depth to any look. Start with a fitted base, add a mid-layer for warmth, then finish with a statement outer piece to tie the whole outfit together.',
  },
];

const FEED_POSTS = [
  {
    id: 'f1',
    user: 'Sofia M.',
    handle: '@sofiawears',
    image: { uri: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg' },
    caption: 'Monochrome moment loving this all-black edit for the office.',
    likes: 214,
    saves: 38,
    tags: ['Minimalist', 'Office'],
  },
  {
    id: 'f2',
    user: 'Lena K.',
    handle: '@lena.fits',
    image: { uri: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg' },
    caption: 'Spring is calling and so is this flowy midi skirt.',
    likes: 389,
    saves: 72,
    tags: ['Spring style', 'Feminine'],
  },
  {
    id: 'f3',
    user: 'Nour A.',
    handle: '@nour_ootd',
    image: { uri: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg' },
    caption: 'Street style done right. Comfort meets cool.',
    likes: 512,
    saves: 101,
    tags: ['Streetwear', 'Casual'],
  },
  {
    id: 'f4',
    user: 'Hana R.',
    handle: '@hana.style',
    image: { uri: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg' },
    caption: 'Date night ready — less is truly more.',
    likes: 178,
    saves: 29,
    tags: ['Evening', 'Minimalist'],
  },
  {
    id: 'f5',
    user: 'Mia T.',
    handle: '@mia_threads',
    image: { uri: 'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg' },
    caption: 'Vintage finds never disappoint. Thrifted this whole look.',
    likes: 642,
    saves: 148,
    tags: ['Vintage', 'Thrift'],
  },
];

const FEATURED = [
  { id: 'g1', image: { uri: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg' }, label: 'Minimalist Edit' },
  { id: 'g2', image: { uri: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg' }, label: 'Street Style' },
  { id: 'g3', image: { uri: 'https://images.pexels.com/photos/3622608/pexels-photo-3622608.jpeg' }, label: 'Vintage Picks' },
  { id: 'g4', image: { uri: 'https://images.pexels.com/photos/2983464/pexels-photo-2983464.jpeg' }, label: 'Spring Looks' },
];

// ─── Feed Post Card ───────────────────────────────────────────
const FeedPost = ({ post, theme, onPress }) => {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <TouchableOpacity
      style={[fpStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={fpStyles.userRow}>
        <View style={[fpStyles.avatar, { backgroundColor: theme.primary + '30' }]}>
          <Text style={[fpStyles.avatarText, { color: theme.primary }]}>{post.user[0]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[fpStyles.userName, { color: theme.text }]}>{post.user}</Text>
          <Text style={[fpStyles.handle, { color: theme.secondaryText }]}>{post.handle}</Text>
        </View>
        <Ionicons name="ellipsis-horizontal" size={18} color={theme.secondaryText} />
      </View>

      <Image source={post.image} style={fpStyles.img} />

      <View style={fpStyles.tagsRow}>
        {post.tags.map(t => (
          <View key={t} style={[fpStyles.tag, { backgroundColor: theme.primary + '18' }]}>
            <Text style={[fpStyles.tagText, { color: theme.primary }]}>{t}</Text>
          </View>
        ))}
      </View>

      <Text style={[fpStyles.caption, { color: theme.text }]}>{post.caption}</Text>

      <View style={fpStyles.actionsRow}>
        <TouchableOpacity style={fpStyles.action} onPress={() => setLiked(p => !p)}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? '#E53E3E' : theme.secondaryText} />
          <Text style={[fpStyles.actionText, { color: theme.secondaryText }]}>{post.likes + (liked ? 1 : 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={fpStyles.action} onPress={() => setSaved(p => !p)}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={20} color={saved ? theme.primary : theme.secondaryText} />
          <Text style={[fpStyles.actionText, { color: theme.secondaryText }]}>{post.saves + (saved ? 1 : 0)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={fpStyles.action}>
          <Ionicons name="arrow-redo-outline" size={20} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const fpStyles = StyleSheet.create({
  card:       { borderRadius: 16, borderWidth: 0.5, marginBottom: 16, overflow: 'hidden' },
  userRow:    { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
  avatar:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontWeight: '800', fontSize: 14 },
  userName:   { fontSize: 13, fontWeight: '700' },
  handle:     { fontSize: 11, marginTop: 1 },
  img:        { width: '100%', height: 340, resizeMode: 'cover' },
  tagsRow:    { flexDirection: 'row', gap: 6, paddingHorizontal: 12, paddingTop: 12 },
  tag:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  tagText:    { fontSize: 10, fontWeight: '700' },
  caption:    { fontSize: 13, lineHeight: 19, paddingHorizontal: 12, paddingTop: 8 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 16 },
  action:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  actionText: { fontSize: 12, fontWeight: '600' },
});

// ─── Main Screen ──────────────────────────────────────────────
const DiscoverScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { width } = useWindowDimensions();
  const cardWidth = (width - 52) / 2;

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFeedPosts = FEED_POSTS.filter((post) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      post.user.toLowerCase().includes(q) ||
      post.handle.toLowerCase().includes(q) ||
      post.caption.toLowerCase().includes(q) ||
      post.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });

  const handleToggle = index => {
    setExpandedIndex(prev => (prev === index ? null : index));
  };

  const tabs = [
    { id: 'feed',     label: 'Feed',       icon: 'grid-outline'  },
    { id: 'trending', label: 'Trending',   icon: 'flame-outline' },
    { id: 'tips',     label: 'Style Tips', icon: 'bulb-outline'  },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 100 }}>

          <View style={styles.header}>
            <View>
              <Text style={[styles.pageTitle, { color: theme.text }]}>Discover</Text>
              <Text style={[styles.pageSub, { color: theme.secondaryText }]}>Explore styles & community</Text>
            </View>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => Alert.alert('Filters', 'Filter functionality coming soon.')}
            >
              <Ionicons name="options-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.searchSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Ionicons name="search-outline" size={16} color={theme.secondaryText} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Search styles, outfits, trends..."
              placeholderTextColor={theme.secondaryText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={() => {}}
            />
          </View>

          <FilterGroup items={myFilters} theme={theme} />

          <View style={[styles.tabBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {tabs.map(tab => (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tab, activeTab === tab.id && { backgroundColor: theme.primary, borderRadius: 10 }]}
                onPress={() => setActiveTab(tab.id)}
              >
                <Ionicons name={tab.icon} size={14} color={activeTab === tab.id ? '#141414' : theme.secondaryText} />
                <Text style={[styles.tabText, { color: activeTab === tab.id ? '#141414' : theme.secondaryText }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Feed Tab */}
          {activeTab === 'feed' && (
            <>
              {filteredFeedPosts.map(post => (
                <FeedPost
                  key={post.id}
                  post={post}
                  theme={theme}
                  onPress={() => navigation.navigate('OutfitsScreen', { product: post })}
                />
              ))}
            </>
          )}

          {/* Trending Tab */}
          {activeTab === 'trending' && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Featured Collection</Text>
              <View style={styles.featuredGrid}>
                {FEATURED.map(item => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.featuredCard, { width: cardWidth }]}
                    onPress={() => navigation.navigate('OutfitsScreen', { product: item })}
                    activeOpacity={0.8}
                  >
                    <Image source={item.image} style={styles.featuredImg} />
                    <View style={styles.featuredOverlay}>
                      <Text style={styles.featuredLabel}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={[styles.statsRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {[
                  { label: 'Looks Today', value: '1.2k' },
                  { label: 'Saves',       value: '8.4k' },
                  { label: 'Trending Tags', value: '24' },
                ].map((s, i) => (
                  <View key={i} style={styles.statItem}>
                    <Text style={[styles.statVal, { color: theme.primary }]}>{s.value}</Text>
                    <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{s.label}</Text>
                    {i < 2 && <View style={[styles.statDiv, { backgroundColor: theme.border }]} />}
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Style Tips Tab */}
          {activeTab === 'tips' && (
            <>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Style Tips</Text>
              {STYLE_TIPS.map((item, i) => {
                const isOpen = expandedIndex === i;
                return (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.8}
                    onPress={() => handleToggle(i)}
                    style={[
                      styles.tipCard,
                      {
                        backgroundColor: theme.card,
                        borderColor: isOpen ? theme.primary : theme.border,
                        borderRadius: isOpen ? 16 : 50,
                      },
                    ]}
                  >
                    <View style={[styles.tipIconWrap, { backgroundColor: theme.primary + '18' }]}>
                      <Ionicons name="bulb-outline" size={18} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.tipTitle, { color: theme.text }]}>{item.title}</Text>
                      {isOpen && (
                        <Text style={[styles.tipDesc, { color: theme.secondaryText }]}>{item.desc}</Text>
                      )}
                      <Text style={[styles.tipTime, { color: theme.secondaryText }]}>{i + 3} min read</Text>
                    </View>
                    <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color={theme.secondaryText} />
                  </TouchableOpacity>
                );
              })}
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DiscoverScreen;

const styles = StyleSheet.create({
  container:       { flex: 1, paddingHorizontal: 20 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 16 },
  pageTitle:       { fontSize: 22, fontWeight: '700' },
  pageSub:         { fontSize: 12, marginTop: 2 },
  filterBtn:       { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5 },
  searchSection:   { flexDirection: 'row', alignItems: 'center', borderRadius: 50, paddingHorizontal: 14, height: 44, marginBottom: 16, borderWidth: 1 },
  input:           { flex: 1, fontSize: 13 },
  tabBar:          { flexDirection: 'row', borderRadius: 14, padding: 4, marginBottom: 20, borderWidth: 0.5 },
  tab:             { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9 },
  tabText:         { fontSize: 12, fontWeight: '600' },
  sectionTitle:    { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  featuredGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
  featuredCard:    { borderRadius: 14, overflow: 'hidden', height: 180 },
  featuredImg:     { width: '100%', height: '100%', resizeMode: 'cover' },
  featuredOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.45)', padding: 10 },
  featuredLabel:   { color: '#fff', fontWeight: '700', fontSize: 12 },
  statsRow:        { flexDirection: 'row', borderRadius: 16, borderWidth: 0.5, padding: 16, marginBottom: 20 },
  statItem:        { flex: 1, alignItems: 'center', position: 'relative' },
  statVal:         { fontSize: 20, fontWeight: '900', marginBottom: 3 },
  statLabel:       { fontSize: 11 },
  statDiv:         { position: 'absolute', right: 0, top: '10%', width: 1, height: '80%' },
  tipCard:         { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 14, paddingHorizontal: 16, marginBottom: 10, borderWidth: 1, gap: 12 },
  tipIconWrap:     { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  tipTitle:        { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  tipDesc:         { fontSize: 12, lineHeight: 18, marginBottom: 6 },
  tipTime:         { fontSize: 10 },
});