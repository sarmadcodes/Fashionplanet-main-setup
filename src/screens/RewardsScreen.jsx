import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchRewards } from '../services/mockApi';

const Skeleton = ({ w, h, r = 8, style }) => {
  const { isDark } = useTheme();
  return <View style={[{ width: w, height: h, borderRadius: r, backgroundColor: isDark ? '#1F1F1F' : '#ECECEC' }, style]} />;
};

const ACTIVITY_ICONS = {
  'camera': 'camera-outline',
  'calendar': 'calendar-outline',
  'share-variant': 'share-social-outline',
  'heart-outline': 'heart-outline',
};

const getTier = (points) => {
  if (points >= 2000) return { label: 'Platinum', color: '#4A90E2' };
  if (points >= 1000) return { label: 'Gold', color: '#D4AF37' };
  if (points >= 500) return { label: 'Silver', color: '#888888' };
  return { label: 'Bronze', color: '#C4985F' };
};

const RewardsScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData]       = useState(null);
  const [error, setError]     = useState('');

  const progressAnim = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetchRewards();
      setData(res);
      // Animate progress bar
      Animated.timing(progressAnim, {
        toValue: Math.min((res.points / res.nextThreshold) * 100, 100),
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } catch {
      setError('Failed to load rewards.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      setError('');
      const res = await apiFetchRewards();
      setData(res);
      Animated.timing(progressAnim, {
        toValue: Math.min((res.points / res.nextThreshold) * 100, 100),
        duration: 1000,
        useNativeDriver: false,
      }).start();
    } catch {
      setError('Failed to refresh.');
    } finally {
      setRefreshing(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  const tier = getTier(data?.points ?? 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>Rewards</Text>
        <TouchableOpacity onPress={() => navigation.navigate('VouchersScreen')} activeOpacity={0.7}>
          <Text style={[styles.navLink, { color: theme.primary }]}>Vouchers</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <Skeleton w="100%" h={180} r={18} style={{ marginBottom: 28 }} />
          <Skeleton w={160} h={16} r={6} style={{ marginBottom: 16 }} />
          {[1, 2, 3].map(i => <Skeleton key={i} w="100%" h={72} r={14} style={{ marginBottom: 12 }} />)}
        </ScrollView>
      ) : error && !data ? (
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color={theme.secondaryText} />
          <Text style={[styles.errorMsg, { color: theme.text }]}>{error}</Text>
          <TouchableOpacity onPress={load} style={[styles.retryBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          {/* Points Card */}
          <View style={[styles.pointsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={styles.pointsTop}>
              <View>
                <Text style={[styles.pointsLabel, { color: theme.secondaryText }]}>Total Points</Text>
                <Text style={[styles.pointsVal, { color: theme.primary }]}>
                  {data?.points.toLocaleString() ?? 0}
                </Text>
              </View>
              <View style={[styles.tierBadge, { backgroundColor: tier.color + '20', borderColor: tier.color }]}> 
                <Ionicons name="star" size={13} color={tier.color} />
                <Text style={[styles.tierText, { color: tier.color }]}>{tier.label}</Text>
              </View>
            </View>

            {/* Progress */}
            <View style={styles.progressSection}>
              <View style={[styles.progressBg, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: theme.primary }]} />
              </View>
              <View style={styles.progressLabels}>
                <Text style={[styles.progressSub, { color: theme.secondaryText }]}>
                  {data?.nextThreshold && data?.points
                    ? (data.nextThreshold - data.points).toLocaleString()
                    : 0}{' '}
                  pts to next reward
                </Text>
                <Text style={[styles.progressPct, { color: theme.primary }]}>
                  {data?.points && data?.nextThreshold
                    ? Math.round((data.points / data.nextThreshold) * 100)
                    : 0}%
                </Text>
              </View>
            </View>

            {/* Redeem CTA */}
            <TouchableOpacity
              style={[styles.redeemBtn, { backgroundColor: theme.primary }]}
              onPress={() => navigation.navigate('VouchersScreen')}
              activeOpacity={0.75}
            >
              <Ionicons name="gift" size={16} color="#141414" />
              <Text style={styles.redeemText}>Redeem Vouchers</Text>
            </TouchableOpacity>
          </View>

          {/* History */}
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
          {data?.history.map((item) => (
            <View key={item.id} style={[styles.histRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={[styles.histIcon, { backgroundColor: theme.primary + '18' }]}>
                <Ionicons name="star-outline" size={16} color={theme.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.histAction, { color: theme.text }]}>{item.action}</Text>
                <Text style={[styles.histDate, { color: theme.secondaryText }]}>{item.date}</Text>
              </View>
              <Text style={[styles.histPoints, { color: theme.primary }]}>+{item.points}</Text>
            </View>
          ))}

          {/* Earn More */}
          <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 28 }]}>Earn More Points</Text>
          {data?.activities.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.earnRow, { backgroundColor: theme.card, borderColor: theme.border }]}
              activeOpacity={0.7}
            >
              <View style={[styles.earnIcon, { backgroundColor: theme.primary + '15' }]}>
                <Ionicons name={ACTIVITY_ICONS[item.icon] || 'star-outline'} size={18} color={theme.primary} />
              </View>
              <Text style={[styles.earnTitle, { color: theme.text }]}>{item.title}</Text>
              <View style={[styles.pointsPill, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.pointsPillText, { color: theme.primary }]}>{item.points}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default RewardsScreen;

const styles = StyleSheet.create({
  container:        { flex: 1, paddingHorizontal: 0 },
  nav:              { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  navTitle:         { fontSize: 18, fontWeight: '700' },
  navLink:          { fontSize: 13, fontWeight: '700' },
  pointsCard:       { borderRadius: 18, borderWidth: 0.5, padding: 20, marginTop: 16, marginBottom: 28, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  pointsTop:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  pointsLabel:      { fontSize: 13, marginBottom: 4, fontWeight: '500' },
  pointsVal:        { fontSize: 40, fontWeight: '800' },
  tierBadge:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 50, borderWidth: 1.5 },
  tierText:         { fontSize: 12, fontWeight: '700' },
  progressSection:  { marginBottom: 20 },
  progressBg:       { height: 8, borderRadius: 6, overflow: 'hidden', borderWidth: 0.5 },
  progressFill:     { height: '100%', borderRadius: 6 },
  progressLabels:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  progressSub:      { fontSize: 12, fontWeight: '500' },
  progressPct:      { fontSize: 12, fontWeight: '700' },
  redeemBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 12, borderRadius: 50, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  redeemText:       { color: '#141414', fontWeight: '700', fontSize: 15 },
  sectionTitle:     { fontSize: 17, fontWeight: '700', marginBottom: 14, marginTop: 8 },
  histRow:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14, borderRadius: 14, marginBottom: 10, borderWidth: 0.5 },
  histIcon:         { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  histAction:       { fontSize: 13, fontWeight: '600' },
  histDate:         { fontSize: 11, marginTop: 3, fontWeight: '500' },
  histPoints:       { fontSize: 15, fontWeight: '700' },
  earnRow:          { flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 14, marginBottom: 10, borderWidth: 0.5, gap: 12 },
  earnIcon:         { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  earnTitle:        { flex: 1, fontSize: 13, fontWeight: '600' },
  pointsPill:       { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 50 },
  pointsPillText:   { fontSize: 12, fontWeight: '700' },
  errorState:       { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 30 },
  errorMsg:         { fontSize: 16, textAlign: 'center' },
  retryBtn:         { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 50 },
  retryText:        { color: '#141414', fontWeight: '700', fontSize: 14 },
});