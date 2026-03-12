// ─────────────────────────────────────────────────────────────
// mockApi.js  — Fashion Planet API Service (PROFESSIONAL VERSION)
// All calls go through here. Swap bodies for real API later.
// ─────────────────────────────────────────────────────────────

import {
  getFeedPosts,
  getMyPosts,
  addPost,
  togglePostLike,
} from './appStore';
import apiClient from './apiClient';

const delay = () => Promise.resolve();

const getApiErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.errors?.[0]?.msg ||
  fallback;

const normalizeWardrobeItem = (item) => ({
  id: item.id || item._id,
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
    const { data } = await apiClient.get('/auth/me');
    return data.user;
  } catch (error) {
    const message =
      error?.response?.data?.message ||
      'Unable to fetch profile right now.';
    throw new Error(message);
  }
};

export const apiUpdateProfile = async (data) => {
  return data;
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
  await delay(1500);
  return getFeedPosts();
};

export const apiFetchMyPosts = async () => {
  await delay(1000);
  return getMyPosts();
};

export const apiCreatePost = async ({ images, caption }) => {
  await delay(2200);
  if (!images || images.length === 0)
    throw new Error('Please select at least one image.');
  if (!caption?.trim())
    throw new Error('Please add a caption.');
  return addPost({ images, caption });
};

export const apiToggleLike = async (postId) => {
  await delay(400);
  return togglePostLike(postId);
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