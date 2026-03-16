import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const ScreenHeader = ({
  theme,
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  rightIcon,
  rightLabel,
  onRightPress,
  rightButtonStyle,
  rightTextStyle,
  containerStyle,
  titleStyle,
  subtitleStyle,
}) => {
  return (
    <View style={[styles.header, containerStyle]}>
      <View style={styles.leftWrap}>
        {leftIcon ? (
          <TouchableOpacity onPress={onLeftPress} activeOpacity={0.7} style={styles.leftBtn}>
            <Ionicons name={leftIcon} size={24} color={theme.text} />
          </TouchableOpacity>
        ) : null}
        <View>
          <Text style={[styles.title, { color: theme.text }, titleStyle]}>{title}</Text>
          {subtitle ? <Text style={[styles.subtitle, { color: theme.secondaryText }, subtitleStyle]}>{subtitle}</Text> : null}
        </View>
      </View>

      {(rightIcon || rightLabel) && onRightPress ? (
        <TouchableOpacity
          style={[
            styles.rightBtn,
            rightIcon && !rightLabel ? { backgroundColor: theme.card, borderColor: theme.border } : null,
            rightLabel && !rightIcon ? { backgroundColor: theme.primary } : null,
            rightButtonStyle,
          ]}
          onPress={onRightPress}
          activeOpacity={0.75}
        >
          {rightIcon ? <Ionicons name={rightIcon} size={20} color={rightLabel ? '#141414' : theme.text} /> : null}
          {rightLabel ? <Text style={[styles.rightLabel, rightTextStyle]}>{rightLabel}</Text> : null}
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftWrap: { flexDirection: 'row', alignItems: 'center' },
  leftBtn: { marginRight: 10, padding: 2 },
  title: { fontSize: 24, fontWeight: '700', letterSpacing: 0.2 },
  subtitle: { fontSize: 12, marginTop: 3, fontWeight: '500' },
  rightBtn: {
    minWidth: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    flexDirection: 'row',
    paddingHorizontal: 11,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  rightLabel: { color: '#141414', fontWeight: '700', fontSize: 13 },
});

export default ScreenHeader;
