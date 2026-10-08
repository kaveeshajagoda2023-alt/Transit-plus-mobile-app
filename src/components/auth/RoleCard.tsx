import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { PortalRole } from '@/types/auth';

interface RoleCardProps {
  role: PortalRole;
  title: string;
  badgeTag: string;
  badgeTagColor?: string;
  description: string;
  subBadgeText: string;
  actionText: string;
  iconName: string;
  iconType: 'feather' | 'ionicons' | 'material';
  iconBgColor?: string;
  iconColor?: string;
  isSelected: boolean;
  onSelect: () => void;
  onActionPress: () => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  title,
  badgeTag,
  badgeTagColor = '#0D9488',
  description,
  subBadgeText,
  actionText,
  iconName,
  iconType,
  iconBgColor = '#F0FDFA',
  iconColor = '#0D9488',
  isSelected,
  onSelect,
  onActionPress,
}) => {
  const renderIcon = () => {
    if (iconType === 'feather') {
      return <Feather name={iconName as any} size={22} color={iconColor} />;
    }
    if (iconType === 'ionicons') {
      return <Ionicons name={iconName as any} size={22} color={iconColor} />;
    }
    return <MaterialCommunityIcons name={iconName as any} size={22} color={iconColor} />;
  };

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onSelect}
      activeOpacity={0.9}
    >
      <View style={styles.headerRow}>
        <View style={styles.titleWithIcon}>
          <View style={[styles.iconBox, { backgroundColor: iconBgColor }]}>{renderIcon()}</View>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.titleText}>{title}</Text>
              <View style={[styles.badgeTag, { backgroundColor: `${badgeTagColor}15` }]}>
                <Text style={[styles.badgeTagText, { color: badgeTagColor }]}>{badgeTag}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={[styles.radioCircle, isSelected && styles.radioCircleActive]}>
          {isSelected && <View style={styles.radioInnerCircle} />}
        </View>
      </View>

      <Text style={styles.descriptionText}>{description}</Text>

      <View style={styles.footerRow}>
        <View style={styles.subBadge}>
          <Text style={styles.subBadgeText}>{subBadgeText}</Text>
        </View>

        <TouchableOpacity
          style={[styles.actionBtn, isSelected && styles.actionBtnSelected]}
          onPress={onActionPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.actionBtnText, isSelected && styles.actionBtnTextSelected]}>
            {actionText}
          </Text>
          <Feather
            name="arrow-right"
            size={13}
            color={isSelected ? '#FFFFFF' : '#0F2942'}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#0D9488',
    backgroundColor: '#FAFDFD',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  titleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  badgeTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeTagText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  radioCircleActive: {
    borderColor: '#0D9488',
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0D9488',
  },
  descriptionText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 14,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 12,
  },
  subBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  actionBtnSelected: {
    backgroundColor: '#0F2942',
    borderColor: '#0F2942',
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F2942',
  },
  actionBtnTextSelected: {
    color: '#FFFFFF',
  },
  arrowIcon: {
    marginLeft: 5,
  },
});
