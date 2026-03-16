import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SectionHeader = ({
  theme,
  title,
  subtitle,
  rightLabel,
  onRightPress,
  containerStyle,
}) => {
  return (
    <View style={[styles.row, containerStyle]}>
      <View>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{subtitle}</Text> : null}
      </View>
      {rightLabel && onRightPress ? (
        <TouchableOpacity onPress={onRightPress} activeOpacity={0.7}>
          <Text style={[styles.rightLabel, { color: theme.primary }]}>{rightLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, marginTop: 8 },
  title: { fontSize: 18, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 2, fontWeight: '500' },
  rightLabel: { fontSize: 13, fontWeight: '600' },
});

export default SectionHeader;
