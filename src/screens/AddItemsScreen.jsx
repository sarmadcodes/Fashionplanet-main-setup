import React, { useState } from 'react';
import {
  StyleSheet, View, Text, TextInput, TouchableOpacity,
  ScrollView, StatusBar, Image, ActivityIndicator, Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiAddWardrobeItem, apiUpdateWardrobeItem } from '../services/apiService';
import {
  WARDROBE_CATEGORIES,
  WARDROBE_COLORS,
  WARDROBE_SEASONS,
} from '../config/uiOptions';

const CATEGORIES = WARDROBE_CATEGORIES;
const COLORS = WARDROBE_COLORS;
const SEASONS = WARDROBE_SEASONS;

const ChipGroup = ({ data, selected, onSelect, error, theme }) => (
  <View>
    <View style={chipStyles.row}>
      {data.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => onSelect(item)}
          style={[
            chipStyles.chip,
            { borderColor: theme.border, backgroundColor: theme.card },
            selected === item && { backgroundColor: theme.primary, borderColor: theme.primary },
          ]}
        >
          <Text
            style={[
              chipStyles.text,
              { color: theme.secondaryText },
              selected === item && { color: '#141414', fontWeight: '700' },
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
    {error ? <Text style={chipStyles.error}>{error}</Text> : null}
  </View>
);

const chipStyles = StyleSheet.create({
  row:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 50, borderWidth: 1.5 },
  text:  { fontSize: 12 },
  error: { color: '#FF4444', fontSize: 11, marginTop: 6 },
});

const AddItemsScreen = ({ navigation, route }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const editItem = route?.params?.itemToEdit;
  const isEditMode = !!editItem;

  const [image, setImage]       = useState(editItem?.image || null);
  const [name, setName]         = useState(editItem?.name || '');
  const [brand, setBrand]       = useState(editItem?.brand || '');
  const [category, setCategory] = useState(editItem?.category || '');
  const [color, setColor]       = useState(editItem?.color || '');
  const [season, setSeason]     = useState(editItem?.season || '');
  const [worth, setWorth]       = useState(editItem?.worth ? String(editItem.worth) : '');
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});

  const pickImage = (source) => {
    const opts = { mediaType: 'photo', quality: 0.85, maxWidth: 800, maxHeight: 800 };
    const fn = source === 'camera' ? launchCamera : launchImageLibrary;
    fn(opts, (res) => {
      if (res.assets?.[0]?.uri) setImage(res.assets[0].uri);
    });
  };

  const validate = () => {
    const e = {};
    if (!image)        e.image    = 'Please add an image.';
    if (!name.trim())   e.name     = 'Item name is required.';
    if (!category)      e.category = 'Please select a category.';
    if (!color)         e.color    = 'Please select a colour.';
    if (!season)        e.season   = 'Please select a season.';
    if (worth && Number.isNaN(Number(worth))) e.worth = 'Worth must be a valid number.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        category: category.trim(),
        color: color.trim(),
        season: season.trim(),
        worth: Number(worth) || 0,
        image,
      };

      if (isEditMode) {
        await apiUpdateWardrobeItem(editItem.id, payload);
      } else {
        await apiAddWardrobeItem(payload);
      }

      Alert.alert(
        isEditMode ? 'Item updated' : 'Item added',
        isEditMode
          ? `"${name.trim()}" has been updated.`
          : `"${name.trim()}" has been added to your wardrobe.`,
        [{ text: 'Done', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      {/* Navbar */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>{isEditMode ? 'Edit Item' : 'Add Item'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 50 }}>

        {/* Photo upload */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>PHOTO</Text>
        <View style={styles.photoRow}>
          {/* Main upload area */}
          <TouchableOpacity
            style={[styles.mainPhoto, { backgroundColor: theme.card, borderColor: image ? 'transparent' : theme.border }]}
            onPress={() => pickImage('library')}
            activeOpacity={0.75}
          >
            {image ? (
              <Image source={{ uri: image }} style={styles.mainPhotoImg} />
            ) : (
              <View style={styles.mainPhotoPlaceholder}>
                <View style={[styles.uploadIconCircle, { backgroundColor: theme.primary + '22' }]}>
                  <Ionicons name="image-outline" size={28} color={theme.primary} />
                </View>
                <Text style={[styles.uploadLabel, { color: theme.text }]}>Tap to upload</Text>
                <Text style={[styles.uploadSub, { color: theme.secondaryText }]}>from gallery</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Side options */}
          <View style={styles.sideOptions}>
            <TouchableOpacity
              style={[styles.sideBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => pickImage('camera')}
            >
              <Ionicons name="camera-outline" size={22} color={theme.text} />
              <Text style={[styles.sideBtnText, { color: theme.secondaryText }]}>Camera</Text>
            </TouchableOpacity>
            {image && (
              <TouchableOpacity
                style={[styles.sideBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={() => setImage(null)}
              >
                <Ionicons name="trash-outline" size={22} color="#FF4444" />
                <Text style={[styles.sideBtnText, { color: '#FF4444' }]}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        {errors.image ? <Text style={styles.fieldError}>{errors.image}</Text> : null}

        {/* Name */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText }]}>DETAILS</Text>
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: errors.name ? '#FF4444' : 'transparent' }]}>
          <Ionicons name="shirt-outline" size={16} color={theme.secondaryText} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="Item name  e.g. White Linen Shirt"
            placeholderTextColor={theme.secondaryText}
            value={name}
            onChangeText={(t) => { setName(t); setErrors(p => ({ ...p, name: '' })); }}
          />
        </View>
        {errors.name ? <Text style={styles.fieldError}>{errors.name}</Text> : null}

        {/* Brand */}
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: 'transparent', marginTop: 10 }]}>
          <Ionicons name="pricetag-outline" size={16} color={theme.secondaryText} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="Brand  e.g. Zara  (optional)"
            placeholderTextColor={theme.secondaryText}
            value={brand}
            onChangeText={setBrand}
          />
        </View>

        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: errors.worth ? '#FF4444' : 'transparent', marginTop: 10 }]}> 
          <Ionicons name="cash-outline" size={16} color={theme.secondaryText} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="Worth in USD  e.g. 79"
            placeholderTextColor={theme.secondaryText}
            value={worth}
            onChangeText={(t) => { setWorth(t); setErrors(p => ({ ...p, worth: '' })); }}
            keyboardType="numeric"
          />
        </View>
        {errors.worth ? <Text style={styles.fieldError}>{errors.worth}</Text> : null}

        {/* Category */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText, marginTop: 24 }]}>CATEGORY</Text>
        <ChipGroup data={CATEGORIES} selected={category} onSelect={(v) => { setCategory(v); setErrors(p => ({ ...p, category: '' })); }} error={errors.category} theme={theme} />
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: errors.category ? '#FF4444' : 'transparent', marginTop: 10 }]}> 
          <Ionicons name="create-outline" size={16} color={theme.secondaryText} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="Or type custom category"
            placeholderTextColor={theme.secondaryText}
            value={category}
            onChangeText={(t) => { setCategory(t); setErrors(p => ({ ...p, category: '' })); }}
          />
        </View>

        {/* Colour */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText, marginTop: 24 }]}>COLOUR</Text>
        <ChipGroup data={COLORS} selected={color} onSelect={(v) => { setColor(v); setErrors(p => ({ ...p, color: '' })); }} error={errors.color} theme={theme} />
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: errors.color ? '#FF4444' : 'transparent', marginTop: 10 }]}> 
          <Ionicons name="color-palette-outline" size={16} color={theme.secondaryText} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="Or type custom colour"
            placeholderTextColor={theme.secondaryText}
            value={color}
            onChangeText={(t) => { setColor(t); setErrors(p => ({ ...p, color: '' })); }}
          />
        </View>

        {/* Season */}
        <Text style={[styles.sectionLabel, { color: theme.secondaryText, marginTop: 24 }]}>SEASON</Text>
        <ChipGroup data={SEASONS} selected={season} onSelect={(v) => { setSeason(v); setErrors(p => ({ ...p, season: '' })); }} error={errors.season} theme={theme} />
        <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: errors.season ? '#FF4444' : 'transparent', marginTop: 10 }]}> 
          <Ionicons name="sunny-outline" size={16} color={theme.secondaryText} style={{ marginRight: 10 }} />
          <TextInput
            style={[styles.inputField, { color: theme.text }]}
            placeholder="Or type custom season"
            placeholderTextColor={theme.secondaryText}
            value={season}
            onChangeText={(t) => { setSeason(t); setErrors(p => ({ ...p, season: '' })); }}
          />
        </View>

        {/* Save */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.85 : 1 }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <View style={styles.savingRow}>
              <ActivityIndicator size="small" color="#141414" />
              <Text style={styles.saveBtnText}>{isEditMode ? 'Saving changes...' : 'Adding to wardrobe...'}</Text>
            </View>
          ) : (
            <Text style={styles.saveBtnText}>{isEditMode ? 'Save Changes' : 'Add to Wardrobe'}</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddItemsScreen;

const styles = StyleSheet.create({
  container:         { flex: 1, paddingHorizontal: 20 },
  nav:               { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  backBtn:           { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  navTitle:          { fontSize: 16, fontWeight: '700' },
  sectionLabel:      { fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 12, marginTop: 4 },
  photoRow:          { flexDirection: 'row', gap: 12, marginBottom: 24 },
  mainPhoto:         { flex: 1, height: 180, borderRadius: 16, overflow: 'hidden', borderWidth: 1.5, borderStyle: 'dashed' },
  mainPhotoImg:      { width: '100%', height: '100%', resizeMode: 'cover' },
  mainPhotoPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadIconCircle:  { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  uploadLabel:       { fontSize: 13, fontWeight: '600' },
  uploadSub:         { fontSize: 11 },
  sideOptions:       { gap: 10, justifyContent: 'flex-start' },
  sideBtn:           { width: 90, height: 82, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', gap: 6 },
  sideBtnText:       { fontSize: 11, fontWeight: '600' },
  inputWrap:         { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, height: 48, borderWidth: 1.5 },
  inputField:        { flex: 1, fontSize: 14 },
  fieldError:        { color: '#FF4444', fontSize: 11, marginTop: 5, marginLeft: 4 },
  saveBtn:           { height: 52, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginTop: 32 },
  savingRow:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  saveBtnText:       { color: '#141414', fontSize: 15, fontWeight: '700' },
});