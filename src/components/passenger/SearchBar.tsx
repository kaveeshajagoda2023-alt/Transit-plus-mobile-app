import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { TransitColors, TransitShadows } from '@/constants/transitTheme';

interface SearchBarProps {
  onSearchPress?: () => void;
  onVoicePress?: () => void;
  onFilterPress?: () => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearchPress,
  onVoicePress,
  onFilterPress,
  placeholder = 'Where do you want to go?',
}) => {
  const handleVoicePress = () => {
    if (onVoicePress) {
      onVoicePress();
    } else {
      Alert.alert('Voice Search', 'Listening for your destination...');
    }
  };

  const handleFilterPress = () => {
    if (onFilterPress) {
      onFilterPress();
    } else {
      Alert.alert('Filter Options', 'Customize routes, transfer limits, and transport preferences.');
    }
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.searchBar}>
        {/* Main Search Input Pressable Area */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onSearchPress}
          style={styles.searchMainPressable}
          accessibilityRole="search"
          accessibilityLabel="Search routes and destinations"
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={TransitColors.textSecondary}
            style={styles.searchIcon}
          />

          <Text style={styles.placeholderText} numberOfLines={1}>
            {placeholder}
          </Text>
        </TouchableOpacity>

        {/* Action Buttons Container (Siblings, not nested) */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleVoicePress}
            accessibilityLabel="Voice search"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="mic" size={19} color={TransitColors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.verticalDivider} />

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleFilterPress}
            accessibilityLabel="Filter search"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Feather name="sliders" size={19} color={TransitColors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  searchBar: {
    height: 54,
    backgroundColor: '#FFFFFF',
    borderRadius: 27,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...TransitShadows.card,
  },
  searchMainPressable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
  },
  searchIcon: {
    marginRight: 10,
  },
  placeholderText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: TransitColors.textPrimary,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  verticalDivider: {
    width: 1,
    height: 18,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 2,
  },
});
