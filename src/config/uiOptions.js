// Centralized UI option sets and local preset data.
// Keep screen components free from scattered static arrays.

export const WARDROBE_CATEGORIES = Object.freeze([
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
  'Bags',
]);

export const WARDROBE_COLORS = Object.freeze([
  'Black',
  'White',
  'Navy',
  'Grey',
  'Beige',
  'Brown',
  'Red',
  'Green',
  'Pink',
]);

export const WARDROBE_SEASONS = Object.freeze([
  'Spring',
  'Summer',
  'Fall',
  'Winter',
  'All Season',
]);

export const STYLE_AVATAR_TYPES = Object.freeze([
  { id: 1, label: 'Minimalist', icon: 'remove-outline', color: '#888', image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 2, label: 'Streetwear', icon: 'flame-outline', color: '#FF6B6B', image: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 3, label: 'Business', icon: 'briefcase-outline', color: '#4A90E2', image: 'https://images.pexels.com/photos/1893590/pexels-photo-1893590.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 4, label: 'Bohemian', icon: 'leaf-outline', color: '#7CB77C', image: 'https://images.pexels.com/photos/428338/pexels-photo-428338.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 5, label: 'Retro', icon: 'time-outline', color: '#C4985F', image: 'https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 6, label: 'Athleisure', icon: 'fitness-outline', color: '#9B59B6', image: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=800' },
]);

export const GENERATE_OUTFIT_PRESETS = Object.freeze({
  Casual: {
    Sunny: {
      title: 'Casual Sunny Look',
      image: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['White Linen Shirt', 'Light Chinos', 'Clean White Sneakers'],
      missing: 'Canvas Tote Bag', retailer: 'Zara',
      tip: 'Roll the sleeves for that effortless summer feel.',
    },
    Rainy: {
      title: 'Casual Rainy Day',
      image: 'https://images.pexels.com/photos/2896840/pexels-photo-2896840.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Oversized Hoodie', 'Slim Joggers', 'Waterproof Ankle Boots'],
      missing: 'Compact Umbrella', retailer: 'H&M',
      tip: 'Layer a windbreaker over the hoodie for extra protection.',
    },
    Cold: {
      title: 'Cosy Casual Winter',
      image: 'https://images.pexels.com/photos/842811/pexels-photo-842811.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Chunky Knit Sweater', 'Dark Slim Jeans', 'Chelsea Boots'],
      missing: 'Wool Scarf', retailer: 'M&S',
      tip: 'Tuck the sweater slightly at the front for shape.',
    },
  },
  Business: {
    Sunny: {
      title: 'Power Summer Office',
      image: 'https://images.pexels.com/photos/1300550/pexels-photo-1300550.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Tailored Blazer', 'White Dress Shirt', 'Slim Fit Trousers', 'Oxford Shoes'],
      missing: 'Leather Belt', retailer: 'M&S',
      tip: 'Opt for lighter fabric blazers in breathable neutral tones.',
    },
    Rainy: {
      title: 'Sharp Rainy Office',
      image: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Wool Overcoat', 'Navy Suit', 'Derby Shoes'],
      missing: 'Leather Briefcase', retailer: 'Next',
      tip: 'A wool overcoat keeps the sharp silhouette even in rain.',
    },
    Cold: {
      title: 'Winter Business Look',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Double Breasted Suit', 'Ribbed Turtleneck', 'Derby Shoes'],
      missing: 'Cashmere Overcoat', retailer: 'Zara',
      tip: 'The turtleneck replaces the tie for a modern executive look.',
    },
  },
  Party: {
    Sunny: {
      title: 'Day Party Look',
      image: 'https://images.pexels.com/photos/1192609/pexels-photo-1192609.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Open Collar Linen Shirt', 'Tailored Shorts', 'Suede Loafers'],
      missing: 'Woven Leather Belt', retailer: 'ASOS',
      tip: 'Pair with a simple chain for the perfect day event look.',
    },
    Rainy: {
      title: 'Indoor Party Look',
      image: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Satin Finish Shirt', 'Straight Leg Trousers', 'Chelsea Boots'],
      missing: 'Minimalist Watch', retailer: 'Zara',
      tip: 'Satin catches indoor lighting beautifully - keep it fitted.',
    },
    Cold: {
      title: 'Winter Night Out',
      image: 'https://images.pexels.com/photos/3766111/pexels-photo-3766111.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Velvet Blazer', 'Straight Leg Trousers', 'Ankle Boots'],
      missing: 'Wool Overcoat', retailer: 'H&M',
      tip: 'Velvet is winter party gold - rich texture, zero effort.',
    },
  },
  Weekend: {
    Sunny: {
      title: 'Weekend Brunch',
      image: 'https://images.pexels.com/photos/4349759/pexels-photo-4349759.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Linen Shirt', 'Chino Shorts', 'Espadrilles'],
      missing: 'Polarised Sunglasses', retailer: 'Mango',
      tip: 'Linen breathes well in the heat - ideal for a long sunny afternoon.',
    },
    Rainy: {
      title: 'Cosy Weekend',
      image: 'https://images.pexels.com/photos/5384445/pexels-photo-5384445.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Fleece Zip-Up', 'Wide Leg Joggers', 'Slip-on Sneakers'],
      missing: 'Ribbed Beanie', retailer: 'Uniqlo',
      tip: 'Tonal color sets look instantly more put-together.',
    },
    Cold: {
      title: 'Cold Weekend Casual',
      image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=800',
      items: ['Sherpa Lined Jacket', 'Dark Slim Jeans', 'White Leather Trainers'],
      missing: 'Thermal Base Layer', retailer: 'H&M',
      tip: 'Sherpa jackets give cosy volume without looking overly bulky.',
    },
  },
});

export const GENERATE_MOODS = Object.freeze(['Casual', 'Business', 'Party', 'Weekend']);
export const GENERATE_WEATHERS = Object.freeze(['Sunny', 'Rainy', 'Cold']);

export const GENERATE_MOOD_ICONS = Object.freeze({
  Casual: 'walk-outline',
  Business: 'briefcase-outline',
  Party: 'wine-outline',
  Weekend: 'cafe-outline',
});

export const GENERATE_WEATHER_ICONS = Object.freeze({
  Sunny: 'sunny-outline',
  Rainy: 'rainy-outline',
  Cold: 'snow-outline',
});
