import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  useWindowDimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { apiFetchMyPosts } from '../services/mockApi';

const MyPostsScreen = ({ navigation }) => {
  const { width } = useWindowDimensions();
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetchMyPosts()
      .then((data) => {
        setMyPosts(data);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const { isDark } = useTheme(); // use your context
  const colors = {
    background: isDark ? '#141414' : '#FFF',
    card: isDark ? '#2A2A2A' : '#F2F2F2',
    text: isDark ? '#FEFDFB' : '#141414',
    subText: isDark ? '#888' : '#555',
    border: isDark ? '#555' : '#CCC',
  };

  const renderPost = ({ item }) => (
    <View style={[styles.postCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        <View style={{ marginLeft: 10 }}>
          <Text style={[styles.userName, { color: colors.text }]}>{item.userName}</Text>
          <Text style={[styles.postDate, { color: colors.subText }]}>{item.date}</Text>
        </View>
      </View>

      {/* Post Images */}
      <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
        {item.images.map((img, idx) => (
          <Image
            key={idx}
            source={{ uri: img }}
            style={[styles.postImage, { width: width - 40 }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      {/* Caption */}
      {item.caption ? (
        <Text style={[styles.caption, { color: colors.text }]}>{item.caption}</Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.card }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Posts</Text>
      </View>

      <FlatList
        data={myPosts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>Loading your posts...</Text>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="camera-outline" size={48} color={colors.subText} />
              <Text style={[styles.emptyText, { color: colors.subText }]}>No posts yet. Share your first outfit!</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
};

export default MyPostsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
  },
  backButton: {
    width: 33,
    height: 33,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  postCard: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  userName: {
    fontWeight: '600',
  },
  postDate: {
    fontSize: 11,
  },
  postImage: {
    height: 220,
  },
  caption: {
    padding: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 15,
  },
});
