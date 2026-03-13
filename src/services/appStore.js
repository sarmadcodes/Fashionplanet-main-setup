// ─────────────────────────────────────────────────────────────
// appStore.js  — Fashion Planet In-Memory Store (WITH PERSISTENCE)
// Single source of truth. Persists to AsyncStorage for durability.
// ─────────────────────────────────────────────────────────────

import AsyncStorage from '@react-native-async-storage/async-storage';

// ── Auth ──────────────────────────────────────────────────────
export const FIXED_CREDENTIALS = {
  email: 'deskworksolution@gmail.com',
  password: 'deskworksol123',
};

export const DEFAULT_USER = {
  id: 'u_001',
  fullName: 'Desk Work Solutions',
  username: 'deskworksolutions',
  bio: 'Fashion is my language. Building the future of style.',
  website: 'https://deskworksolutions.com',
  avatar: null, // null = show initials avatar
  points: 850,
  itemsCount: 0,
  outfitsCount: 8,
  savedCount: 6,
};

// ── Storage Keys ──────────────────────────────────────────────
const STORAGE_KEYS = {
  FEED_POSTS: '@fashionplanet_feed_posts',
  MY_POSTS: '@fashionplanet_my_posts',
  SAVED_POSTS: '@fashionplanet_saved_posts',
  NOTIFICATIONS: '@fashionplanet_notifications',
};

// ── Mutable state ─────────────────────────────────────────────
let _user = { ...DEFAULT_USER };
let _wardrobeItems = [];        // starts empty — user uploads their own
let _feedPosts = [];            // ONLY user-uploaded posts (NO SEED)
let _myPosts = [];
let _savedPosts = [];           // saved post IDs
let _notifications = [];        // notifications array
let _isInitialized = false;
let _storeUserId = 'guest';

const getScopedStorageKey = (baseKey) => `${baseKey}:${_storeUserId}`;

// ── Wardrobe ──────────────────────────────────────────────────
export const getWardrobeItems = () => _wardrobeItems;

export const addWardrobeItem = (item) => {
  const newItem = {
    ...item,
    id: 'w_' + Date.now(),
    createdAt: new Date().toISOString(),
  };
  _wardrobeItems = [newItem, ..._wardrobeItems];
  _user.itemsCount = _wardrobeItems.length;
  return newItem;
};

export const deleteWardrobeItem = (id) => {
  _wardrobeItems = _wardrobeItems.filter(i => i.id !== id);
  _user.itemsCount = _wardrobeItems.length;
};

// ── Feed ──────────────────────────────────────────────────────
export const getFeedPosts = () => _feedPosts;
export const getMyPosts   = () => _myPosts;

export const addPost = (post) => {
  const newPost = {
    ...post,
    id: 'p_' + Date.now(),
    userName: _user.fullName,
    username: _user.username,
    avatar: _user.avatar,
    date: 'Just now',
    likes: 0,
    comments: 0,
    liked: false,
    isOwn: true,
    commentsList: [],
  };
  _feedPosts = [newPost, ..._feedPosts];
  _myPosts   = [newPost, ..._myPosts];
  
  // Persist asynchronously (fire and forget)
  persistFeedPosts();
  persistMyPosts();
  
  return newPost;
};

export const togglePostLike = (postId) => {
  let updatedPost = null;
  _feedPosts = _feedPosts.map((p) => {
    if (p.id !== postId) return p;

    const nextLiked = !p.liked;
    const nextPost = { ...p, liked: nextLiked, likes: nextLiked ? p.likes + 1 : p.likes - 1 };
    updatedPost = nextPost;

    // Local notification fallback for likes on other users' posts.
    if (nextLiked && !p.isOwn) {
      _notifications.unshift({
        id: 'n_' + Date.now(),
        type: 'like',
        user: _user.fullName,
        action: 'liked your post',
        postId,
        read: false,
        timestamp: new Date().toISOString(),
      });
    }

    return nextPost;
  });
  
  // Persist asynchronously
  persistFeedPosts();
  persistNotifications();
  
  return updatedPost;
};

export const addPostComment = (postId, text) => {
  const post = _feedPosts.find(p => p.id === postId);
  if (post) {
    post.comments = (post.comments || 0) + 1;
    if (!post.commentsList) post.commentsList = [];
    post.commentsList.push({
      id: 'c_' + Date.now(),
      author: _user.fullName,
      username: _user.username,
      avatar: _user.avatar,
      text,
      timestamp: 'Just now',
    });
    // Add notification if not own post
    if (!post.isOwn) {
      _notifications.unshift({
        id: 'n_' + Date.now(),
        type: 'comment',
        user: _user.fullName,
        action: 'commented on your post',
        postId,
        read: false,
        timestamp: new Date(),
      });
    }
  }
  
  // Persist asynchronously
  persistFeedPosts();
  persistNotifications();
  
  return post?.commentsList || [];
};

export const togglePostSave = (postId) => {
  const index = _savedPosts.indexOf(postId);
  if (index > -1) {
    _savedPosts.splice(index, 1);
  } else {
    _savedPosts.push(postId);
  }
  
  // Persist asynchronously
  try {
    AsyncStorage.setItem(getScopedStorageKey(STORAGE_KEYS.SAVED_POSTS), JSON.stringify(_savedPosts));
  } catch (err) {
    console.warn('Failed to persist saved posts:', err);
  }
  
  return _savedPosts.includes(postId);
};

export const getSavedPosts = () => {
  return _feedPosts.filter(p => _savedPosts.includes(p.id));
};

export const getNotifications = () => {
  return _notifications;
};

export const markNotificationRead = (notificationId) => {
  const notif = _notifications.find(n => n.id === notificationId);
  if (notif) notif.read = true;
  persistNotifications();
  return notif;
};

export const syncFeedPosts = (incomingPosts = []) => {
  const localPosts = Array.isArray(_feedPosts) ? _feedPosts : [];
  const remotePosts = Array.isArray(incomingPosts) ? incomingPosts : [];

  const map = new Map();

  // Keep local posts first so user-created unsynced posts are never dropped on refresh.
  localPosts.forEach((p) => {
    if (p && p.id) map.set(String(p.id), p);
  });

  remotePosts.forEach((p) => {
    if (!p || !p.id) return;
    const key = String(p.id);
    const existing = map.get(key);
    map.set(key, existing ? { ...p, ...existing } : p);
  });

  _feedPosts = Array.from(map.values());
  _myPosts = _feedPosts.filter((p) => p?.isOwn);

  persistFeedPosts();
  persistMyPosts();

  return _feedPosts;
};

export const updateLocalPost = (postId, updates = {}) => {
  _feedPosts = _feedPosts.map((p) =>
    p?.id === postId ? { ...p, ...updates } : p
  );
  _myPosts = _myPosts.map((p) =>
    p?.id === postId ? { ...p, ...updates } : p
  );
  persistFeedPosts();
  persistMyPosts();
  return _feedPosts.find((p) => p?.id === postId) || null;
};

export const removeLocalPost = (postId) => {
  _feedPosts = _feedPosts.filter((p) => p?.id !== postId);
  _myPosts = _myPosts.filter((p) => p?.id !== postId);
  _savedPosts = _savedPosts.filter((id) => id !== postId);
  persistFeedPosts();
  persistMyPosts();
  try {
    AsyncStorage.setItem(getScopedStorageKey(STORAGE_KEYS.SAVED_POSTS), JSON.stringify(_savedPosts));
  } catch (err) {
    console.warn('Failed to persist saved posts:', err);
  }
};

export const replaceLocalPostId = (oldId, newPost) => {
  if (!oldId || !newPost?.id) return;

  _feedPosts = _feedPosts.map((p) =>
    p?.id === oldId ? { ...p, ...newPost } : p
  );
  _myPosts = _myPosts.map((p) =>
    p?.id === oldId ? { ...p, ...newPost } : p
  );
  _savedPosts = _savedPosts.map((id) => (id === oldId ? newPost.id : id));

  persistFeedPosts();
  persistMyPosts();
  try {
    AsyncStorage.setItem(getScopedStorageKey(STORAGE_KEYS.SAVED_POSTS), JSON.stringify(_savedPosts));
  } catch (err) {
    console.warn('Failed to persist saved posts:', err);
  }
};

// ── Profile ───────────────────────────────────────────────────
export const getUser = () => ({ ..._user });

export const updateUser = (data) => {
  _user = { ..._user, ...data };
  return { ..._user };
};

// ── Seed feed data ────────────────────────────────────────────
export const SEED_POSTS = [
  {
    id: 'seed_1',
    userName: 'Sophia Lee',
    username: '@sophialee',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
    date: '2 min ago',
    images: ['https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg'],
    caption: 'Spring vibes are everything right now. Loving this look for the season.',
    likes: 124,
    comments: 18,
    liked: false,
    isOwn: false,
  },
  {
    id: 'seed_2',
    userName: 'Liam Chen',
    username: '@liamchen',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
    date: '18 min ago',
    images: [
      'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg',
      'https://images.pexels.com/photos/1030894/pexels-photo-1030894.jpeg',
    ],
    caption: 'Layering season is my favourite. Bold textures, clean silhouette.',
    likes: 89,
    comments: 22,
    liked: false,
    isOwn: false,
  },
  {
    id: 'seed_3',
    userName: 'Emma Watson',
    username: '@emmaw',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg',
    date: '1 hr ago',
    images: ['https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg'],
    caption: 'Minimal weekend energy. Sometimes less really is more.',
    likes: 56,
    comments: 9,
    liked: false,
    isOwn: false,
  },
  {
    id: 'seed_4',
    userName: 'Noah Brown',
    username: '@noahb',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
    date: '3 hr ago',
    images: [
      'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg',
      'https://images.pexels.com/photos/2802039/pexels-photo-2802039.jpeg',
    ],
    caption: 'Streetwear never goes out of style. Denim on denim hits different.',
    likes: 203,
    comments: 31,
    liked: false,
    isOwn: false,
  },
  {
    id: 'seed_5',
    userName: 'Olivia Johnson',
    username: '@oliviaj',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
    date: '5 hr ago',
    images: ['https://images.pexels.com/photos/2908218/pexels-photo-2908218.jpeg'],
    caption: 'Earth tones are dominating my wardrobe and I am not sorry at all.',
    likes: 341,
    comments: 47,
    liked: false,
    isOwn: false,
  },
];

// ── Persistence Functions ─────────────────────────────────────
/**
 * Initialize store from AsyncStorage on app start
 * Loads all persisted data used by feed/profile/notifications
 */
export const initializeStore = async () => {
  try {
    if (_isInitialized) return; // Don't re-initialize

    const [sessionStr, authUserId] = await Promise.all([
      AsyncStorage.getItem('user_session'),
      AsyncStorage.getItem('auth_user_id'),
    ]);

    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        _user = { ...DEFAULT_USER, ...session };
        _storeUserId = authUserId || session?.id || session?._id || 'guest';
      } catch {
        _storeUserId = authUserId || 'guest';
      }
    } else {
      _storeUserId = authUserId || 'guest';
    }

    const [savedFeedPosts, savedMyPosts, savedSavedPosts, savedNotifications] = await Promise.all([
      AsyncStorage.getItem(getScopedStorageKey(STORAGE_KEYS.FEED_POSTS)),
      AsyncStorage.getItem(getScopedStorageKey(STORAGE_KEYS.MY_POSTS)),
      AsyncStorage.getItem(getScopedStorageKey(STORAGE_KEYS.SAVED_POSTS)),
      AsyncStorage.getItem(getScopedStorageKey(STORAGE_KEYS.NOTIFICATIONS)),
    ]);

    // Load feed posts (only user-uploaded, no defaults)
    if (savedFeedPosts) {
      try {
        _feedPosts = JSON.parse(savedFeedPosts);
      } catch (e) {
        console.warn('Failed to parse saved feed posts');
        _feedPosts = [];
      }
    } else {
      _feedPosts = [];
    }

    // Load user's posts
    if (savedMyPosts) {
      try {
        _myPosts = JSON.parse(savedMyPosts);
      } catch (e) {
        console.warn('Failed to parse saved my posts');
        _myPosts = [];
      }
    }

    if (savedSavedPosts) {
      try {
        _savedPosts = JSON.parse(savedSavedPosts);
      } catch (e) {
        console.warn('Failed to parse saved post ids');
        _savedPosts = [];
      }
    }

    // Load notifications
    if (savedNotifications) {
      try {
        _notifications = JSON.parse(savedNotifications);
      } catch (e) {
        console.warn('Failed to parse saved notifications');
        _notifications = [];
      }
    }

    _isInitialized = true;
    console.log('✅ Store initialized from AsyncStorage');
  } catch (err) {
    console.error('Failed to initialize store:', err);
    _isInitialized = true; // Mark as initialized anyway
  }
};

export const setActiveStoreUser = async (user = null) => {
  const nextUserId = user?.id || user?._id || 'guest';
  if (_storeUserId === nextUserId && _isInitialized) {
    _user = user ? { ...DEFAULT_USER, ...user } : { ...DEFAULT_USER };
    return;
  }

  _storeUserId = nextUserId;
  _isInitialized = false;
  _user = user ? { ...DEFAULT_USER, ...user } : { ...DEFAULT_USER };
  _feedPosts = [];
  _myPosts = [];
  _savedPosts = [];
  _notifications = [];

  await initializeStore();
};

/**
 * Persist feed posts to AsyncStorage
 */
const persistFeedPosts = async () => {
  try {
    await AsyncStorage.setItem(getScopedStorageKey(STORAGE_KEYS.FEED_POSTS), JSON.stringify(_feedPosts));
  } catch (err) {
    console.warn('Failed to persist feed posts:', err);
  }
};

/**
 * Persist user's posts to AsyncStorage
 */
const persistMyPosts = async () => {
  try {
    await AsyncStorage.setItem(getScopedStorageKey(STORAGE_KEYS.MY_POSTS), JSON.stringify(_myPosts));
  } catch (err) {
    console.warn('Failed to persist my posts:', err);
  }
};

/**
 * Persist notifications to AsyncStorage
 */
const persistNotifications = async () => {
  try {
    await AsyncStorage.setItem(getScopedStorageKey(STORAGE_KEYS.NOTIFICATIONS), JSON.stringify(_notifications));
  } catch (err) {
    console.warn('Failed to persist notifications:', err);
  }
};