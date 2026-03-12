import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, TouchableOpacity,
  ScrollView, StatusBar, Modal, TextInput, Alert,
  ActivityIndicator, Animated, RefreshControl, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';
import { apiFetchFeedPosts, apiToggleLike, apiCreatePost } from '../services/mockApi';

const Skeleton = ({ style }) => {
  const { isDark } = useTheme();
  return <View style={[{ backgroundColor: isDark ? '#1F1F1F' : '#ECECEC', borderRadius: 12 }, style]} />;
};

// Professional Avatar with initials
const Avatar = ({ uri, name, size = 40, theme }) => {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  if (uri) {
    return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
  }
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center',
    }}>
      <Text style={{ color: '#141414', fontWeight: '600', fontSize: size * 0.35 }}>{initials}</Text>
    </View>
  );
};

const PostCard = ({ item, theme, onLike }) => {
  const [imgIndex, setImgIndex] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const { width } = useWindowDimensions();
  const imageWidth = width - 32;

  const handleLikePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onLike(item.id);
  };

  return (
    <View style={[postStyles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {/* Header */}
      <View style={postStyles.header}>
        <View style={postStyles.headerLeft}>
          <Avatar uri={item.avatar} name={item.userName} size={44} theme={theme} />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={[postStyles.userName, { color: theme.text }]}>{item.userName}</Text>
            <Text style={[postStyles.meta, { color: theme.secondaryText }]}>
              {item.username}
              <Text style={{ color: theme.secondaryText }}> • {item.date}</Text>
            </Text>
          </View>
        </View>
        {item.isOwn && (
          <View style={[postStyles.ownBadge, { borderColor: theme.primary }]}>
            <Text style={[postStyles.ownText, { color: theme.primary }]}>You</Text>
          </View>
        )}
      </View>

      {/* Images with carousel */}
      {item.images && item.images.length > 0 && (
        <View style={postStyles.imgWrap}>
          <Image
            source={{ uri: item.images[imgIndex] }}
            style={{ width: imageWidth, height: imageWidth * 0.75 }}
            resizeMode="cover"
          />
          {item.images.length > 1 && (
            <View style={postStyles.imgDots}>
              {item.images.map((_, i) => (
                <TouchableOpacity key={i} onPress={() => setImgIndex(i)} activeOpacity={0.7}>
                  <View style={[
                    postStyles.dot,
                    { backgroundColor: i === imgIndex ? theme.primary : theme.secondaryText + '50' }
                  ]} />
                </TouchableOpacity>
              ))}
            </View>
          )}
          {item.images.length > 1 && (
            <View style={postStyles.imgCounter}>
              <Text style={postStyles.imgCounterText}>{imgIndex + 1}/{item.images.length}</Text>
            </View>
          )}
        </View>
      )}

      {/* Caption */}
      {item.caption ? (
        <Text style={[postStyles.caption, { color: theme.text }]}>{item.caption}</Text>
      ) : null}

      {/* Actions */}
      <View style={[postStyles.actions, { borderTopColor: theme.border }]}>
        <TouchableOpacity style={postStyles.actionBtn} onPress={handleLikePress}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons
              name={item.liked ? 'heart' : 'heart-outline'}
              size={20}
              color={item.liked ? '#FF4B4B' : theme.secondaryText}
            />
          </Animated.View>
          <Text style={[postStyles.actionCount, { color: item.liked ? '#FF4B4B' : theme.secondaryText }]}>
            {item.likes}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionBtn} activeOpacity={0.6}>
          <Ionicons name="chatbubble-outline" size={20} color={theme.secondaryText} />
          <Text style={[postStyles.actionCount, { color: theme.secondaryText }]}>{item.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionBtn} activeOpacity={0.6}>
          <Ionicons name="share-social-outline" size={20} color={theme.secondaryText} />
        </TouchableOpacity>
        <TouchableOpacity style={postStyles.actionBtn} activeOpacity={0.6}>
          <Ionicons name="bookmark-outline" size={20} color={theme.secondaryText} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const postStyles = StyleSheet.create({
  card:        { marginBottom: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 2 }, shadowRadius: 8 },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  headerLeft:  { flexDirection: 'row', alignItems: 'center', flex: 1 },
  userName:    { fontWeight: '600', fontSize: 13 },
  meta:        { fontSize: 12, marginTop: 3, fontWeight: '500' },
  ownBadge:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1.5 },
  ownText:     { fontSize: 10, fontWeight: '700' },
  imgWrap:     { position: 'relative' },
  imgDots:     { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 },
  dot:         { width: 6, height: 6, borderRadius: 3 },
  imgCounter:  { position: 'absolute', top: 10, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  imgCounterText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  caption:     { paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, lineHeight: 18 },
  actions:     { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 10, borderTopWidth: 0.5, gap: 0 },
  actionBtn:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  actionCount: { fontSize: 12, fontWeight: '500' },
});

const FeedScreen = ({ navigation }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { width } = useWindowDimensions();
  const skeletonImageWidth = width - 32;

  const [posts, setPosts]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modal, setModal]           = useState(false);
  const [selImages, setSelImages]   = useState([]);
  const [caption, setCaption]       = useState('');
  const [posting, setPosting]       = useState(false);
  const [postError, setPostError]   = useState('');
  const [activeTab, setActiveTab]   = useState('feed');

  useFocusEffect(
    useCallback(() => {
      if (posts.length === 0) loadFeed();
    }, [])
  );

  const loadFeed = async () => {
    try {
      setLoading(true);
      setPostError('');
      const data = await apiFetchFeedPosts();
      setPosts(data);
    } catch (err) {
      setPostError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      const data = await apiFetchFeedPosts();
      setPosts(data);
    } catch {
      setPostError('Failed to refresh feed.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLike = async (id) => {
    // Optimistic update
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
    ));
    try {
      await apiToggleLike(id);
    } catch {
      // Revert on error
      setPosts(prev => prev.map(p =>
        p.id === id ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p
      ));
    }
  };

  const pickImages = () => {
    launchImageLibrary({ selectionLimit: 5, mediaType: 'photo', quality: 0.85 }, (res) => {
      if (res.assets?.length) setSelImages(res.assets.map(a => a.uri));
    });
  };

  const submitPost = async () => {
    setPostError('');
    if (selImages.length === 0) {
      setPostError('Please select at least one photo.');
      return;
    }
    if (!caption.trim()) {
      setPostError('Please add a caption.');
      return;
    }
    try {
      setPosting(true);
      const newPost = await apiCreatePost({ images: selImages, caption: caption.trim() });
      setPosts(prev => [newPost, ...prev]);
      setModal(false);
      setSelImages([]);
      setCaption('');
      Alert.alert('Success', 'Your post has been shared with the community!', [{ text: 'OK' }]);
    } catch (err) {
      setPostError(err.message || 'Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const myPosts = Array.isArray(posts) ? posts.filter(p => p && p.isOwn) : [];
  const feedData = activeTab === 'mine' ? myPosts : (Array.isArray(posts) ? posts : []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Feed</Text>
          <Text style={[styles.sub, { color: theme.secondaryText }]}>
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.newPostBtn, { backgroundColor: theme.primary }]}
          onPress={() => setModal(true)}
          activeOpacity={0.75}
        >
          <Ionicons name="add" size={18} color="#141414" />
          <Text style={styles.newPostText}>Post</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: theme.border }]}>
        {['feed', 'mine'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
            ]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === tab ? theme.primary : theme.secondaryText }
            ]}>
              {tab === 'feed' ? 'Community' : `My Posts (${myPosts.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ScrollView contentContainerStyle={{ paddingTop: 20 }}>
          {[1, 2].map(i => (
            <View key={i} style={[styles.skeletonCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10 }}>
                <Skeleton style={{ width: 44, height: 44, borderRadius: 22 }} />
                <View style={{ gap: 6, flex: 1 }}>
                  <Skeleton style={{ width: '60%', height: 12 }} />
                  <Skeleton style={{ width: '40%', height: 10 }} />
                </View>
              </View>
              <Skeleton style={{ width: skeletonImageWidth, height: skeletonImageWidth * 0.75, marginHorizontal: 16, borderRadius: 12, marginBottom: 14 }} />
              <Skeleton style={{ width: '70%', height: 12, marginHorizontal: 14, marginBottom: 14 }} />
            </View>
          ))}
        </ScrollView>
      ) : postError && feedData.length === 0 ? (
        <ScrollView
          contentContainerStyle={styles.errorContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          <Ionicons name="warning-outline" size={52} color={theme.secondaryText} />
          <Text style={[styles.errorTitle, { color: theme.text }]}>Unable to Load Feed</Text>
          <Text style={[styles.errorMsg, { color: theme.secondaryText }]}>{postError}</Text>
          <TouchableOpacity
            style={[styles.retryBtn, { backgroundColor: theme.primary }]}
            onPress={loadFeed}
          >
            <Text style={styles.retryBtnText}>Try Again</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : feedData.length === 0 && activeTab === 'mine' ? (
        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          <Ionicons name="image" size={52} color={theme.secondaryText} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No Posts Yet</Text>
          <Text style={[styles.emptySub, { color: theme.secondaryText }]}>
            Share your first outfit with the community
          </Text>
          <TouchableOpacity style={[styles.postBtn, { backgroundColor: theme.primary }]} onPress={() => setModal(true)}>
            <Text style={styles.postBtnText}>Create Post</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <FlatList
          data={feedData.filter(item => item && item.id)}
          keyExtractor={(item, index) => item?.id ? String(item.id) : String(index)}
          renderItem={({ item }) => item ? <PostCard item={item} theme={theme} onLike={handleLike} /> : null}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 120, paddingHorizontal: 16 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        />
      )}

      {/* Create Post Modal */}
      <Modal visible={modal} animationType="slide" transparent onRequestClose={() => !posting && setModal(false)}>
        <View style={[styles.modalOverlay]}>
          <View style={[styles.modalBox, { backgroundColor: theme.background }]}>
            {/* Modal header */}
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <TouchableOpacity onPress={() => !posting && setModal(false)} activeOpacity={0.7}>
                <Ionicons name="close" size={24} color={theme.text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Create Post</Text>
              <TouchableOpacity
                onPress={submitPost}
                disabled={posting}
                style={[styles.shareBtn, { backgroundColor: theme.primary, opacity: posting ? 0.7 : 1 }]}
              >
                {posting ? (
                  <ActivityIndicator size="small" color="#141414" />
                ) : (
                  <Text style={styles.shareBtnText}>Share</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16, flex: 1 }} showsVerticalScrollIndicator={false}>
              {/* Image picker */}
              <TouchableOpacity
                style={[styles.imgPickerBox, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={pickImages}
                disabled={posting}
                activeOpacity={0.75}
              >
                {selImages.length === 0 ? (
                  <View style={styles.imgPickerPlaceholder}>
                    <Ionicons name="image" size={40} color={theme.secondaryText} />
                    <Text style={[styles.imgPickerLabel, { color: theme.text }]}>Select Photos</Text>
                    <Text style={[styles.imgPickerSub, { color: theme.secondaryText }]}>Up to 5 images</Text>
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ padding: 10 }}>
                    {selImages.map((uri, i) => (
                      <View key={i} style={{ marginRight: 8, position: 'relative' }}>
                        <Image source={{ uri }} style={styles.previewImg} />
                        {i === 0 && (
                          <View style={[styles.mainBadge, { backgroundColor: theme.primary }]}>
                            <Text style={styles.mainBadgeText}>Cover</Text>
                          </View>
                        )}
                      </View>
                    ))}
                    <TouchableOpacity
                      style={[styles.addMoreBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
                      onPress={pickImages}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="add" size={24} color={theme.secondaryText} />
                    </TouchableOpacity>
                  </ScrollView>
                )}
              </TouchableOpacity>

              {/* Caption */}
              <TextInput
                style={[styles.captionInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
                placeholder="Write a caption..."
                placeholderTextColor={theme.secondaryText}
                multiline
                value={caption}
                onChangeText={(t) => { setCaption(t); setPostError(''); }}
                editable={!posting}
              />

              {/* Uploading state */}
              {posting && (
                <View style={[styles.uploadingBanner, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}>
                  <ActivityIndicator size="small" color={theme.primary} />
                  <Text style={[styles.uploadingText, { color: theme.text }]}>Publishing your post...</Text>
                </View>
              )}

              {/* Error message */}
              {postError ? (
                <View style={[styles.modalError, { backgroundColor: '#FF4B4B15', borderColor: '#FF4B4B' }]}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FF4B4B" />
                  <Text style={styles.modalErrorText}>{postError}</Text>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default FeedScreen;

const styles = StyleSheet.create({
  container:          { flex: 1, paddingHorizontal: 0 },
  header:             { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, paddingTop: 10 },
  title:              { fontSize: 26, fontWeight: '700' },
  sub:                { fontSize: 13, marginTop: 2, fontWeight: '500' },
  newPostBtn:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 50, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  newPostText:        { color: '#141414', fontWeight: '700', fontSize: 13 },
  tabs:               { flexDirection: 'row', paddingHorizontal: 20, borderBottomWidth: 1, paddingBottom: 0 },
  tab:                { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabText:            { fontSize: 14, fontWeight: '600' },
  skeletonCard:       { marginHorizontal: 16, marginBottom: 16, borderRadius: 16, borderWidth: 0.5, overflow: 'hidden' },
  errorContainer:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingHorizontal: 30, paddingBottom: 100 },
  errorTitle:         { fontSize: 18, fontWeight: '700', marginTop: 12 },
  errorMsg:           { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryBtn:           { paddingHorizontal: 32, paddingVertical: 10, borderRadius: 50, marginTop: 8 },
  retryBtnText:       { color: '#141414', fontWeight: '700', fontSize: 14 },
  emptyContainer:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 30, paddingBottom: 100 },
  emptyTitle:         { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptySub:           { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  postBtn:            { paddingHorizontal: 28, paddingVertical: 10, borderRadius: 50, marginTop: 16 },
  postBtnText:        { color: '#141414', fontWeight: '700', fontSize: 14 },
  modalOverlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBox:           { borderTopLeftRadius: 24, borderTopRightRadius: 24, flex: 1, marginTop: 'auto', maxHeight: '90%' },
  modalHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 0.5 },
  modalTitle:         { fontSize: 16, fontWeight: '700' },
  shareBtn:           { paddingHorizontal: 18, paddingVertical: 6, borderRadius: 50, minWidth: 56, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 1 }, shadowRadius: 3 },
  shareBtnText:       { color: '#141414', fontWeight: '700', fontSize: 13 },
  imgPickerBox:       { height: 180, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', overflow: 'hidden', marginBottom: 16 },
  imgPickerPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  imgPickerLabel:     { fontSize: 15, fontWeight: '700' },
  imgPickerSub:       { fontSize: 12, fontWeight: '500' },
  previewImg:         { width: 110, height: 140, borderRadius: 12, resizeMode: 'cover' },
  mainBadge:          { position: 'absolute', bottom: 6, left: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  mainBadgeText:      { color: '#141414', fontSize: 9, fontWeight: '700' },
  addMoreBtn:         { width: 110, height: 140, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  captionInput:       { borderRadius: 14, borderWidth: 1, padding: 14, minHeight: 100, fontSize: 14, textAlignVertical: 'top', marginBottom: 14 },
  uploadingBanner:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  uploadingText:      { fontSize: 13, fontWeight: '600' },
  modalError:         { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginTop: 4 },
  modalErrorText:     { color: '#FF4B4B', fontSize: 12, flex: 1, fontWeight: '500' },
});