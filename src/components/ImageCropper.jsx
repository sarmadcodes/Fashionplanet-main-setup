import React, { useState, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  PanResponder,
  Animated,
  ScrollView,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';
import { useTheme } from '../context/ThemeContext';
import { darkTheme, lightTheme } from '../theme/colors';

const ImageCropper = ({ visible, imageUri, onSave, onClose, aspectRatio = 1 }) => {
  const { isDark } = useTheme();
  const theme = isDark ? darkTheme : lightTheme;
  const { width } = Dimensions.get('window');

  const [scale, setScale] = useState(1);
  const [croppingAreaWidth, setCroppingAreaWidth] = useState(width - 40);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleZoomIn = () => {
    const newScale = Math.min(scale + 0.2, 3);
    setScale(newScale);
    Animated.timing(scaleAnim, {
      toValue: newScale,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 0.2, 1);
    setScale(newScale);
    Animated.timing(scaleAnim, {
      toValue: newScale,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleSave = () => {
    // In production, you would actually crop the image here using a library like react-native-image-crop-picker
    // For now, just pass the original URI with the crop params
    onSave({
      uri: imageUri,
      scale,
      cropWidth: croppingAreaWidth,
      cropHeight: croppingAreaWidth / aspectRatio,
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Crop Image</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Cropping Area */}
        <View style={styles.content}>
          <ScrollView
            scrollEnabled={true}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Animated.View
              style={[
                styles.imageWrapper,
                {
                  width: croppingAreaWidth,
                  height: croppingAreaWidth / aspectRatio,
                  transform: [{ scale: scaleAnim }],
                },
              ]}
            >
              <Image source={{ uri: imageUri }} style={styles.image} resizeMode="cover" />
            </Animated.View>
          </ScrollView>

          {/* Cropping Frame */}
          <View
            style={[
              styles.cropFrame,
              {
                width: croppingAreaWidth,
                height: croppingAreaWidth / aspectRatio,
                borderColor: theme.primary,
              },
            ]}
          />
        </View>

        {/* Zoom Controls */}
        <View style={[styles.controls, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.controlBtn, { borderColor: theme.border }]}
            onPress={handleZoomOut}
          >
            <Ionicons name="remove" size={20} color={theme.text} />
            <Text style={[styles.controlText, { color: theme.text }]}>Zoom Out</Text>
          </TouchableOpacity>

          <View style={[styles.scaleIndicator, { backgroundColor: theme.card }]}>
            <Text style={[styles.scaleText, { color: theme.secondaryText }]}>
              {Math.round(scale * 100)}%
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.controlBtn, { borderColor: theme.border }]}
            onPress={handleZoomIn}
          >
            <Ionicons name="add" size={20} color={theme.text} />
            <Text style={[styles.controlText, { color: theme.text }]}>Zoom In</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actions, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.border }]}
            onPress={onClose}
          >
            <Text style={[styles.actionText, { color: theme.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Text style={[styles.actionText, { color: '#141414', fontWeight: '700' }]}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  headerBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapper: {
    overflow: 'hidden',
    borderRadius: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  cropFrame: {
    position: 'absolute',
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
    gap: 12,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 0.5,
  },
  controlText: { fontSize: 12, fontWeight: '600' },
  scaleIndicator: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  scaleText: { fontWeight: '600', fontSize: 12 },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 0.5,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: { fontSize: 14, fontWeight: '600' },
});

export default ImageCropper;
