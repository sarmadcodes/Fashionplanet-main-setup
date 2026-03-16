import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');
const GAP = 8;
const PADDING = 12;
const BUTTON_WIDTH = (width - PADDING * 2 - GAP * 3) / 4;

const FilterGroup = ({ items, onSelect, activeFilter }) => {
  const { isDark } = useTheme();

  // Only one selected ID at a time
  const [selectedId, setSelectedId] = useState(null);
  const isControlled = typeof onSelect === 'function';

  const selectFilter = (item) => {
    if (isControlled) {
      onSelect(item);
      return;
    }

    const id = item?.id;
    if (selectedId === id) {
      setSelectedId(null);
    } else {
      setSelectedId(id);
    }
  };

  const colors = {
    background: isDark ? '#262626' : '#F2F2F2', // default inactive button
    border: isDark ? '#555' : '#CCC',           // default inactive border
    text: isDark ? '#D9D9DA' : '#141414',       // default inactive text
    green: '#C7DA2C',                           // active color (same for both)
    greenText: '#141414',                        // text color for active button
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const isActive = isControlled ? activeFilter === item.name : selectedId === item.id;

        return (
          <TouchableOpacity
            key={`${String(item?.id ?? 'no_id')}_${String(item?.name ?? 'no_name')}_${index}`}
            activeOpacity={0.7}
            onPress={() => selectFilter(item)}
            style={[
              styles.button,
              {
                backgroundColor: isActive ? colors.green : colors.background,
                borderColor: isActive ? colors.green : colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.buttonText,
                { color: isActive ? colors.greenText : colors.text },
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: PADDING,
    marginVertical: 15,
    gap: GAP,
  },
  button: {
    width: BUTTON_WIDTH,
    height: 35,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default FilterGroup;
