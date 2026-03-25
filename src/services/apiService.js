// ─────────────────────────────────────────────────────────────
// apiService.js  — Fashion Planet API Service (PROFESSIONAL VERSION)
// Backend-first service layer. Local store fallbacks are only used for
// temporary local entities that do not yet have backend IDs.
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

const toAbsoluteUrl = (value) => {
  if (typeof value !== 'string') return value;
  const raw = value.trim();
  if (!raw) return raw;

  if (/^(https?:|file:|content:|data:)/i.test(raw)) {
    return raw;
  }

  const apiBase = getActiveApiBaseUrl() || '';
  const hostBase = apiBase.replace(/\/api\/?$/i, '');
  const normalizedPath = raw.startsWith('/') ? raw : `/${raw}`;
  return `${hostBase}${normalizedPath}`;
};

const getApiErrorMessage = (error, fallback) => {
  if (error?.userMessage) {
    return error.userMessage;
  }

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
  image: toAbsoluteUrl(item.image),
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
    ? post.images.map(toAbsoluteUrl).filter(Boolean)
    : post.image
      ? [toAbsoluteUrl(post.image?.uri || post.image)].filter(Boolean)
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

export const apiSignup = async ({
  fullName,
  email,
  password,
  gender,
  sizeTop,
  sizeBottom,
  shoeSize,
  city,
  country,
  location,
  styleTypes,
}) => {
  if (!fullName?.trim()) throw new Error('Full name is required.');
  if (!email?.trim()) throw new Error('Email address is required.');
  if (!password || password.length < 6)
    throw new Error('Password must be at least 6 characters.');
  try {
    const { data } = await apiClient.post('/auth/register', {
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      password,
      gender: gender || 'prefer-not-to-say',
      sizeTop: sizeTop || '',
      sizeBottom: sizeBottom || '',
      shoeSize: shoeSize || '',
      city: city || '',
      country: country || '',
      location: location || null,
      styleTypes: Array.isArray(styleTypes) ? styleTypes : [],
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

export const apiDeleteAccount = async () => {
  try {
    const { data } = await apiClient.delete('/auth/delete');
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not delete account.'));
  }
};

// ── PROFILE ───────────────────────────────────────────────────

export const apiFetchProfile = async () => {
  try {
    const { data } = await apiClient.get('/profile');
    return {
      ...data.user,
      avatar: toAbsoluteUrl(data?.user?.avatar),
    };
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
    formData.append('gender', data.gender || 'prefer-not-to-say');
    formData.append('sizeTop', data.sizeTop || '');
    formData.append('sizeBottom', data.sizeBottom || '');
    formData.append('shoeSize', data.shoeSize || '');
    formData.append('city', data.city || '');
    formData.append('country', data.country || '');
    formData.append('locationLat', data.locationLat ?? '');
    formData.append('locationLon', data.locationLon ?? '');
    formData.append('locationLabel', data.locationLabel || '');
    formData.append('styleTypes', Array.isArray(data.styleTypes) ? data.styleTypes.join(',') : (data.styleTypes || ''));
    formData.append('onboardingCompleted', String(Boolean(data.onboardingCompleted ?? true)));

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
    return {
      ...response.user,
      avatar: toAbsoluteUrl(response?.user?.avatar),
    };
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
    return togglePostLike(postId);
  }
  try {
    const { data } = await apiClient.post(`/posts/${postId}/like`);
    return data?.data || {};
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not update like right now.'));
  }
};

export const apiAddComment = async (postId, text) => {
  if (!text?.trim()) throw new Error('Comment cannot be empty');
  if (!isMongoObjectId(String(postId))) {
    return addPostComment(postId, text.trim());
  }
  
  try {
    const { data } = await apiClient.post(`/posts/${postId}/comment`, { text: text.trim() });
    return data?.data?.comment || {};
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not add comment right now.'));
  }
};

export const apiToggleSavePost = async (postId) => {
  if (!isMongoObjectId(String(postId))) {
    return togglePostSave(postId);
  }
  try {
    const { data } = await apiClient.post(`/posts/${postId}/save`);
    return data?.isSaved || false;
  } catch (err) {
    throw new Error(getApiErrorMessage(err, 'Could not save post right now.'));
  }
};

export const apiFetchSavedPosts = async () => {
  try {
    const { data } = await apiClient.get('/posts/saved');
    return (data?.data || []).map(normalizePost).filter(Boolean);
  } catch (err) {
    await delay(800);
    return getSavedPosts().map(normalizePost).filter(Boolean);
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

const normalizeAiItem = (item) => ({
  id: String(item?.id || item?._id || ''),
  name: item?.name || 'Wardrobe item',
  category: item?.category || item?.tags?.category || 'item',
  image: item?.image || null,
  tags: item?.tags || {},
});

const toLegacyAiCardShape = (payload) => {
  const outfit = payload?.outfit || {};
  const detailItems = Array.isArray(outfit.itemDetails) ? outfit.itemDetails.map(normalizeAiItem) : [];
  const generatedImage = typeof payload?.generatedImage === 'string' ? payload.generatedImage.trim() : '';
  const firstImage = generatedImage || detailItems.find((i) => i.image)?.image || 'https://images.pexels.com/photos/298863/pexels-photo-298863.jpeg';
  const tips = Array.isArray(payload?.tips) ? payload.tips : [];
  const newSuggestion = outfit?.newSuggestion && typeof outfit.newSuggestion === 'object'
    ? {
      name: String(outfit.newSuggestion.name || '').trim(),
      category: String(outfit.newSuggestion.category || '').trim(),
      reason: String(outfit.newSuggestion.reason || '').trim(),
    }
    : null;

  return {
    generationId: payload?.generationId || null,
    savedOutfitId: payload?.savedOutfitId || null,
    source: payload?.source || 'ai',
    isFallback: Boolean(payload?.isFallback),
    fallbackReason: payload?.fallbackReason || null,
    fallbackNote: payload?.fallbackNote || null,
    title: outfit.styleTitle || 'AI Outfit',
    explanation: payload?.isFallback && payload?.fallbackNote
      ? `${outfit.explanation || 'Styled from your wardrobe.'} ${payload.fallbackNote}`
      : (outfit.explanation || 'Styled from your wardrobe.'),
    weatherNote: outfit.weatherNote || '',
    items: detailItems.map((i) => i.name),
    itemDetails: detailItems,
    tip: tips[0] || 'Try adding one subtle accessory to finish the look.',
    tips,
    newSuggestion,
    image: firstImage,
    missing: newSuggestion?.name || tips[1] || 'Add one complementary layer for more variety.',
    retailer: 'Recommended',
  };
};

export const apiGenerateOutfit = async ({ mood, weather, lat = 24.8607, lon = 67.0011, isPrefetch = false, forceFresh = false }) => {
  try {
    const { data } = await apiClient.post('/ai/generate-outfit', {
      occasion: mood || 'casual',
      preferredWeather: weather || null,
      lat,
      lon,
      isPrefetch,
      forceFresh,
    }, {
      timeout: 120000,
    });

    return toLegacyAiCardShape(data?.data || {});
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not generate outfit right now.'));
  }
};

export const apiGenerateStyleAvatar = async ({ styleTypes = [], forceFresh = false }) => {
  try {
    const { data } = await apiClient.post('/ai/generate-style-avatar', {
      styleTypes,
      forceFresh,
    }, {
      timeout: 120000,
    });

    const payload = data?.data || {};
    return {
      generationId: payload?.generationId || null,
      savedOutfitId: payload?.savedOutfitId || null,
      source: payload?.source || 'ai',
      title: payload?.title || 'Style Avatar',
      styleTypes: Array.isArray(payload?.styleTypes) ? payload.styleTypes : [],
      generatedImage: toAbsoluteUrl(payload?.generatedImage || null),
      cacheHit: Boolean(payload?.cacheHit),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not generate style avatar right now.'));
  }
};

export const apiLogOutfitFeedback = async ({ generationId, action }) => {
  if (!action) throw new Error('Feedback action is required.');
  try {
    const { data } = await apiClient.post('/ai/feedback', { generationId, action });
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not save feedback right now.'));
  }
};

export const apiFetchAiStats = async () => {
  try {
    const { data } = await apiClient.get('/ai/stats');
    return data?.data || { outfitsGenerated: 0, tryOns: 0, matchScore: 0 };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load AI stats.'));
  }
};

export const apiFetchWardrobeInsights = async () => {
  try {
    const { data } = await apiClient.post('/ai/wardrobe-insights');
    return data?.data || null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load wardrobe insights.'));
  }
};

// ── REWARDS ───────────────────────────────────────────────────

export const apiFetchRewards = async () => {
  try {
    const { data } = await apiClient.get('/rewards');
    return data?.rewards || {
      points: 0,
      nextThreshold: 500,
      history: [],
      activities: [],
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load rewards.'));
  }
};

// ── VOUCHERS ──────────────────────────────────────────────────

export const apiFetchVouchers = async () => {
  try {
    const { data } = await apiClient.get('/vouchers');
    return data?.vouchers || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load vouchers.'));
  }
};

export const apiRedeemVoucher = async (voucherId) => {
  if (!voucherId) throw new Error('Voucher id is required.');
  try {
    const { data } = await apiClient.post(`/vouchers/${voucherId}/redeem`);
    return data?.voucher;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not redeem voucher.'));
  }
};

export const apiFetchOutfits = async () => {
  try {
    const { data } = await apiClient.get('/outfits');
    return (data.outfits || []).map((item) => ({
      ...item,
      id: String(item.id || item._id || `${item.title || 'outfit'}_${item.createdAt || ''}_${item.image || ''}`),
      image: toAbsoluteUrl(item.image),
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load outfits.'));
  }
};

export const apiFetchAiOutfits = async () => {
  try {
    const { data } = await apiClient.get('/outfits/ai');
    return (data.outfits || []).map((item) => ({
      ...item,
      id: String(item.id || item._id || `${item.title || 'ai_outfit'}_${item.createdAt || ''}_${item.image || ''}`),
      image: toAbsoluteUrl(item.image),
      source: item.source || 'ai',
      aiMeta: item.aiMeta || null,
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load AI outfits.'));
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
    return {
      ...(data.home || {}),
      featuredProducts: Array.isArray(data?.home?.featuredProducts)
        ? data.home.featuredProducts.map((item) => ({
          ...item,
          image: toAbsoluteUrl(item?.image),
        }))
        : [],
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load dashboard.'));
  }
};

export const apiFetchRetailerProducts = async () => {
  try {
    const { data } = await apiClient.get('/retailers/products/mine');
    return (data?.products || []).map((item) => ({
      ...item,
      image: toAbsoluteUrl(item?.image),
    }));
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Failed to load retailer products.'));
  }
};

export const apiCreateRetailerProduct = async (payload) => {
  try {
    const { data } = await apiClient.post('/retailers/products', payload);
    return {
      ...(data?.product || {}),
      image: toAbsoluteUrl(data?.product?.image),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not create retailer product.'));
  }
};

export const apiUpdateRetailerProduct = async (productId, payload) => {
  try {
    const { data } = await apiClient.patch(`/retailers/products/${productId}`, payload);
    return {
      ...(data?.product || {}),
      image: toAbsoluteUrl(data?.product?.image),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not update retailer product.'));
  }
};

export const apiDeleteRetailerProduct = async (productId) => {
  try {
    const { data } = await apiClient.delete(`/retailers/products/${productId}`);
    return data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not delete retailer product.'));
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

export const apiGenerateVirtualTryOn = async ({ itemId, forceFresh = false }) => {
  if (!itemId) throw new Error('Please select a wardrobe item first.');

  try {
    const { data } = await apiClient.post('/ai/virtual-try-on', {
      itemId,
      forceFresh,
    }, {
      timeout: 120000,
    });

    const payload = data?.data || {};
    return {
      generationId: payload?.generationId || null,
      savedOutfitId: payload?.savedOutfitId || null,
      itemId: payload?.itemId || itemId,
      itemName: payload?.itemName || 'Wardrobe Item',
      title: payload?.title || 'Virtual Try-On',
      generatedImage: toAbsoluteUrl(payload?.generatedImage || null),
      cacheHit: Boolean(payload?.cacheHit),
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not generate virtual try-on right now.'));
  }
};

export const apiSubmitRetailerApplication = async ({
  brandName,
  contactName,
  contactEmail,
  contactPhone,
  website,
  categories,
  description,
}) => {
  if (!String(brandName || '').trim()) throw new Error('Brand name is required.');
  if (!String(contactName || '').trim()) throw new Error('Contact name is required.');
  if (!String(contactEmail || '').trim()) throw new Error('Contact email is required.');

  try {
    const { data } = await apiClient.post('/retailers/apply', {
      brandName: String(brandName || '').trim(),
      contactName: String(contactName || '').trim(),
      contactEmail: String(contactEmail || '').trim().toLowerCase(),
      contactPhone: String(contactPhone || '').trim(),
      website: String(website || '').trim(),
      categories: Array.isArray(categories)
        ? categories
        : String(categories || '').split(',').map((v) => String(v || '').trim()).filter(Boolean),
      description: String(description || '').trim(),
    });

    return data?.retailerApplication || null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not submit retailer application.'));
  }
};

export const apiFetchMyRetailerApplication = async () => {
  try {
    const { data } = await apiClient.get('/retailers/me');
    return data?.retailerApplication || null;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, 'Could not load retailer application status.'));
  }
};