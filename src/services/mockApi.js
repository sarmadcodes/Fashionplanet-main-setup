// ─────────────────────────────────────────────────────────────
// mockApi.js  — Fashion Planet API Service (PROFESSIONAL VERSION)
// All calls go through here. Swap bodies for real API later.
// ─────────────────────────────────────────────────────────────

import {
  addPost,
  togglePostLike,
  addPostComment,
  togglePostSave,
  getSavedPosts,
  getNotifications,
  markNotificationRead,
  syncFeedPosts,
  updateLocalPost,
  removeLocalPost,
  replaceLocalPostId,
} from './appStore';
import apiClient, { getActiveApiBaseUrl } from './apiClient';

const delay = () => Promise.resolve();

const getApiErrorMessage = (error, fallback) => {
  if (!error?.response) {
    return `${fallback} Cannot reach API at ${getActiveApiBaseUrl()}.`;
  }

  if (error.response.status === 401) {
    return 'Your session expired. Please log in again.';
  }

  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0]?.msg ||
    fallback
  );
};

const normalizeWardrobeItem = (item) => ({
  id: String(
    item.id ||
    item._id ||
    item.image ||
    `${item.name || 'item'}_${item.brand || 'brand'}_${item.createdAt || Date.now()}`
  ),
  name: item.name,
  brand: item.brand,
  category: item.category,
  color: item.color,
  season: item.season,
  worth: Number(item.worth) || 0,
  image: item.image,
  wearCount: item.wearCount || 0,
  createdAt: item.createdAt,
  title: item.name,
  subtitle: item.brand || item.category,
});

const normalizePost = (post) => {
  if (!post) return null;
  const id = post.id || post._id;
  if (!id) return null;

  const images = Array.isArray(post.images)
    ? post.images
    : post.image
      ? [post.image?.uri || post.image]
      : [];

  return {
    ...post,
    id: String(id),
    userName: post.userName || post.user || 'Unknown User',
    username: post.username || post.handle || '@user',
    caption: post.caption || '',
    images,
    likes: Number(post.likes) || 0,
    comments: Number(post.comments) || 0,
    commentsList: Array.isArray(post.commentsList) ? post.commentsList : [],
    liked: Boolean(post.liked),
    saved: Boolean(post.saved),
  };
};

const isMongoObjectId = (id) => typeof id === 'string' && /^[a-fA-F0-9]{24}$/.test(id);

// ── AUTH ──────────────────────────────────────────────────────

export const apiLogin = async ({ email, password }) => {
  const e = email.trim().toLowerCase();
  const p = password;
  if (!e || !p) throw new Error('Please enter your email and password.');
  try {
    const { data } = await apiClient.post('/auth/login', { email: e, password: p });
    return data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.[0]?.msg ||
      'Login failed. Please try again.';
    throw new Error(message);
  }
};

export const apiSignup = async ({ fullName, email, password }) => {
  if (!fullName?.trim()) throw new Error('Full name is required.');
  if (!email?.trim()) throw new Error('Email address is required.');
  if (!password || password.length < 6)
    throw new Error('Password must be at least 6 characters.');
  try {
    const { data } = await apiClient.post('/auth/register', {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
    });
    return data;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.errors?.[0]?.msg ||
      'Registration failed. Please try again.';
    throw new Error(message);
  }
};

// ── PROFILE ───────────────────────────────────────────────────

export const apiFetchProfile = async () => {
  try {
    const { data } = await apiClient.get('/profile');
    return data.user;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      'Unable to fetch profile right now.';
    throw new Error(message);
  }
};

export const apiUpdateProfile = async (data) => {
  try {
    const formData = new FormData();
    formData.append('fullName', data.fullName || '');
    formData.append('username', data.username || '');
    formData.append('bio', data.bio || '');
    formData.append('website', data.website || '');

    if (data.avatar?.startsWith?.('http')) {
      formData.append('avatar', data.avatar);
    } else if (data.avatar) {
      formData.append('avatar', {
        uri: data.avatar,
        type: 'image/jpeg',
        name: `avatar_${Date.now()}.jpg`,
      });
    }

    const { data: response } = await apiClient.patch('/profile', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.user;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not update profile.'));
  }
};

// ── WARDROBE ──────────────────────────────────────────────────

export const apiFetchWardrobeItems = async (filter = 'All') => {
  try {
    const { data } = await apiClient.get('/wardrobe');
    const items = (data.items || []).map(normalizeWardrobeItem);
    if (filter === 'All') return items;
    return items.filter((i) => i.category === filter);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load wardrobe items.'));
  }
};

export const apiAddWardrobeItem = async (item) => {
  if (!item.name?.trim()) throw new Error('Item name is required.');
  if (!item.category) throw new Error('Please select a category.');
  try {
    const formData = new FormData();
    formData.append('name', item.name.trim());
    formData.append('brand', item.brand?.trim() || '');
    formData.append('category', item.category);
    formData.append('color', item.color || '');
    formData.append('season', item.season || 'All Season');
    formData.append('worth', String(Number(item.worth) || 0));

    if (item.image?.startsWith('http')) {
      formData.append('image', item.image);
    } else if (item.image) {
      formData.append('image', {
        uri: item.image,
        type: 'image/jpeg',
        name: `wardrobe_${Date.now()}.jpg`,
      });
    }

    const { data } = await apiClient.post('/wardrobe', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return normalizeWardrobeItem(data.item);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not add wardrobe item.'));
  }
};

export const apiUpdateWardrobeItem = async (id, item) => {
  if (!item.name?.trim()) throw new Error('Item name is required.');
  if (!item.category) throw new Error('Please select a category.');

  try {
    const formData = new FormData();
    formData.append('name', item.name.trim());
    formData.append('brand', item.brand?.trim() || '');
    formData.append('category', item.category);
    formData.append('color', item.color || '');
    formData.append('season', item.season || 'All Season');
    formData.append('worth', String(Number(item.worth) || 0));

    if (item.image?.startsWith('http')) {
      formData.append('image', item.image);
    } else if (item.image) {
      formData.append('image', {
        uri: item.image,
        type: 'image/jpeg',
        name: `wardrobe_${Date.now()}.jpg`,
      });
    }

    const { data } = await apiClient.patch(`/wardrobe/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return normalizeWardrobeItem(data.item);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not update item.'));
  }
};

export const apiDeleteWardrobeItem = async (id) => {
  try {
    const { data } = await apiClient.delete(`/wardrobe/${id}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not delete item.'));
  }
};

// ── FEED ──────────────────────────────────────────────────────

export const apiFetchFeedPosts = async () => {
  try {
    const { data } = await apiClient.get('/posts/feed');
    const remote = (data?.data || []).map(normalizePost).filter(Boolean);
    return syncFeedPosts(remote);
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Unable to load community feed.'));
  }
};

export const apiFetchMyPosts = async () => {
  try {
    const { data } = await apiClient.get('/posts/my');
    return (data?.data || []).map(normalizePost).filter(Boolean);
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Unable to load your posts.'));
  }
};

export const apiCreatePost = async ({ images, caption }) => {
  if (!images || images.length === 0)
    throw new Error('Please select at least one image.');
  if (!caption?.trim())
    throw new Error('Please add a caption.');

  // Always create local first so post appears instantly and survives refresh.
  const localPost = addPost({ images, caption: caption.trim() });

  try {
    const formData = new FormData();
    formData.append('caption', caption.trim());

    images.forEach((imageUri, index) => {
      if (!imageUri) return;

      if (String(imageUri).startsWith('http')) {
        formData.append('images', imageUri);
      } else {
        formData.append('images', {
          uri: imageUri,
          type: 'image/jpeg',
          name: `post_${Date.now()}_${index}.jpg`,
        });
      }
    });

    const { data } = await apiClient.post('/posts/create', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const created = normalizePost(data?.data);
    if (created?.id) {
      replaceLocalPostId(localPost.id, created);
      return created;
    }
    throw new Error('Post upload response was invalid');
  } catch (err) {
    // Roll back optimistic local post if backend create fails to avoid account-local ghost posts.
    removeLocalPost(localPost.id);
    throw new Error(getApiErrorMessage(err, 'Failed to publish post.'));
  }
};

export const apiToggleLike = async (postId) => {
  if (!isMongoObjectId(String(postId))) {
    await delay(200);
    return togglePostLike(postId);
  }
  try {
    const { data } = await apiClient.post(`/posts/${postId}/like`);
    return data?.data || {};
  } catch (err) {
    await delay(400);
    return togglePostLike(postId);
  }
};

export const apiAddComment = async (postId, text) => {
  if (!text?.trim()) throw new Error('Comment cannot be empty');
  if (!isMongoObjectId(String(postId))) {
    await delay(200);
    return addPostComment(postId, text.trim());
  }
  
  try {
    const { data } = await apiClient.post(`/posts/${postId}/comment`, { text: text.trim() });
    return data?.data?.comment || {};
  } catch (err) {
    await delay(300);
    return addPostComment(postId, text.trim());
  }
};

export const apiToggleSavePost = async (postId) => {
  if (!isMongoObjectId(String(postId))) {
    await delay(150);
    return togglePostSave(postId);
  }
  try {
    const { data } = await apiClient.post(`/posts/${postId}/save`);
    return data?.isSaved || false;
  } catch (err) {
    await delay(300);
    return togglePostSave(postId);
  }
};

export const apiFetchSavedPosts = async () => {
  try {
    const { data } = await apiClient.get('/posts/saved');
    return data?.data || [];
  } catch (err) {
    await delay(800);
    return getSavedPosts();
  }
};

export const apiFetchNotifications = async () => {
  try {
    const { data } = await apiClient.get('/posts/notifications');
    return data?.data || [];
  } catch (err) {
    await delay(600);
    return getNotifications();
  }
};

export const apiMarkNotificationAsRead = async (notificationId) => {
  try {
    const { data } = await apiClient.put(`/posts/notification/${notificationId}/read`);
    return data?.data;
  } catch (err) {
    await delay(200);
    return markNotificationRead(notificationId);
  }
};

// ── AI / OUTFIT GENERATION ────────────────────────────────────

const AI_OUTFITS = {
  Casual: {
    Sunny: { title: 'Casual Sunny Look',    items: ['White Linen Shirt', 'Light Chinos', 'Clean White Sneakers'],              missing: 'Canvas Tote Bag',       retailer: 'Zara'  },
    Rainy: { title: 'Casual Rainy Day',     items: ['Oversized Hoodie', 'Waterproof Joggers', 'Ankle Boots'],                  missing: 'Compact Umbrella',      retailer: 'H&M'   },
    Cold:  { title: 'Cosy Casual Winter',   items: ['Chunky Knit Sweater', 'Dark Slim Jeans', 'Chelsea Boots'],                missing: 'Wool Scarf',            retailer: 'M&S'   },
  },
  Business: {
    Sunny: { title: 'Power Summer Office',  items: ['Tailored Blazer', 'White Dress Shirt', 'Slim Fit Trousers', 'Oxford Shoes'], missing: 'Leather Belt',        retailer: 'M&S'   },
    Rainy: { title: 'Sharp Rainy Office',   items: ['Wool Overcoat', 'Navy Suit', 'Dress Shoes'],                               missing: 'Leather Briefcase',     retailer: 'Next'  },
    Cold:  { title: 'Winter Business',      items: ['Double Breasted Suit', 'Turtleneck', 'Derby Shoes'],                       missing: 'Cashmere Overcoat',     retailer: 'Zara'  },
  },
  Party: {
    Sunny: { title: 'Day Party Glam',       items: ['Flowy Midi Dress', 'Strappy Sandals', 'Crossbody Bag'],                   missing: 'Gold Layered Necklace', retailer: 'ASOS'  },
    Rainy: { title: 'Indoor Party Look',    items: ['Satin Slip Dress', 'Block Heels', 'Clutch'],                               missing: 'Statement Earrings',    retailer: 'Zara'  },
    Cold:  { title: 'Winter Night Out',     items: ['Velvet Blazer', 'Straight Leg Trousers', 'Ankle Boots'],                   missing: 'Faux Fur Wrap',         retailer: 'H&M'   },
  },
  Weekend: {
    Sunny: { title: 'Weekend Brunch',       items: ['Linen Co-ord Set', 'Espadrilles', 'Wicker Bag'],                          missing: 'Sunglasses',            retailer: 'Mango' },
    Rainy: { title: 'Cosy Weekend',         items: ['Fleece Pullover', 'Wide Leg Joggers', 'Slip-on Sneakers'],                 missing: 'Beanie Hat',            retailer: 'Uniqlo'},
    Cold:  { title: 'Cold Weekend Casual',  items: ['Sherpa Jacket', 'Mom Jeans', 'White Trainers'],                           missing: 'Thermal Undershirt',    retailer: 'H&M'   },
  },
};

export const apiGenerateOutfit = async ({ mood, weather }) => {
  await delay(2500);
  const moodData = AI_OUTFITS[mood] || AI_OUTFITS['Casual'];
  return moodData[weather] || moodData['Sunny'];
};

export const apiFetchAiStats = async () => {
  await delay(1400);
  return { outfitsGenerated: 30, tryOns: 15, matchScore: 75 };
};

// ── REWARDS ───────────────────────────────────────────────────

export const apiFetchRewards = async () => {
  await delay(1300);
  return {
    points: 850,
    nextThreshold: 1000,
    history: [
      { id: 1, action: 'Uploaded outfit photo',   points: 20, date: '2 days ago'  },
      { id: 2, action: 'Post reached 10 likes',   points: 50, date: '3 days ago'  },
      { id: 3, action: 'Completed weekly plan',   points: 50, date: '5 days ago'  },
      { id: 4, action: 'Shared with a friend',    points: 30, date: '1 week ago'  },
      { id: 5, action: 'Added 5 wardrobe items',  points: 25, date: '1 week ago'  },
    ],
    activities: [
      { id: 1, title: 'Upload a daily outfit',      points: '+20', icon: 'camera'       },
      { id: 2, title: 'Complete your week plan',    points: '+50', icon: 'calendar'     },
      { id: 3, title: 'Share a look with friends',  points: '+30', icon: 'share-variant' },
      { id: 4, title: 'Reach 10 likes on a post',   points: '+40', icon: 'heart-outline'        },
    ],
  };
};

// ── VOUCHERS ──────────────────────────────────────────────────

export const apiFetchVouchers = async () => {
  await delay(1200);
  return [
    { id: 'v1', store: 'ZARA',  amount: '$20 OFF', code: 'ZARA-9921-X', expiry: 'Expires 30 Sep 2026', unlocked: true },
    { id: 'v2', store: 'M & S', amount: '15% OFF', code: 'MS-LUXE-22',  expiry: 'Expires 15 Nov 2026', unlocked: true },
    { id: 'v3', store: 'H&M',   amount: '$10 OFF', code: 'HM-SALE-00',  expiry: 'Expires 28 Feb 2027', unlocked: false, pointsRequired: 1200 },
  ];
};

export const apiFetchOutfits = async () => {
  try {
    const { data } = await apiClient.get('/outfits');
    return data.outfits || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load outfits.'));
  }
};

// ── INSIGHTS ──────────────────────────────────────────────────

export const apiFetchInsights = async () => {
  try {
    const { data } = await apiClient.get('/insights');
    return data.insights;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load insights.'));
  }
};

// ── WEEK PLAN ─────────────────────────────────────────────────

export const apiFetchWeekPlan = async () => {
  try {
    const { data } = await apiClient.get('/weekplan');
    return data.days || {};
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load week plan.'));
  }
};

export const apiToggleWeekPlanItem = async (day, itemId) => {
  try {
    const { data } = await apiClient.patch(`/weekplan/${day}/${itemId}/toggle`);
    return data.item;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to update week plan item.'));
  }
};

export const apiAddWeekPlanItem = async (day, item) => {
  try {
    const { data } = await apiClient.post(`/weekplan/${day}`, item);
    return data.item;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to add week plan item.'));
  }
};

// ── HOME DATA (for HomeScreen) ────────────────────────────────
export const apiFetchHomeData = async () => {
  try {
    const { data } = await apiClient.get('/home');
    return data.home;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load dashboard.'));
  }
};

export const apiUpdatePost = async (postId, payload) => {
  if (!postId) throw new Error('Post ID is required.');
  if (!isMongoObjectId(String(postId))) {
    await delay(150);
    return updateLocalPost(postId, { caption: payload?.caption ?? '' });
  }
  try {
    const { data } = await apiClient.patch(`/posts/${postId}`, payload);
    return normalizePost(data?.data);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not update post.'));
  }
};

export const apiDeletePost = async (postId) => {
  if (!postId) throw new Error('Post ID is required.');
  if (!isMongoObjectId(String(postId))) {
    await delay(150);
    removeLocalPost(postId);
    return { success: true, message: 'Post deleted locally' };
  }
  try {
    const { data } = await apiClient.delete(`/posts/${postId}`);
    removeLocalPost(postId);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not delete post.'));
  }
};