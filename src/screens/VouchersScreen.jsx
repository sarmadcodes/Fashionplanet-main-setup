import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, Modal, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchVouchers } from '../services/apiService';

const Skeleton = ({ w, h, r = 10, style }) => {
  const { isDark } = useTheme();
  return <View style={[{ width: w, height: h, borderRadius: r, backgroundColor: isDark ? '#2A2A2A' : '#E8E8E8' }, style]} />;
};

const VouchersScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [vouchers, setVouchers]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selected, setSelected]   = useState(null); // voucher to show QR for

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      const data = await apiFetchVouchers();
      setVouchers(data);
    } finally {
      setLoading(false);
    }
  };

  const renderVoucher = ({ item }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: item.unlocked ? theme.primary + '55' : theme.border,
          opacity: item.unlocked ? 1 : 0.6,
        },
      ]}
    >
      {/* Decorative left accent */}
      <View style={[styles.accent, { backgroundColor: item.unlocked ? theme.primary : theme.border }]} />

      {/* Notch cutouts */}
      <View style={[styles.notchTop, { backgroundColor: theme.background }]} />
      <View style={[styles.notchBottom, { backgroundColor: theme.background }]} />

      <View style={styles.cardInner}>
        {/* Left */}
        <View style={{ flex: 1 }}>
          {item.unlocked ? (
            <View style={[styles.unlockedBadge, { backgroundColor: theme.primary + '22' }]}>
              <Ionicons name="checkmark-circle" size={12} color={theme.primary} />
              <Text style={[styles.unlockedText, { color: theme.primary }]}>Active</Text>
            </View>
          ) : (
            <View style={[styles.lockedBadge, { backgroundColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={12} color={theme.secondaryText} />
              <Text style={[styles.lockedText, { color: theme.secondaryText }]}>Locked</Text>
            </View>
          )}
          <Text style={[styles.storeName, { color: item.unlocked ? theme.primary : theme.secondaryText }]}>
            {item.store}
          </Text>
          <Text style={[styles.amount, { color: theme.text }]}>{item.amount}</Text>
          <Text style={[styles.expiry, { color: theme.secondaryText }]}>{item.expiry}</Text>
          {!item.unlocked && (
            <Text style={[styles.pointsReq, { color: theme.secondaryText }]}>
              Requires {item.pointsRequired?.toLocaleString()} pts
            </Text>
          )}
        </View>

        {/* Dashed divider */}
        <View style={[styles.dashDivider, { borderColor: theme.border }]} />

        {/* Right — redeem */}
        <View style={styles.cardRight}>
          {item.unlocked ? (
            <TouchableOpacity
              style={[styles.redeemBtn, { backgroundColor: theme.primary }]}
              onPress={() => setSelected(item)}
            >
              <Ionicons name="qr-code-outline" size={18} color="#141414" />
              <Text style={styles.redeemBtnText}>Redeem</Text>
            </TouchableOpacity>
          ) : (
            <View style={[styles.redeemBtn, { backgroundColor: theme.border }]}>
              <Ionicons name="lock-closed-outline" size={18} color={theme.secondaryText} />
              <Text style={[styles.redeemBtnText, { color: theme.secondaryText }]}>Locked</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={styles.nav}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: theme.text }]}>My Vouchers</Text>
        <View style={{ width: 22 }} />
      </View>

      {loading ? (
        <View>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} w="100%" h={120} r={16} style={{ marginBottom: 16 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={vouchers}
          keyExtractor={item => item.id}
          renderItem={renderVoucher}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              {vouchers.filter(v => v.unlocked).length} voucher{vouchers.filter(v => v.unlocked).length !== 1 ? 's' : ''} available to redeem
            </Text>
          }
        />
      )}

      {/* QR Modal */}
      <Modal visible={!!selected} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.qrBox, { backgroundColor: theme.card }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setSelected(null)}>
              <Ionicons name="close" size={20} color={theme.text} />
            </TouchableOpacity>

            <Text style={[styles.qrStore, { color: theme.text }]}>{selected?.store}</Text>
            <Text style={[styles.qrAmount, { color: theme.primary }]}>{selected?.amount}</Text>

            <View style={[styles.qrFrame, { borderColor: theme.border }]}>
              <Ionicons name="qr-code-outline" size={160} color={theme.text} />
            </View>

            <View style={[styles.codePill, { backgroundColor: theme.background }]}>
              <Text style={[styles.codeText, { color: theme.text }]}>{selected?.code}</Text>
            </View>

            <Text style={[styles.qrInstruction, { color: theme.secondaryText }]}>
              Show this code at the checkout counter for validation.
            </Text>
            <Text style={[styles.qrExpiry, { color: theme.secondaryText }]}>{selected?.expiry}</Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default VouchersScreen;

const styles = StyleSheet.create({
  container:      { flex: 1, paddingHorizontal: 20 },
  nav:            { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  navTitle:       { fontSize: 18, fontWeight: '700' },
  subtitle:       { fontSize: 12, marginBottom: 16 },
  card:           { borderRadius: 16, borderWidth: 1.5, marginBottom: 16, overflow: 'hidden', position: 'relative' },
  accent:         { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  notchTop:       { position: 'absolute', top: -12, right: 88, width: 24, height: 24, borderRadius: 12 },
  notchBottom:    { position: 'absolute', bottom: -12, right: 88, width: 24, height: 24, borderRadius: 12 },
  cardInner:      { flexDirection: 'row', alignItems: 'center', padding: 18, paddingLeft: 20 },
  unlockedBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, marginBottom: 8 },
  unlockedText:   { fontSize: 10, fontWeight: '700' },
  lockedBadge:    { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 50, marginBottom: 8 },
  lockedText:     { fontSize: 10, fontWeight: '700' },
  storeName:      { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 4 },
  amount:         { fontSize: 26, fontWeight: '900', marginBottom: 4 },
  expiry:         { fontSize: 10 },
  pointsReq:      { fontSize: 10, marginTop: 4 },
  dashDivider:    { width: 1, height: '80%', borderWidth: 1, borderStyle: 'dashed', marginHorizontal: 16 },
  cardRight:      { width: 80, alignItems: 'center' },
  redeemBtn:      { alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, width: 72 },
  redeemBtnText:  { color: '#141414', fontSize: 11, fontWeight: '700' },
  modalOverlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  qrBox:          { width: '100%', borderRadius: 24, padding: 28, alignItems: 'center' },
  closeBtn:       { alignSelf: 'flex-end', marginBottom: 8 },
  qrStore:        { fontSize: 14, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  qrAmount:       { fontSize: 32, fontWeight: '900', marginBottom: 20 },
  qrFrame:        { borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 20 },
  codePill:       { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 50, marginBottom: 16 },
  codeText:       { fontSize: 16, fontWeight: '700', letterSpacing: 3 },
  qrInstruction:  { fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 6 },
  qrExpiry:       { fontSize: 11 },
});