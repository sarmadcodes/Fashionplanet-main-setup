import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useEffect, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  StatusBar, 
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { apiAddWeekPlanItem, apiFetchWeekPlan, apiToggleWeekPlanItem } from '../services/mockApi';

const WeekPlanScreen = ({ navigation }) => {
  const { isDark } = useTheme(); // ✅ use correct value from context
  const theme = isDark ? darkTheme : lightTheme;

  const [selectedDay, setSelectedDay] = useState(null);
  const [scheduleData, setScheduleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    time: '',
    event: '',
    outfit: '',
    sub: '',
  });

  const days = useMemo(() => {
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      return {
        label: dayLabels[d.getDay()],
        date: String(d.getDate()).padStart(2, '0'),
      };
    });
  }, []);

  useEffect(() => {
    setSelectedDay(days[0].label);
    apiFetchWeekPlan()
      .then((data) => setScheduleData(data))
      .catch(() => Alert.alert('Error', 'Could not load your week plan.'))
      .finally(() => setLoading(false));
  }, [days]);

  const handleBack = () => navigation.goBack();

  const openAddModal = () => {
    if (!selectedDay) return;
    setForm({ time: '', event: '', outfit: '', sub: '' });
    setShowAddModal(true);
  };

  const handleAddItem = async () => {
    if (!selectedDay) return;
    if (!form.outfit.trim()) {
      Alert.alert('Missing info', 'Outfit name is required.');
      return;
    }

    try {
      setSubmitting(true);
      const created = await apiAddWeekPlanItem(selectedDay, form);
      setScheduleData((prev) => ({
        ...prev,
        [selectedDay]: [created, ...(prev[selectedDay] || [])],
      }));
      setShowAddModal(false);
    } catch (e) {
      Alert.alert('Could not add plan item', e.message || 'Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id) => {
    if (!selectedDay) return;
    setScheduleData((prev) => {
      if (!selectedDay || !prev[selectedDay]) return prev;
      const dayItems = prev[selectedDay].map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'ready' ? 'pending' : 'ready' }
          : item
      );
      return { ...prev, [selectedDay]: dayItems };
    });

    try {
      await apiToggleWeekPlanItem(selectedDay, id);
    } catch {
      setScheduleData((prev) => {
        if (!selectedDay || !prev[selectedDay]) return prev;
        const dayItems = prev[selectedDay].map((item) =>
          item.id === id
            ? { ...item, status: item.status === 'ready' ? 'pending' : 'ready' }
            : item
        );
        return { ...prev, [selectedDay]: dayItems };
      });
      Alert.alert('Update failed', 'Could not update this plan item. Please try again.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor={theme.background} 
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={25} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Week Plan</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Horizontal 7-Day Picker */}
      <View style={styles.dateContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {days.map((item) => (
            <TouchableOpacity 
              key={item.label} 
              onPress={() => setSelectedDay(item.label)}
              style={[
                styles.dateCard, 
                { backgroundColor: isDark ? '#2A2A2A' : '#F2F2F2' },
                selectedDay === item.label && { backgroundColor: '#C7DA2C' }
              ]}
            >
              <Text style={[
                styles.dayText, 
                { color: isDark ? '#D9D9DA' : '#141414' },
                selectedDay === item.label && { color: 'black' }
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {loading ? (
          <View style={{ paddingTop: 40, alignItems: 'center' }}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {selectedDay}'s Outfits
        </Text>

        <Text style={[styles.helperText, { color: theme.secondaryText }]}>Tap + Add Plan Item to create a new outfit plan for this day. Tap the check icon to mark it ready.</Text>

        <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={openAddModal}>
          <Ionicons name="add" size={18} color="#141414" />
          <Text style={styles.addBtnText}>Add Plan Item</Text>
        </TouchableOpacity>

        {(scheduleData[selectedDay] || []).map((item) => (
          <View key={item.id} style={[styles.planCard, { backgroundColor: isDark ? '#2A2A2A' : '#F2F2F2' }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.timeText, { color: isDark ? '#D9D9DA' : '#555' }]}>
                {item.time} • {item.event}
              </Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color={isDark ? '#D9D9DA' : '#555'} />
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <View style={[styles.imagePlaceholder, { backgroundColor: isDark ? '#111' : '#E5E5E5' }]}>
                <Ionicons name="shirt-outline" size={24} color={isDark ? '#D9D9DA' : '#444'} />
              </View>
              <View style={styles.cardDetails}>
                <Text style={[styles.outfitName, { color: theme.text }]}>{item.outfit}</Text>
                <Text style={[styles.outfitSub, { color: isDark ? '#999' : '#555' }]}>{item.sub}</Text>
              </View>

              <TouchableOpacity style={styles.statusIcon} onPress={() => toggleStatus(item.id)}>
                <Ionicons 
                  name={item.status === 'ready' ? "checkmark-circle" : "add-circle-outline"} 
                  size={30} 
                  color={item.status === 'ready' ? "#C7DA2C" : (isDark ? '#D9D9DA' : '#444')} 
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
          </>
        )}
      </ScrollView>

      <Modal transparent visible={showAddModal} animationType="fade" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
            <Text style={[styles.modalTitle, { color: theme.text }]}>Add Plan Item ({selectedDay})</Text>

            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              placeholder="Outfit name (required)"
              placeholderTextColor={theme.secondaryText}
              value={form.outfit}
              onChangeText={(t) => setForm((p) => ({ ...p, outfit: t }))}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              placeholder="Event (e.g. Office, Dinner)"
              placeholderTextColor={theme.secondaryText}
              value={form.event}
              onChangeText={(t) => setForm((p) => ({ ...p, event: t }))}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              placeholder="Time (e.g. Morning)"
              placeholderTextColor={theme.secondaryText}
              value={form.time}
              onChangeText={(t) => setForm((p) => ({ ...p, time: t }))}
            />
            <TextInput
              style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
              placeholder="Notes"
              placeholderTextColor={theme.secondaryText}
              value={form.sub}
              onChangeText={(t) => setForm((p) => ({ ...p, sub: t }))}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalBtn, { borderColor: theme.border }]} onPress={() => setShowAddModal(false)}>
                <Text style={{ color: theme.text }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: theme.primary, borderColor: theme.primary }]} onPress={handleAddItem} disabled={submitting}>
                <Text style={{ color: '#141414', fontWeight: '700' }}>{submitting ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginTop: 15,
    marginBottom: 15 
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  backBtn: { padding: 5 },
  dateContainer: { height: 90, marginBottom: 20, paddingLeft: 20 },
  dateCard: { 
    alignItems: 'center', 
    justifyContent: 'center',
    paddingVertical: 12, 
    borderRadius: 16, 
    width: 65, 
    marginRight: 12 
  },
  dayText: { fontSize: 13, marginBottom: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 20, paddingHorizontal: 20 },
  helperText: { fontSize: 12, paddingHorizontal: 20, marginBottom: 10, lineHeight: 18 },
  addBtn: {
    marginHorizontal: 20,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 14,
  },
  addBtnText: { color: '#141414', fontWeight: '700', fontSize: 14 },
  planCard: { borderRadius: 20, padding: 18, marginBottom: 15, marginHorizontal: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  timeText: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  cardContent: { flexDirection: 'row', alignItems: 'center' },
  imagePlaceholder: { 
    width: 65, 
    height: 65, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  cardDetails: { flex: 1, marginLeft: 15 },
  outfitName: { fontSize: 17, fontWeight: '600' },
  outfitSub: { fontSize: 13, marginTop: 4 },
  statusIcon: { paddingLeft: 10 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
    gap: 10,
  },
  modalBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
  },
});

export default WeekPlanScreen;
