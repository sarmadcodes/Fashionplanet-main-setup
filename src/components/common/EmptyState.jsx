import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const EmptyState = ({
  theme,
  icon = 'albums-outline',
  title,
  description,
  actionLabel,
  onAction,
  containerStyle,
  iconWrapStyle,
}) => {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.card, borderColor: theme.border }, iconWrapStyle]}>
        <Ionicons name={icon} size={40} color={theme.secondaryText} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {description ? <Text style={[styles.description, { color: theme.secondaryText }]}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={onAction} activeOpacity={0.75}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 64 },
  iconWrap: { width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: 14 },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },
  description: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 8, fontWeight: '500' },
  actionBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 50, marginTop: 16 },
  actionText: { color: '#141414', fontWeight: '700', fontSize: 14 },
});

export default EmptyState;
