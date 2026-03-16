import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const ErrorState = ({
  theme,
  title = 'Something went wrong',
  message,
  icon = 'alert-circle-outline',
  retryLabel = 'Retry',
  onRetry,
  containerStyle,
}) => {
  return (
    <View style={[styles.wrap, containerStyle]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Ionicons name={icon} size={30} color={theme.secondaryText} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: theme.secondaryText }]}>{message}</Text> : null}
      {onRetry ? (
        <TouchableOpacity style={[styles.retryBtn, { backgroundColor: theme.primary }]} onPress={onRetry} activeOpacity={0.75}>
          <Text style={styles.retryText}>{retryLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, paddingVertical: 80 },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 12,
  },
  title: { marginTop: 12, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  message: { marginTop: 8, fontSize: 14, textAlign: 'center', lineHeight: 20 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 50, marginTop: 16 },
  retryText: { color: '#141414', fontWeight: '700', fontSize: 14 },
});

export default ErrorState;
