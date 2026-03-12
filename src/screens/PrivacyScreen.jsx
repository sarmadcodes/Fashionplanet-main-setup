import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

const PrivacyScreen = () => {
  const { isDark } = useTheme();

  // Dynamic colors based on theme
  const colors = {
    background: isDark ? '#141414' : '#FFF',
    card: isDark ? '#2A2A2A' : '#F2F2F2',
    text: isDark ? '#FEFDFB' : '#141414',
    subText: isDark ? '#D9D9DA' : '#555',
    border: isDark ? '#333' : '#CCC',
    switchThumbOn: '#C7DA2C',
    switchThumbOff: '#D9D9DA',
    switchTrackOn: isDark ? '#D9D9DA' : '#C0C0C0',
    switchTrackOff: isDark ? '#141414' : '#E0E0E0',
  };

  const [privacy, setPrivacy] = useState({
    profileSearch: true,
    onlineStatus: true,
    dataSharing: false,
  });

  useEffect(() => {
    AsyncStorage.getItem('privacy_prefs').then((val) => {
      if (val) setPrivacy(JSON.parse(val));
    });
  }, []);

  const toggle = async (key) => {
    const updated = { ...privacy, [key]: !privacy[key] };
    setPrivacy(updated);
    await AsyncStorage.setItem('privacy_prefs', JSON.stringify(updated));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Privacy</Text>

      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Option label="Allow Profile Search" value={privacy.profileSearch} onChange={() => toggle('profileSearch')} colors={colors} />
        <Option label="Show Online Status" value={privacy.onlineStatus} onChange={() => toggle('onlineStatus')} colors={colors} />
        <Option label="Allow Data Sharing" value={privacy.dataSharing} onChange={() => toggle('dataSharing')} colors={colors} />
      </View>
    </SafeAreaView>
  );
};

const Option = ({ label, value, onChange, colors }) => (
  <View style={[styles.row, { borderColor: colors.border }]}>
    <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      thumbColor={value ? colors.switchThumbOn : colors.switchThumbOff}
      trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
    />
  </View>
);

export default PrivacyScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 20,
    marginTop: 10,
    marginBottom: 20,
    fontWeight: '600',
  },
  card: {
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 16,
  },
});
