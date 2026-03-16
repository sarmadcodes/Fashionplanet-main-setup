import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const CommonSkeleton = ({ width = '100%', height = 16, borderRadius = 10, style }) => {
  const { isDark } = useTheme();

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: isDark ? '#1F1F1F' : '#ECECEC',
        },
        style,
      ]}
    />
  );
};

export default CommonSkeleton;
