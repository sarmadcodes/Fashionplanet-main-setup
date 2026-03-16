import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar, TouchableOpacity, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { apiFetchInsights } from '../services/apiService';

const SkeletonBox = ({ w, height, borderRadius = 10, style }) => {
  const { isDark } = useTheme();
  return <View style={[{ width: w, height, borderRadius, backgroundColor: isDark ? '#2A2A2A' : '#E0E0E0' }, style]} />;
};

const InsightsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { width } = useWindowDimensions();
  const twoColWidth = (width - 55) / 2;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const result = await apiFetchInsights();
      setData(result);
    } catch {
      // Use fallback data on error
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 14 }}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Wardrobe Insights</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {loading ? (
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 }}>
              <SkeletonBox w={twoColWidth} height={90} borderRadius={16} />
              <SkeletonBox w={twoColWidth} height={90} borderRadius={16} />
            </View>
            <SkeletonBox w={180} height={18} borderRadius={6} style={{ marginBottom: 15 }} />
            <SkeletonBox w="100%" height={120} borderRadius={16} style={{ marginBottom: 25 }} />
            <SkeletonBox w={160} height={18} borderRadius={6} style={{ marginBottom: 15 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {[1, 2, 3, 4].map(i => (
                <SkeletonBox key={i} w={twoColWidth} height={70} borderRadius={12} style={{ marginBottom: 15 }} />
              ))}
            </View>
          </View>
        ) : (
          <>
            {/* Key Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { width: twoColWidth, backgroundColor: theme.card }]}> 
                <Text style={[styles.statLabel, { color: theme.text }]}>Total Items</Text>
                <Text style={styles.statValue}>{data?.totalItems || 124}</Text>
              </View>
              <View style={[styles.statBox, { width: twoColWidth, backgroundColor: theme.card }]}> 
                <Text style={[styles.statLabel, { color: theme.text }]}>Worth</Text>
                <Text style={styles.statValue}>{data?.totalWorth || '$2.4k'}</Text>
              </View>
            </View>

            {/* Most Worn */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Most Worn This Month</Text>
            <View style={[styles.insightCard, { backgroundColor: theme.card }]}>
              {(data?.mostWorn || []).map((item, i) => (
                <View key={i}>
                  {i > 0 && <View style={{ height: 15 }} />}
                  <View style={[styles.usageBarContainer, { backgroundColor: isDark ? '#333' : '#DDD' }]}>
                    <View style={[styles.usageBar, { width: `${item.percent}%`, backgroundColor: i === 0 ? '#C7DA2C' : '#888' }]} />
                  </View>
                  <View style={styles.itemRow}>
                    <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                    <Text style={[styles.itemCount, { color: theme.secondaryText }]}>{item.wears} wears</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Style Distribution */}
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Style Distribution</Text>
            <View style={styles.grid}>
              {(data?.styleDistribution || []).map((item, i) => (
                <View key={i} style={[styles.miniCard, { width: twoColWidth, backgroundColor: theme.card }]}> 
                  <Text style={[styles.miniLabel, { color: theme.secondaryText }]}>{item.label}</Text>
                  <Text style={[styles.miniPercent, { color: theme.text }]}>{item.percent}%</Text>
                </View>
              ))}
            </View>

            {/* Tip */}
            <View style={[styles.tipCard, { backgroundColor: theme.card, borderLeftColor: '#C7DA2C' }]}>
              <Ionicons name="bulb-outline" size={24} color="#C7DA2C" />
              <Text style={[styles.tipText, { color: theme.secondaryText }]}>{data?.tip}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, marginTop: 15 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: { padding: 20, borderRadius: 16 },
  statLabel: { fontSize: 14, marginBottom: 5 },
  statValue: { color: '#C7DA2C', fontSize: 24, fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 15, marginTop: 10 },
  insightCard: { padding: 20, borderRadius: 16, marginBottom: 25 },
  usageBarContainer: { height: 6, borderRadius: 3, overflow: 'hidden' },
  usageBar: { height: '100%' },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  itemName: { fontSize: 14 },
  itemCount: { fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  miniCard: { padding: 15, borderRadius: 12, marginBottom: 15 },
  miniLabel: { fontSize: 12 },
  miniPercent: { fontSize: 18, fontWeight: '600', marginTop: 4 },
  tipCard: { padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 4, marginBottom: 30 },
  tipText: { fontSize: 13, marginLeft: 15, flex: 1, lineHeight: 18 },
});

export default InsightsScreen;