import React, { useState, useCallback } from 'react';
import {
  ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity,
  View, Image, Alert, RefreshControl, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import FilterGroup from '../components/FilterGroup';
import CustomButton from '../components/CustomButton';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchWardrobeItems, apiDeleteWardrobeItem } from '../services/mockApi';

const FILTERS = [
  { id: 1, name: 'All' },
  { id: 2, name: 'Tops' },
  { id: 3, name: 'Bottoms' },
  { id: 4, name: 'Outerwear' },
  { id: 5, name: 'Dresses' },
  { id: 6, name: 'Shoes' },
  { id: 7, name: 'Accessories' },
];

const Skeleton = ({ style }) => {
  const { isDark } = useTheme();
  return (
    <View style={[{ backgroundColor: isDark ? '#1F1F1F' : '#ECECEC', borderRadius: 12 }, style]} />
  );
};

// Empty state with professional design
const EmptyWardrobe = ({ theme, onAdd }) => (
  <View style={emptyStyles.wrap}>
    <View style={[emptyStyles.iconBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Ionicons name="shirt" size={52} color={theme.secondaryText} />
    </View>
    <Text style={[emptyStyles.title, { color: theme.text }]}>Your wardrobe is empty</Text>
    <Text style={[emptyStyles.sub, { color: theme.secondaryText }]}>
      Start building your digital closet by adding your first piece.
    </Text>
    <TouchableOpacity style={[emptyStyles.btn, { backgroundColor: theme.primary }]} onPress={onAdd} activeOpacity={0.75}>
      <Ionicons name="add" size={18} color="#141414" style={{ marginRight: 6 }} />
      <Text style={emptyStyles.btnText}>Add your first item</Text>
    </TouchableOpacity>
  </View>
);

const emptyStyles = StyleSheet.create({
  wrap:    { alignItems: 'center', paddingTop: 80, paddingHorizontal: 30 },
  iconBox: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1 },
  title:   { fontSize: 20, fontWeight: '700', marginBottom: 12, textAlign: 'center' },
  sub:     { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 28, fontWeight: '500' },
  btn:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 50, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  btnText: { color: '#141414', fontWeight: '700', fontSize: 14 },
});

// Wardrobe card with delete functionality
const WardrobeCard = ({ item, theme, onPress, onEdit, onDelete, cardWidth }) => (
  <View style={[cardStyles.wrap, { width: cardWidth }]}> 
    <TouchableOpacity
      style={[cardStyles.imgBox, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      {item.image ? (
        <Image source={{ uri: item.image }} style={cardStyles.img} />
      ) : (
        <View style={[cardStyles.noImg, { backgroundColor: theme.card }]}>
          <Ionicons name="shirt" size={28} color={theme.secondaryText} />
        </View>
      )}
    </TouchableOpacity>
    <Text style={[cardStyles.name, { color: theme.text }]} numberOfLines={1}>{item.name}</Text>
    {item.brand ? (
      <Text style={[cardStyles.brand, { color: theme.secondaryText }]} numberOfLines={1}>{item.brand}</Text>
    ) : (
      <Text style={[cardStyles.brand, { color: theme.secondaryText }]} numberOfLines={1}>{item.category}</Text>
    )}
    <Text style={[cardStyles.worth, { color: theme.primary }]}>
      ${Number(item.worth || 0).toFixed(2)}
    </Text>
    <View style={cardStyles.actionRow}>
      <TouchableOpacity style={[cardStyles.actionBtn, { borderColor: theme.border, backgroundColor: theme.card }]} onPress={onEdit}>
        <Ionicons name="create-outline" size={14} color={theme.text} />
        <Text style={[cardStyles.actionText, { color: theme.text }]}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[cardStyles.actionBtn, { borderColor: '#FF4B4B66', backgroundColor: '#FF4B4B14' }]} onPress={onDelete}>
        <Ionicons name="trash-outline" size={14} color="#FF4B4B" />
        <Text style={[cardStyles.actionText, { color: '#FF4B4B' }]}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const cardStyles = StyleSheet.create({
  wrap:      { marginBottom: 18 },
  imgBox:    { width: '100%', aspectRatio: 0.85, borderRadius: 14, overflow: 'hidden', borderWidth: 0.5, position: 'relative' },
  img:       { width: '100%', height: '100%', resizeMode: 'cover' },
  noImg:     { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name:      { fontSize: 12, fontWeight: '700', marginTop: 8, paddingHorizontal: 2 },
  brand:     { fontSize: 11, marginTop: 3, paddingHorizontal: 2, fontWeight: '500' },
  worth:     { fontSize: 11, marginTop: 4, paddingHorizontal: 2, fontWeight: '700' },
  actionRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  actionBtn: { flex: 1, borderWidth: 1, borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 6, gap: 4 },
  actionText: { fontSize: 11, fontWeight: '700' },
});

const WardrobeScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { width } = useWindowDimensions();
  const cardWidth = (width - 60) / 3;

  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allItems, setAllItems]     = useState([]);
  const [displayed, setDisplayed]   = useState([]);
  const [activeFilter, setFilter]   = useState('All');
  const [error, setError]           = useState('');

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiFetchWardrobeItems();
      setAllItems(data);
      applyFilter(data, activeFilter);
    } catch (err) {
      setError('Failed to load wardrobe.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      const data = await apiFetchWardrobeItems();
      setAllItems(data);
      applyFilter(data, activeFilter);
    } catch {
      setError('Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const applyFilter = (items, filter) => {
    setFilter(filter);
    setDisplayed(filter === 'All' ? items : items.filter(i => i.category === filter));
  };

  const handleDelete = (id, name) => {
    Alert.alert(
      'Remove Item',
      `Remove "${name}" from your wardrobe?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiDeleteWardrobeItem(id);
              const updated = allItems.filter(i => i.id !== id);
              setAllItems(updated);
              applyFilter(updated, activeFilter);
              Alert.alert('Success', 'Item removed from wardrobe.');
            } catch {
              Alert.alert('Error', 'Could not delete item. Try again.');
            }
          },
        },
      ]
    );
  };

  // Build rows of 3
  const rows = [];
  for (let i = 0; i < displayed.length; i += 3) {
    rows.push(displayed.slice(i, i + 3));
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        <View style={{ paddingBottom: 110 }}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>My Wardrobe</Text>
              <Text style={[styles.sub, { color: theme.secondaryText }]}>
                {loading ? 'Loading...' : `${allItems.length} item${allItems.length !== 1 ? 's' : ''}`}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('AddItemsScreen')}
              activeOpacity={0.75}
            >
              <Ionicons name="add" size={20} color="#141414" />
            </TouchableOpacity>
          </View>

          {/* Filters */}
          <FilterGroup
            items={FILTERS}
            onSelect={(f) => applyFilter(allItems, f.name)}
            activeFilter={activeFilter}
            theme={theme}
          />

          {/* Content */}
          {loading ? (
            <View>
              {[1, 2].map((row) => (
                <View key={row} style={styles.gridRow}>
                  {[1, 2, 3].map(i => (
                      <Skeleton key={i} style={{ width: cardWidth, height: cardWidth / 0.85 + 36, marginBottom: 18 }} />
                  ))}
                </View>
              ))}
            </View>
          ) : error && allItems.length === 0 ? (
            <View style={styles.errorState}>
              <Ionicons name="alert-circle-outline" size={48} color={theme.secondaryText} />
              <Text style={[styles.errorTitle, { color: theme.text }]}>{error}</Text>
              <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={load}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : allItems.length === 0 ? (
            <EmptyWardrobe theme={theme} onAdd={() => navigation.navigate('AddItemsScreen')} />
          ) : displayed.length === 0 ? (
            <View style={styles.emptyFilter}>
              <Ionicons name="funnel-outline" size={40} color={theme.secondaryText} />
              <Text style={[styles.emptyFilterText, { color: theme.secondaryText }]}>
                No items in this category
              </Text>
            </View>
          ) : (
            rows.map((row, ri) => (
              <View key={ri} style={styles.gridRow}>
                {row.map((item) => (
                  <WardrobeCard
                    key={item.id}
                    item={item}
                    theme={theme}
                    cardWidth={cardWidth}
                    onPress={() =>
                      navigation.navigate('SingleOutfitScreen', {
                        image: item.image,
                        name: item.name,
                        brand: item.brand,
                        category: item.category,
                        color: item.color,
                        season: item.season,
                      })
                    }
                    onEdit={() => navigation.navigate('AddItemsScreen', { itemToEdit: item })}
                    onDelete={() => handleDelete(item.id, item.name)}
                  />
                ))}
                {row.length < 3 &&
                  Array(3 - row.length).fill(null).map((_, i) => (
                    <View key={'empty_' + i} style={{ width: cardWidth }} />
                  ))
                }
              </View>
            ))
          )}

          {allItems.length > 0 && (
            <CustomButton
              text="Add new item"
              icon="add-circle-outline"
              onPress={() => navigation.navigate('AddItemsScreen')}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WardrobeScreen;

const styles = StyleSheet.create({
  container:       { flex: 1, paddingHorizontal: 20 },
  header:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 4 },
  title:           { fontSize: 28, fontWeight: '700' },
  sub:             { fontSize: 13, marginTop: 3, fontWeight: '500' },
  addBtn:          { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  gridRow:         { flexDirection: 'row', justifyContent: 'space-between' },
  emptyFilter:     { alignItems: 'center', paddingTop: 80, gap: 14 },
  emptyFilterText: { fontSize: 15, fontWeight: '600' },
  errorState:      { alignItems: 'center', justifyContent: 'center', paddingVertical: 80, gap: 16 },
  errorTitle:      { fontSize: 18, fontWeight: '700' },
  retryBtn:        { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 50 },
  retryText:       { color: '#141414', fontWeight: '700', fontSize: 14 },
});