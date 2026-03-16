import Ionicons from '@react-native-vector-icons/ionicons';
import React, { useEffect, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

const icons = {
  Home:     'home-outline',
  Discover: 'search-outline',
  Wardrobe: 'shirt-outline',
  Feed:     'people-outline',
  AI:       'sparkles-sharp',
  Profile:  'person-circle',
};

const CustomBottomBar = ({ state, navigation }) => {
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const bottomInset = insets.bottom > 0 ? insets.bottom : 10;
  const barHeight = 58 + bottomInset;
  const barPaddingBottom = Math.max(8, bottomInset - 1);
  const barPaddingTop = 6;

  const animations = useRef(
    state.routes.map((_, i) => new Animated.Value(i === state.index ? 1 : 0))
  ).current;

  useEffect(() => {
    animations.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === state.index ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={[styles.absoluteWrapper, { bottom: 0 }]}>
      <View style={[
        styles.bar,
        {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          height: barHeight,
          paddingBottom: barPaddingBottom,
          paddingTop: barPaddingTop,
          // subtle top shadow on light, glow-like on dark
          shadowColor: isDark ? theme.primary : '#000',
        },
      ]}>
        {state.routes.map((route, index) => {
          const anim = animations[index];
          const isFocused = state.index === index;

          const translateY = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -6],
          });

          const scale = anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.08],
          });

          // Active icon: filled primary bg, dark icon
          // Inactive icon: card-tinted bg, muted icon + border
          const iconBg     = isFocused ? theme.primary : 'transparent';
          const iconBorder = isFocused ? theme.primary : theme.border;
          const iconColor  = isFocused ? '#141414' : theme.secondaryText;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              activeOpacity={0.85}
              style={styles.tab}
            >
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{ translateY }, { scale }],
                    backgroundColor: iconBg,
                    borderColor: iconBorder,
                  },
                ]}
              >
                <Ionicons
                  name={icons[route.name]}
                  size={20}
                  color={iconColor}
                />
              </Animated.View>

              <Text style={[
                styles.label,
                { color: isFocused ? theme.primary : theme.secondaryText },
                isFocused && styles.activeLabel,
              ]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default CustomBottomBar;

const styles = StyleSheet.create({
  absoluteWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderTopWidth: 0.5,
    elevation: 12,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -3 },
    shadowRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  iconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 50,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 12,
  },
  activeLabel: {
    fontWeight: '700',
  },
});