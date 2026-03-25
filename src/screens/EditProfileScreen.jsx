import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Image, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchProfile, apiUpdateProfile } from '../services/apiService';

const resolveSource = (image) => {
  if (!image) return null;
  if (typeof image === 'number') return image;
  if (typeof image === 'string') return { uri: image };
  return image;
};

const InitialsAvatar = ({ name, size = 80, theme }) => {
  const initials = name ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : 'FP';
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#141414', fontWeight: '800', fontSize: size * 0.35 }}>{initials}</Text>
    </View>
  );
};

const InputRow = ({ label, value, onChange, placeholder, multiline = false, error, theme }) => (
  <View style={{ marginBottom: 16 }}>
    <Text style={[fS.label, { color: theme.text }]}>{label}</Text>
    <View style={[fS.wrap, { backgroundColor: theme.card, borderColor: error ? '#FF4444' : 'transparent' }, multiline && { height: 80, alignItems: 'flex-start', paddingVertical: 12 }]}>
      <TextInput style={[fS.input, { color: theme.text }, multiline && { textAlignVertical: 'top', height: 56 }]} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={theme.secondaryText} multiline={multiline} />
    </View>
    {error ? <Text style={fS.error}>{error}</Text> : null}
  </View>
);

const fS = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: 7 },
  wrap:  { borderRadius: 12, paddingHorizontal: 14, height: 48, justifyContent: 'center', borderWidth: 1.5 },
  input: { fontSize: 14, flex: 1 },
  error: { color: '#FF4444', fontSize: 11, marginTop: 5 },
});

const EditProfileScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatar, setAvatar] = useState(null); // ← FIXED: no require(), always null initially
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [gender, setGender] = useState('prefer-not-to-say');
  const [sizeTop, setSizeTop] = useState('');
  const [sizeBottom, setSizeBottom] = useState('');
  const [shoeSize, setShoeSize] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [styleTypesText, setStyleTypesText] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const p = await apiFetchProfile();
      if (p.avatar && typeof p.avatar === 'string') setAvatar(p.avatar);
      setFullName(p.fullName || '');
      setUsername(p.username || '');
      setBio(p.bio || '');
      setWebsite(p.website || '');
      setGender(p.gender || 'prefer-not-to-say');
      setSizeTop(p.sizeTop || '');
      setSizeBottom(p.sizeBottom || '');
      setShoeSize(p.shoeSize || '');
      setCity(p.city || '');
      setCountry(p.country || '');
      setStyleTypesText(Array.isArray(p.styleTypes) ? p.styleTypes.join(', ') : '');
      setEmail(p.email || '');
    } finally { setLoading(false); }
  };

  const pickAvatar = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.8, maxWidth: 400, maxHeight: 400 }, (res) => {
      if (res.assets?.[0]?.uri) setAvatar(res.assets[0].uri);
    });
  };

  const validate = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = 'Full name is required.';
    if (!username.trim()) e.username = 'Username is required.';
    else if (/\s/.test(username)) e.username = 'Username cannot contain spaces.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    try {
      setSaving(true);
      await apiUpdateProfile({
        avatar: typeof avatar === 'string' ? avatar : null,
        fullName: fullName.trim(),
        username: username.trim().replace('@', ''),
        bio: bio.trim(),
        website: website.trim(),
        gender,
        sizeTop: sizeTop.trim(),
        sizeBottom: sizeBottom.trim(),
        shoeSize: shoeSize.trim(),
        city: city.trim(),
        country: country.trim(),
        styleTypes: styleTypesText
          .split(',')
          .map((item) => String(item || '').trim())
          .filter(Boolean)
          .slice(0, 8),
        onboardingCompleted: true,
      });
      Alert.alert('Profile updated', 'Your changes have been saved.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not save. Please try again.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="chevron-back" size={22} color={theme.text} /></TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving} style={[styles.saveBtn, { backgroundColor: theme.primary, opacity: saving ? 0.8 : 1 }]}>
          {saving ? <ActivityIndicator size="small" color="#141414" /> : <Text style={styles.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.8}>
            {avatar ? <Image source={resolveSource(avatar)} style={styles.avatarImg} /> : <InitialsAvatar name={fullName} size={80} theme={theme} />}
            <View style={[styles.avatarEditBadge, { backgroundColor: theme.primary }]}>
              <Ionicons name="camera-outline" size={14} color="#141414" />
            </View>
          </TouchableOpacity>
          <Text style={[styles.changePhotoText, { color: theme.primary }]}>Change photo</Text>
        </View>
        <InputRow label="Full Name" value={fullName} onChange={setFullName} placeholder="Your full name" error={errors.fullName} theme={theme} />
        <InputRow label="Username"  value={username} onChange={setUsername} placeholder="yourhandle" error={errors.username} theme={theme} />
        <InputRow label="Bio"       value={bio}      onChange={setBio}      placeholder="Tell people about your style..." multiline theme={theme} />
        <InputRow label="Website"   value={website}  onChange={setWebsite}  placeholder="https://yoursite.com" theme={theme} />
        <InputRow label="Gender" value={gender} onChange={setGender} placeholder="female/male/non-binary/other" theme={theme} />
        <InputRow label="Top Size" value={sizeTop} onChange={setSizeTop} placeholder="e.g. M" theme={theme} />
        <InputRow label="Bottom Size" value={sizeBottom} onChange={setSizeBottom} placeholder="e.g. 32" theme={theme} />
        <InputRow label="Shoe Size" value={shoeSize} onChange={setShoeSize} placeholder="e.g. 42" theme={theme} />
        <InputRow label="City" value={city} onChange={setCity} placeholder="Your city" theme={theme} />
        <InputRow label="Country" value={country} onChange={setCountry} placeholder="Your country" theme={theme} />
        <InputRow label="Style Preferences" value={styleTypesText} onChange={setStyleTypesText} placeholder="streetwear, casual, minimalist" theme={theme} />
        <Text style={[fS.label, { color: theme.text }]}>Email</Text>
        <View style={[fS.wrap, { backgroundColor: theme.card, borderColor: 'transparent', opacity: 0.6 }]}>
          <Text style={[fS.input, { color: theme.secondaryText }]}>{email || 'Not available'}</Text>
        </View>
        <Text style={{ color: theme.secondaryText, fontSize: 11, marginTop: 5 }}>Email cannot be changed.</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default EditProfileScreen;

const styles = StyleSheet.create({
  container:       { flex: 1, paddingHorizontal: 20 },
  nav:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  navTitle:        { fontSize: 16, fontWeight: '700' },
  saveBtn:         { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 50, minWidth: 52, alignItems: 'center' },
  saveBtnText:     { color: '#141414', fontWeight: '700', fontSize: 13 },
  avatarSection:   { alignItems: 'center', marginBottom: 32, marginTop: 8 },
  avatarImg:       { width: 80, height: 80, borderRadius: 40, resizeMode: 'cover' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  changePhotoText: { fontSize: 13, fontWeight: '600', marginTop: 10 },
});