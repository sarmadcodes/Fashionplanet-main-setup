import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchOutfits } from '../services/apiService';

// ─── Detail chip ──────────────────────────────────────────────
const InfoChip = ({ icon, label, value, theme }) => (
  <View style={[chipStyles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
    <View style={[chipStyles.iconBox, { backgroundColor: theme.primary + '18' }]}>
      <Ionicons name={icon} size={15} color={theme.primary} />
    </View>
    <View>
      <Text style={[chipStyles.label, { color: theme.secondaryText }]}>{label}</Text>
      <Text style={[chipStyles.value, { color: theme.text }]}>{value || '—'}</Text>
    </View>
  </View>
);

const chipStyles = StyleSheet.create({
  wrap:    { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 0.5, padding: 12, gap: 10, flex: 1 },
  iconBox: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  label:   { fontSize: 10, fontWeight: '500', marginBottom: 2 },
  value:   { fontSize: 13, fontWeight: '700' },
});

// ─── Small related card ───────────────────────────────────────
const RelatedCard = ({ item, theme, onPress }) => (
  <TouchableOpacity
    style={[rcStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => onPress(item)}
    activeOpacity={0.8}
  >
    <Image source={{ uri: item.image }} style={rcStyles.img} />
    <View style={rcStyles.info}>
      <Text style={[rcStyles.title, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
      <Text style={[rcStyles.brand, { color: theme.primary }]}>{item.brand}</Text>
    </View>
  </TouchableOpacity>
);

const rcStyles = StyleSheet.create({
  card:  { width: 130, borderRadius: 14, overflow: 'hidden', borderWidth: 0.5, marginRight: 12 },
  img:   { width: '100%', height: 150, resizeMode: 'cover' },
  info:  { padding: 10 },
  title: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  brand: { fontSize: 11, fontWeight: '600' },
});

// ─── Screen ───────────────────────────────────────────────────
const SingleOutfitScreen = () => {
  const navigation = useNavigation();
  const route      = useRoute();
  const { isDark } = useTheme();
  const theme      = isDark ? darkTheme : lightTheme;

  const { image, name, brand, category, color, season } = route.params || {};
  const [relatedOutfits, setRelatedOutfits] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const relatedSeed = useMemo(
    () => `${String(name || '')}|${String(category || '')}|${String(season || '')}`,
    [name, category, season]
  );

  useEffect(() => {
    let mounted = true;

    const loadRelated = async () => {
      try {
        setRelatedLoading(true);
        const outfits = await apiFetchOutfits();
        const normalized = Array.isArray(outfits) ? outfits : [];

        const candidates = normalized.filter((item) => {
          const sameById = route?.params?.id && item?.id && String(item.id) === String(route.params.id);
          const sameByIdentity = String(item?.title || '') === String(name || '') && String(item?.image || '') === String(image || '');
          if (sameById || sameByIdentity) return false;

          if (category && item?.category === category) return true;
          if (season && item?.season === season) return true;
          return false;
        });

        const fallback = normalized.filter((item) => {
          const sameById = route?.params?.id && item?.id && String(item.id) === String(route.params.id);
          const sameByIdentity = String(item?.title || '') === String(name || '') && String(item?.image || '') === String(image || '');
          return !sameById && !sameByIdentity;
        });

        const finalList = (candidates.length > 0 ? candidates : fallback).slice(0, 8);
        if (mounted) {
          setRelatedOutfits(finalList);
        }
      } catch {
        if (mounted) {
          setRelatedOutfits([]);
        }
      } finally {
        if (mounted) {
          setRelatedLoading(false);
        }
      }
    };

    loadRelated();

    return () => {
      mounted = false;
    };
  }, [image, name, category, season, relatedSeed, route?.params?.id]);

  const handleRelatedPress = (item) => {
    navigation.push('SingleOutfitScreen', {
      image: item.image,
      name: item.title,
      brand: item.brand,
      category: item.category,
      color: item.color,
      season: item.season,
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Outfit Details</Text>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Ionicons name="heart-outline" size={18} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero image — accepts both string URI and object */}
        <View style={styles.heroWrap}>
          <Image
            source={typeof image === 'string' ? { uri: image } : image}
            style={styles.heroImage}
          />
          {brand ? (
            <View style={[styles.brandBadge, { backgroundColor: theme.primary }]}>
              <Text style={styles.brandBadgeText}>{brand}</Text>
            </View>
          ) : null}
        </View>

        <View style={{ paddingHorizontal: 20, paddingBottom: 110 }}>
          <Text style={[styles.itemName, { color: theme.text }]}>{name || 'Outfit Item'}</Text>

          <View style={styles.chipsGrid}>
            <InfoChip icon="grid-outline"           label="Category" value={category} theme={theme} />
            <InfoChip icon="color-palette-outline"  label="Color"    value={color}    theme={theme} />
          </View>
          <View style={[styles.chipsGrid, { marginTop: 10 }]}>
            <InfoChip icon="sunny-outline"          label="Season"   value={season}   theme={theme} />
            <InfoChip icon="pricetag-outline"       label="Brand"    value={brand}    theme={theme} />
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]}>
              <Ionicons name="sparkles-outline" size={16} color="#141414" />
              <Text style={styles.actionBtnText}>Generate Similar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: theme.border }]}>
              <Ionicons name="share-outline" size={18} color={theme.text} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtnOutline, { borderColor: theme.border }]}>
              <Ionicons name="bookmark-outline" size={18} color={theme.text} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.moreTitle, { color: theme.text }]}>More Outfits</Text>
          {relatedLoading ? (
            <View style={[styles.relatedLoadingBox, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <ActivityIndicator size="small" color={theme.primary} />
              <Text style={[styles.relatedLoadingText, { color: theme.secondaryText }]}>Loading related outfits...</Text>
            </View>
          ) : relatedOutfits.length === 0 ? (
            <View style={[styles.relatedEmptyBox, { borderColor: theme.border, backgroundColor: theme.card }]}>
              <Ionicons name="shirt-outline" size={16} color={theme.secondaryText} />
              <Text style={[styles.relatedEmptyText, { color: theme.secondaryText }]}>No related outfits available.</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {relatedOutfits.map((item, index) => (
                <RelatedCard
                  key={`${String(item?.id || 'related')}_${index}`}
                  item={{
                    ...item,
                    title: item?.title || item?.name || 'Outfit',
                    brand: item?.brand || 'Fashion Planet',
                  }}
                  theme={theme}
                  onPress={handleRelatedPress}
                />
              ))}
            </ScrollView>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SingleOutfitScreen;

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: 'transparent' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 56 },
  backBtn:          { width: 38, height: 38, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { fontSize: 16, fontWeight: '700' },
  heroWrap:         { position: 'relative', marginBottom: 20 },
  heroImage:        { width: '100%', height: 420, resizeMode: 'cover' },
  brandBadge:       { position: 'absolute', bottom: 16, left: 20, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 50 },
  brandBadgeText:   { color: '#141414', fontWeight: '800', fontSize: 12 },
  itemName:         { fontSize: 22, fontWeight: '800', marginBottom: 16 },
  chipsGrid:        { flexDirection: 'row', gap: 10 },
  actionsRow:       { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 28, alignItems: 'center' },
  actionBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 48, borderRadius: 50 },
  actionBtnText:    { color: '#141414', fontWeight: '700', fontSize: 14 },
  actionBtnOutline: { width: 48, height: 48, borderRadius: 50, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  moreTitle:        { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  relatedLoadingBox: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  relatedLoadingText: { fontSize: 12, fontWeight: '500' },
  relatedEmptyBox: { borderWidth: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  relatedEmptyText: { fontSize: 12, fontWeight: '500' },
});