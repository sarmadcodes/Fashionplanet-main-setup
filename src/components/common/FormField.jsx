import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const FormField = ({
  theme,
  label,
  value,
  onChangeText,
  placeholder,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'none',
  autoCorrect = false,
  multiline = false,
  editable = true,
  inputStyle,
}) => {
  return (
    <View>
      {label ? <Text style={[styles.label, { color: theme.text }]}>{label}</Text> : null}
      <View style={[styles.inputWrap, { backgroundColor: theme.card, borderColor: error ? '#FF4444' : 'transparent' }]}>
        {leftIcon ? <Ionicons name={leftIcon} size={18} color={theme.secondaryText} style={styles.leftIcon} /> : null}
        <TextInput
          style={[styles.input, { color: theme.text }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={theme.secondaryText}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          multiline={multiline}
          editable={editable}
        />
        {rightIcon ? (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIconBtn} disabled={!onRightIconPress}>
            <Ionicons name={rightIcon} size={18} color={theme.secondaryText} />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 18, letterSpacing: 0.2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, minHeight: 48, borderWidth: 1.5 },
  leftIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, paddingVertical: 0 },
  rightIconBtn: { padding: 4 },
  error: { color: '#FF4444', fontSize: 11, marginTop: 5, marginLeft: 4 },
});

export default FormField;
