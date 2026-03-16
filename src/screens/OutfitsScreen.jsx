import { StatusBar, StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchOutfits } from '../services/apiService';

const OutfitCard = ({ item, theme, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => onPress(item)}
    activeOpacity={0.85}
  >
    <Image source={{ uri: item.image }} style={styles.cardImage} />

    <View style={styles.tagsOverlay}>
      {item.tags.map(t => (
        <View key={t} style={styles.tagPill}>
          <Text style={styles.tagText}>{t}</Text>
        </View>
      ))}
    </View>

    <View style={styles.cardInfo}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>{item.title}</Text>
        <Text style={[styles.cardBrand, { color: theme.primary }]}>{item.brand}</Text>
      </View>
      <View style={[styles.cardChevron, { backgroundColor: theme.primary + '18' }]}>
        <Ionicons name="arrow-forward" size={14} color={theme.primary} />
      </View>
    </View>
  </TouchableOpacity>
);

const OutfitsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchOutfits()
      .then((data) => {
        setOutfits(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handlePress = (item) => {
    navigation.navigate('SingleOutfitScreen', {
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

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingBottom: 110 }}>

          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.heading, { color: theme.text }]}>Outfits</Text>
              <Text style={[styles.subheading, { color: theme.secondaryText }]}>
                {loading ? 'Loading looks...' : `${outfits.length} looks saved`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.filterBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Ionicons name="options-outline" size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          <View style={[styles.statsStrip, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {[
              { label: 'Total', value: outfits.length },
              { label: 'Seasons', value: new Set(outfits.map(o => o.season)).size },
              { label: 'Brands', value: new Set(outfits.map(o => o.brand)).size },
            ].map((s, i) => (
              <View key={i} style={styles.statItem}>
                <Text style={[styles.statVal, { color: theme.primary }]}>{s.value}</Text>
                <Text style={[styles.statLabel, { color: theme.secondaryText }]}>{s.label}</Text>
                {i < 2 && <View style={[styles.statDiv, { backgroundColor: theme.border }]} />}
              </View>
            ))}
          </View>

          {outfits.map(item => (
            <OutfitCard key={item.id} item={item} theme={theme} onPress={handlePress} />
          ))}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default OutfitsScreen;

const styles = StyleSheet.create({
  container:   { flex: 1, paddingHorizontal: 20 },
  headerRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 20 },
  heading:     { fontSize: 22, fontWeight: '700' },
  subheading:  { fontSize: 12, marginTop: 2 },
  filterBtn:   { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5 },
  statsStrip:  { flexDirection: 'row', borderRadius: 14, borderWidth: 0.5, padding: 14, marginBottom: 20 },
  statItem:    { flex: 1, alignItems: 'center', position: 'relative' },
  statVal:     { fontSize: 20, fontWeight: '900', marginBottom: 2 },
  statLabel:   { fontSize: 11 },
  statDiv:     { position: 'absolute', right: 0, top: '10%', width: 1, height: '80%' },
  card:        { borderRadius: 16, borderWidth: 0.5, marginBottom: 16, overflow: 'hidden' },
  cardImage:   { width: '100%', height: 300, resizeMode: 'cover' },
  tagsOverlay: { position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 },
  tagPill:     { backgroundColor: 'rgba(0,0,0,0.55)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 50 },
  tagText:     { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardInfo:    { flexDirection: 'row', alignItems: 'center', padding: 14 },
  cardTitle:   { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardBrand:   { fontSize: 12, fontWeight: '600' },
  cardChevron: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});