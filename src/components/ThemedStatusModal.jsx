import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

const ThemedStatusModal = ({
  visible,
  title,
  message,
  icon = 'checkmark-circle',
  actionText = 'Continue',
  onAction,
}) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onAction}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}> 
          <View style={[styles.iconWrap, { backgroundColor: theme.primary + '1f' }]}> 
            <Ionicons name={icon} size={34} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.secondaryText }]}>{message}</Text>

          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={onAction}>
            <Text style={styles.actionText}>{actionText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    alignItems: 'center',
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 18,
  },
  actionBtn: {
    width: '100%',
    height: 48,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#141414',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ThemedStatusModal;
