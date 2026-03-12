import Ionicons from '@react-native-vector-icons/ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

const AccountVisibilityScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [selected, setSelected] = useState('public');

  useEffect(() => {
    AsyncStorage.getItem('account_visibility').then((val) => {
      if (val) setSelected(val);
    });
  }, []);

  const handleSave = async () => {
    await AsyncStorage.setItem('account_visibility', selected);
    navigation.goBack();
  };

  const options = [
    {
      key: 'public',
      title: 'Public',
      desc: 'Anyone can view your profile',
    },
    {
      key: 'private',
      title: 'Private',
      desc: 'Only approved users can view',
    },
    {
      key: 'hidden',
      title: 'Hidden',
      desc: 'Your profile will be invisible',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Account Visibility</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { color: theme.primary }]}>Save</Text>
        </TouchableOpacity>
      </View>

      {options.map(item => (
        <TouchableOpacity
          key={item.key}
          style={[
            styles.option,
            { backgroundColor: theme.card, borderColor: theme.border },
            selected === item.key && { borderColor: theme.primary },
          ]}
          onPress={() => setSelected(item.key)}
        >
          <Text style={[styles.optionTitle, { color: theme.text }]}>{item.title}</Text>
          <Text style={[styles.optionDesc, { color: theme.secondaryText }]}>{item.desc}</Text>
        </TouchableOpacity>
      ))}
    </SafeAreaView>
  );
};

export default AccountVisibilityScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  saveText: { fontSize: 14, fontWeight: '700' },
  option: {
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
  },
  optionTitle: {
    fontSize: 16,
    marginBottom: 6,
    fontWeight: '500',
  },
  optionDesc: {
    fontSize: 13,
  },
});
