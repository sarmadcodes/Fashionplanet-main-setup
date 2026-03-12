import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import Ionicons from '@react-native-vector-icons/ionicons';

const { width } = Dimensions.get('window');

const CustomButton = ({ text, icon, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.5}
      onPress={onPress}
      style={styles.button}
    >
      <View style={styles.content}>
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color="#141414"
            style={styles.icon}
          />
        )}
        <Text style={styles.text}>{text}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default CustomButton;
const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 45,
    backgroundColor: '#C7DA2C',
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical:15,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  text: {
    color: '#141414',
    fontSize: 15,
    fontWeight: '600',
  },
});
