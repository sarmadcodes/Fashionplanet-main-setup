import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext'; // your ThemeContext
import { darkTheme, lightTheme } from '../../theme/colors';

const GAP = 10;

const StyleCard = ({ type, data, onPress }) => {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { width } = useWindowDimensions();

  const displayItems = data?.slice(0, 3) || [];
  const itemCount = Math.max(1, displayItems.length);
  const horizontalPadding = 40;
  const totalGapSpace = GAP * (itemCount - 1);
  const itemWidth = (width - horizontalPadding - totalGapSpace) / itemCount;

  const handlePress = (item, index) => {
    if (onPress) {
      onPress({ item, index, type, data });
    } else {
      navigation.navigate('StyleDetails', { item, type, allItems: data });
    }
  };

  return (
    <View style={styles.row}>
      {displayItems.map((item, index) => {
        const isOverlay = type === 'overlay';
        const isDetail = type === 'detail';

        return (
          <View
            key={index}
            style={[
              styles.cardContainer,
              { width: itemWidth },
              !isDark && { 
                backgroundColor: theme.background, 
                borderRadius: 10,
                ...Platform.select({
                  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4 },
                  android: { elevation: 2 },
                }),
              },
            ]}
          >
            {/* IMAGE SECTION */}
            <TouchableOpacity
              activeOpacity={0.6}
              style={[
                styles.imageBox,
                isDetail && { borderColor: theme.border, borderWidth: 1, borderRadius: 10, backgroundColor: theme.card },
                isOverlay && { backgroundColor: theme.card },
              ]}
              onPress={() => handlePress(item, index)}
            >
              <Image source={{ uri: item.image }} style={styles.image} />

              {isOverlay && (
                <View style={[styles.overlayLabel, { backgroundColor: isDark ? '#2a2a2a3a' : '#00000030' }]}>
                  <Text style={[styles.titleText, { color: theme.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text style={[styles.greenText, { color: theme.primary }]}>
                    {item.subtitle}
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* TEXT BELOW IMAGE */}
            {!isOverlay && (
              <View style={[styles.textBox, isDetail && styles.alignLeft]}>
                <Text style={[styles.titleText, { color: theme.text }]} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={[isDetail ? styles.grayText : styles.greenText, { color: isDetail ? theme.secondaryText : theme.primary }]}>
                  {item.subtitle}
                </Text>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'flex-start',
    gap: GAP,
    marginBottom: 20,
  },
  cardContainer: { overflow: 'hidden' },
  imageBox: {
    width: '100%',
    aspectRatio: 0.8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#2A2A2A',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlayLabel: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: 3,
    alignItems: 'center',
  },
  textBox: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  alignLeft: {
    alignItems: 'flex-start',
  },
  titleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  greenText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  grayText: {
    fontSize: 10,
    marginTop: 1,
  },
});

export default StyleCard;
