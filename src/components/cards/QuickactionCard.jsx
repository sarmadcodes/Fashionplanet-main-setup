import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../../context/ThemeContext';
import { darkTheme, lightTheme } from '../../theme/colors';

const QUICK_ACTIONS = [
  {
    id: '1',
    title: "Today's Outfit",
    icon: 'sparkles-outline',
    screen: 'GenerateOutfitsScreen',
  },
  {
    id: '2',
    title: 'Add Items',
    icon: 'add-circle-outline',
    screen: 'AddItemsScreen',
  },
  {
    id: '3',
    title: 'Week Plan',
    icon: 'calendar-outline',
    screen: 'WeekPlanScreen',
  },
  {
    id: '4',
    title: 'Insights',
    icon: 'bar-chart-outline',
    screen: 'InsightsScreen',
  },
];

const QuickactionCard = () => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {QUICK_ACTIONS.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.actionCard, { borderColor: theme.border, backgroundColor: theme.card }]}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconCircle, { backgroundColor: theme.primary + '18' }]}>
              <Ionicons name={item.icon} size={20} color={theme.primary} />
            </View>
            <Text style={[styles.actionText, { color: theme.text }]}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
};

export default QuickactionCard;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  actionCard: {
    flex: 1,
    aspectRatio: 0.85,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 13,
  },
});