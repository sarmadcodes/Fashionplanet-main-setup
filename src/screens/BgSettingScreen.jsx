import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

const BackgroundSettingsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const [enabled, setEnabled] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('bg_setting').then((val) => {
      if (val) {
        const parsed = JSON.parse(val);
        setEnabled(parsed.enabled);
        setSelected(parsed.selected);
      }
    });
  }, []);

  const FREE_BACKGROUNDS = [
    { id: 'gradient_soft', title: 'Soft Gradient', desc: 'Subtle dark gradient background' },
    { id: 'texture_slate', title: 'Slate Texture', desc: 'Minimal abstract texture' },
  ];

  const PREMIUM_BACKGROUNDS = [
    { id: 'editorial_blur', title: 'Blur Editorial', desc: 'Blurred editorial-style image' },
  ];

  const handleReset = () => {
    setEnabled(false);
    setSelected(null);
    AsyncStorage.setItem('bg_setting', JSON.stringify({ enabled: false, selected: null }));
  };

  const handleSelect = (id) => {
    if (!enabled) return;
    setSelected(id);
    AsyncStorage.setItem('bg_setting', JSON.stringify({ enabled, selected: id }));
  };

  const handleToggle = (val) => {
    setEnabled(val);
    AsyncStorage.setItem('bg_setting', JSON.stringify({ enabled: val, selected }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { borderColor: theme.border, backgroundColor: theme.card }]}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Background Themes</Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Feature Scope Notice */}
        <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.card }]}> 
          <Text style={[styles.infoText, { color: theme.secondaryText }]}> 
            Backgrounds apply only to profile headers, AI styling screens,
            collections and selected empty states. They will not affect feeds,
            forms, or settings pages.
          </Text>
        </View>

        {/* Enable / Default */}
        <View style={[styles.option, { backgroundColor: theme.card, borderColor: theme.secondaryText }]}> 
          <View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Default (Off)</Text>
            <Text style={[styles.optionDesc, { color: theme.secondaryText }]}> 
              Use standard app background
            </Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={handleToggle}
            thumbColor={enabled ? theme.primary : '#999'}
            trackColor={{ false: '#444', true: '#777' }}
          />
        </View>

        {/* FREE GROUP */}
        <Text style={[styles.groupTitle, { color: theme.text }]}>Free Backgrounds</Text>

        {FREE_BACKGROUNDS.map(item => {
          const active = selected === item.id;
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.option,
                { backgroundColor: theme.card, borderColor: theme.secondaryText },
                active && { borderColor: theme.primary },
                !enabled && { opacity: 0.4 },
              ]}
              onPress={() => handleSelect(item.id)}
              activeOpacity={0.8}
            >
              <View>
                <Text style={[styles.optionTitle, { color: theme.text }]}>{item.title}</Text>
                <Text style={[styles.optionDesc, { color: theme.secondaryText }]}>{item.desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* PREMIUM GROUP */}
        <Text style={[styles.groupTitle, { color: theme.text }]}>Premium Backgrounds</Text>

        {PREMIUM_BACKGROUNDS.map(item => (
          <View
            key={item.id}
            style={[styles.option, { backgroundColor: theme.card, borderColor: theme.secondaryText, opacity: 0.5 }]}
          >
            <View>
              <Text style={[styles.optionTitle, { color: theme.text }]}> 
                {item.title}
                <Text style={[styles.premium, { color: theme.primary }]}>  • Premium</Text>
              </Text>
              <Text style={[styles.optionDesc, { color: theme.secondaryText }]}>{item.desc}</Text>
            </View>
          </View>
        ))}

        {/* Accessibility Notice */}
        <View style={[styles.infoBox, { backgroundColor: theme.card, borderColor: theme.card }]}> 
          <Text style={[styles.infoText, { color: theme.secondaryText }]}> 
            All backgrounds use adaptive dark overlays (60–80%) to maintain
            contrast and protect readability. Backgrounds are decorative only.
          </Text>
        </View>

        {/* Reset */}
        <TouchableOpacity
          style={[
            styles.option,
            { backgroundColor: theme.card, borderColor: theme.secondaryText },
            styles.resetButton,
          ]}
          onPress={handleReset}
          activeOpacity={0.8}
        >
          <View>
            <Text style={[styles.optionTitle, { color: theme.text }]}>Reset to Default</Text>
            <Text style={[styles.optionDesc, { color: theme.secondaryText }]}> 
              Remove custom background anytime
            </Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default BackgroundSettingsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: '700', marginLeft: 14 },
  groupTitle: { fontSize: 16, marginTop: 25, marginBottom: 15, fontWeight: '500' },
  option: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionTitle: { fontSize: 16, marginBottom: 6 },
  optionDesc: { fontSize: 13 },
  premium: { fontSize: 13 },
  infoBox: { padding: 14, borderRadius: 10, marginBottom: 20, borderWidth: 1 },
  infoText: { fontSize: 12, lineHeight: 18 },
  resetButton: { marginTop: 20 },
});
