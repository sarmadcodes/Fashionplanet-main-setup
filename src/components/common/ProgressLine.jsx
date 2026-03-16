import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

const ProgressLine = ({
  theme,
  progress = 0,
  leftLabel,
  rightLabel,
  animate = true,
  containerStyle,
  trackStyle,
  fillStyle,
}) => {
  const safeProgress = useMemo(() => clamp(progress, 0, 1), [progress]);
  const percent = Math.round(safeProgress * 100);
  const animated = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animate) {
      Animated.timing(animated, {
        toValue: percent,
        duration: 700,
        useNativeDriver: false,
      }).start();
    } else {
      animated.setValue(percent);
    }
  }, [animate, animated, percent]);

  const width = animated.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={containerStyle}>
      <View style={[styles.track, { backgroundColor: theme.background, borderColor: theme.border }, trackStyle]}>
        <Animated.View style={[styles.fill, { width, backgroundColor: theme.primary }, fillStyle]} />
      </View>
      {(leftLabel || rightLabel) ? (
        <View style={styles.labels}>
          <Text style={[styles.leftLabel, { color: theme.secondaryText }]}>{leftLabel}</Text>
          <Text style={[styles.rightLabel, { color: theme.primary }]}>{rightLabel || `${percent}%`}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 6, overflow: 'hidden', borderWidth: 0.5 },
  fill: { height: '100%', borderRadius: 6 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  leftLabel: { fontSize: 12, fontWeight: '500' },
  rightLabel: { fontSize: 12, fontWeight: '700' },
});

export default ProgressLine;
