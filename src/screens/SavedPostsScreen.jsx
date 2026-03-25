import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchSavedPosts } from '../services/apiService';

const SavedPostCard = ({ item, cardWidth, theme, onPress }) => (
  <TouchableOpacity
    style={[styles.card, { width: cardWidth, backgroundColor: theme.card, borderColor: theme.border }]}
    onPress={() => onPress(item)}
    activeOpacity={0.85}
  >
    {item?.images?.[0] || item?.image ? (
      <Image
        source={{ uri: item?.images?.[0] || item?.image }}
        style={styles.cardImage}
      />
    ) : (
      <View style={[styles.cardImage, styles.missingImage, { backgroundColor: theme.background }]}> 
        <Ionicons name="image-outline" size={20} color={theme.secondaryText} />
      </View>
    )}
    <View style={styles.cardBody}>
      <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={1}>
        {item?.userName || 'Saved Post'}
      </Text>
      <Text style={[styles.cardCaption, { color: theme.secondaryText }]} numberOfLines={2}>
        {item?.caption || 'No caption'}
      </Text>
      <View style={styles.cardMetaRow}>
        <View style={styles.metaPill}>
          <Ionicons name="heart" size={12} color="#E53E3E" />
          <Text style={[styles.metaText, { color: theme.secondaryText }]}>{Number(item?.likes) || 0}</Text>
        </View>
        <View style={styles.metaPill}>
          <Ionicons name="chatbubble" size={12} color={theme.primary} />
          <Text style={[styles.metaText, { color: theme.secondaryText }]}>{Number(item?.comments) || 0}</Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const SavedPostsScreen = ({ navigation }) => {
  const route = useRoute();
  const { width } = useWindowDimensions();
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  const [loading, setLoading] = useState(true);
  const [savedPosts, setSavedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const cardWidth = useMemo(() => (width - 52) / 2, [width]);

  const loadSavedPosts = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await apiFetchSavedPosts();
      const normalized = (rows || []).map((p) => ({ ...p, id: p.id || p._id }));
      setSavedPosts(normalized);

      const requestedPostId = String(route?.params?.postId || '');
      if (requestedPostId) {
        const found = normalized.find((p) => String(p.id) === requestedPostId);
        if (found) {
          setSelectedPost(found);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [route?.params?.postId]);

  useFocusEffect(
    useCallback(() => {
      loadSavedPosts();
    }, [loadSavedPosts])
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={styles.headerRow}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: theme.text }]}>Saved Posts</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            {loading ? 'Loading saved posts...' : `${savedPosts.length} saved`}
          </Text>
        </View>
      </View>

      <FlatList
        data={savedPosts}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <SavedPostCard item={item} cardWidth={cardWidth} theme={theme} onPress={setSelectedPost} />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={[styles.emptyBox, { backgroundColor: theme.card, borderColor: theme.border }]}> 
              <Ionicons name="bookmark-outline" size={28} color={theme.secondaryText} />
              <Text style={[styles.emptyText, { color: theme.secondaryText }]}>No saved posts yet</Text>
            </View>
          ) : null
        }
      />

      <Modal
        visible={Boolean(selectedPost)}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalWrap}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}> 
            {selectedPost?.images?.[0] || selectedPost?.image ? (
              <Image source={{ uri: selectedPost?.images?.[0] || selectedPost?.image }} style={styles.modalImage} />
            ) : (
              <View style={[styles.modalImage, styles.missingImage, { backgroundColor: theme.background }]}> 
                <Ionicons name="image-outline" size={30} color={theme.secondaryText} />
              </View>
            )}
            <View style={styles.modalBody}>
              <Text style={[styles.modalAuthor, { color: theme.text }]}>{selectedPost?.userName || 'Saved Post'}</Text>
              <Text style={[styles.modalCaption, { color: theme.secondaryText }]}>
                {selectedPost?.caption || 'No caption'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: theme.primary }]}
              onPress={() => setSelectedPost(null)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default SavedPostsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, marginBottom: 16 },
  backBtn: { width: 38, height: 38, borderRadius: 12, borderWidth: 0.5, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 21, fontWeight: '800' },
  subtitle: { fontSize: 12, marginTop: 2 },
  card: { borderRadius: 14, borderWidth: 1, overflow: 'hidden', marginBottom: 12 },
  cardImage: { width: '100%', height: 150, resizeMode: 'cover' },
  missingImage: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 10 },
  cardTitle: { fontSize: 12, fontWeight: '800' },
  cardCaption: { fontSize: 11, marginTop: 3, minHeight: 28 },
  cardMetaRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11 },
  emptyBox: { borderRadius: 14, borderWidth: 1, padding: 24, alignItems: 'center', marginTop: 40 },
  emptyText: { fontSize: 13, marginTop: 8 },
  modalWrap: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: { width: '100%', borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  modalImage: { width: '100%', height: 320, resizeMode: 'cover' },
  modalBody: { padding: 14 },
  modalAuthor: { fontSize: 15, fontWeight: '800', marginBottom: 6 },
  modalCaption: { fontSize: 13, lineHeight: 19 },
  closeBtn: { marginHorizontal: 14, marginBottom: 14, borderRadius: 999, alignItems: 'center', justifyContent: 'center', paddingVertical: 11 },
  closeBtnText: { color: '#141414', fontSize: 13, fontWeight: '800' },
});
