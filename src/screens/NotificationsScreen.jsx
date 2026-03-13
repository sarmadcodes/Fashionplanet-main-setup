import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchNotifications, apiMarkNotificationAsRead } from '../services/mockApi';

const NotificationsScreen = () => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [])
  );

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const notifs = await apiFetchNotifications();
      const normalized = (notifs || []).map((n) => ({
        ...n,
        id: n.id || n._id,
        timestamp: n.timestamp || n.createdAt || new Date().toISOString(),
      }));
      setNotifications(normalized);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await loadNotifications();
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationPress = async (notificationId) => {
    await apiMarkNotificationAsRead(notificationId);
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updated);
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'like': return { icon: 'heart', color: '#E53E3E' };
      case 'comment': return { icon: 'chatbubble', color: theme.primary };
      case 'save': return { icon: 'bookmark', color: '#9F7AEA' };
      case 'follow': return { icon: 'person-add', color: '#38B6FF' };
      default: return { icon: 'notifications', color: theme.primary };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
          {notifications.length} {notifications.length === 1 ? 'update' : 'updates'}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : notifications.length === 0 ? (
        <ScrollView
          contentContainerStyle={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          <Ionicons name="notifications-outline" size={60} color={theme.secondaryText + '40'} />
          <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No notifications yet</Text>
          <Text style={[styles.emptySubText, { color: theme.secondaryText }]}>You'll see updates when people like or comment on your posts</Text>
        </ScrollView>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          <View style={{ paddingHorizontal: 16, paddingBottom: 100 }}>
            {notifications.map((notif) => {
              const { icon, color } = getIconForType(notif.type);
              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notificationCard,
                    { backgroundColor: notif.read ? theme.card : theme.primary + '10', borderColor: theme.border }
                  ]}
                  onPress={() => handleNotificationPress(notif.id)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.iconCircle, { backgroundColor: color + '20' }]}>
                    <Ionicons name={icon} size={20} color={color} />
                  </View>

                  <View style={{ flex: 1, marginHorizontal: 12 }}>
                    <Text style={[styles.notifTitle, { color: theme.text }]} numberOfLines={2}>
                      <Text style={{ fontWeight: '700' }}>{notif.user}</Text> {notif.action}
                    </Text>
                    <Text style={[styles.notifTime, { color: theme.secondaryText }]}>
                      {getRelativeTime(notif.timestamp)}
                    </Text>
                  </View>

                  {!notif.read && (
                    <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const getRelativeTime = (timestamp) => {
  const now = new Date();
  const diff = now - new Date(timestamp);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
};

export default NotificationsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 13,
    marginTop: 8,
    paddingHorizontal: 30,
    textAlign: 'center',
    lineHeight: 18,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 0.5,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  notifTime: {
    fontSize: 11,
    marginTop: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
