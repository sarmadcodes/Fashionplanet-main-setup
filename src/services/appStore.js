// ─────────────────────────────────────────────────────────────
// appStore.js  — Fashion Planet In-Memory Store
// Single source of truth. Replace with AsyncStorage / Redux
// when connecting real backend.
// ─────────────────────────────────────────────────────────────

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

// ── Mutable state ─────────────────────────────────────────────
let _user = { ...DEFAULT_USER };
let _wardrobeItems = [];        // starts empty — user uploads their own
let _feedPosts = [...SEED_POSTS]; // community posts pre-seeded
let _myPosts = [];

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
  };
  _feedPosts = [newPost, ..._feedPosts];
  _myPosts   = [newPost, ..._myPosts];
  return newPost;
};

export const togglePostLike = (postId) => {
  _feedPosts = _feedPosts.map(p =>
    p.id === postId
      ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
      : p
  );
  return _feedPosts.find(p => p.id === postId);
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