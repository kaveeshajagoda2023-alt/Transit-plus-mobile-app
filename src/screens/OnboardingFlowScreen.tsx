import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { OnboardingPagination } from '@/components/auth/OnboardingPagination';
import { usePassengerAuth } from '@/context/PassengerAuthContext';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  badgeText: string;
  badgeIcon: string;
  title: string;
  description: string;
  imageSource: any;
  cardBadgeLeft?: string;
  cardBadgeRight?: string;
  featurePill1?: { text: string; icon: string };
  featurePill2?: { text: string; icon: string };
  primaryButtonText: string;
  secondaryActionType: 'skip-tour' | 'back-and-skip' | 'have-account';
}

const SLIDES: OnboardingSlide[] = [
  {
    id: 'slide-1',
    badgeText: 'LIVE GPS & SENSORS',
    badgeIcon: 'radar',
    title: 'Track Every Bus & Train in Real Time',
    description:
      'Pinpoint exact vehicle arrivals with second-by-second live radar, stop sequences, and seat crowding predictions.',
    imageSource: require('../../assets/images/onboarding_transit_trains.jpg'),
    cardBadgeLeft: 'Active GPS Telemetry',
    cardBadgeRight: 'LIVE SYNC',
    primaryButtonText: 'Next',
    secondaryActionType: 'skip-tour',
  },
  {
    id: 'slide-2',
    badgeText: 'INSTANT FARE PAY',
    badgeIcon: 'flash',
    title: 'Tap & Ride with Smart Digital Passes',
    description:
      'Buy single rides, day passes, or top-up your MetroPay wallet in seconds. Offline-ready dynamic QR works instantly at turnstiles.',
    imageSource: require('../../assets/images/onboarding_digital_pass.jpg'),
    featurePill1: { text: '100% Offline', icon: 'shield-checkmark' },
    featurePill2: { text: 'Instant Tap', icon: 'flash' },
    primaryButtonText: 'Next',
    secondaryActionType: 'back-and-skip',
  },
  {
    id: 'slide-3',
    badgeText: 'SMART NOTIFICATIONS',
    badgeIcon: 'notifications',
    title: 'Never Miss a Transfer with Live Alerts',
    description:
      'Receive proactive delay notifications, station closures, and instant alternative route recommendations before you leave.',
    imageSource: require('../../assets/images/onboarding_live_alerts.jpg'),
    cardBadgeLeft: '14:36 Red Line',
    cardBadgeRight: 'On Time',
    primaryButtonText: 'Get Started',
    secondaryActionType: 'have-account',
  },
];

export function OnboardingFlowScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const { completeOnboarding } = usePassengerAuth();

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);
    if (index !== currentIndex && index >= 0 && index < SLIDES.length) {
      setCurrentIndex(index);
    }
  };

  const goToSlide = (index: number) => {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentIndex(index);
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      goToSlide(currentIndex + 1);
    } else {
      await completeOnboarding();
      router.push('/role-selection' as any);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      router.back();
    }
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.push('/role-selection' as any);
  };

  const handleAlreadyHaveAccount = async () => {
    await completeOnboarding();
    router.push('/role-selection' as any);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Top Header Row */}
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <View style={styles.brandEmblem}>
            <MaterialCommunityIcons name="bus-clock" size={16} color="#00F0FF" />
          </View>
          <Text style={styles.brandTitle}>TransitPulse</Text>
        </View>

        <TouchableOpacity onPress={handleSkip} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.skipHeaderText}>Skip →</Text>
        </TouchableOpacity>
      </View>

      {/* Main Swiper / Carousel */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        style={styles.carousel}
      >
        {SLIDES.map((slide, index) => (
          <View key={slide.id} style={styles.slideContainer}>
            {/* 3D Illustration Card */}
            <View style={styles.illustrationCard}>
              <Image source={slide.imageSource} style={styles.illustrationImage} resizeMode="cover" />

              {/* In-Card Badges */}
              {slide.cardBadgeLeft && (
                <View style={styles.cardOverlayBar}>
                  <View style={styles.cardLeftBadge}>
                    <View style={styles.liveGreenDot} />
                    <Text style={styles.cardLeftText}>{slide.cardBadgeLeft}</Text>
                  </View>
                  {slide.cardBadgeRight && (
                    <View style={styles.cardRightBadge}>
                      <Text style={styles.cardRightText}>{slide.cardBadgeRight}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Feature Category Pill */}
            <View style={styles.categoryPill}>
              <Ionicons name={slide.badgeIcon as any} size={13} color="#0D9488" />
              <Text style={styles.categoryPillText}>{slide.badgeText}</Text>
            </View>

            {/* Heading and Description */}
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDescription}>{slide.description}</Text>

            {/* Optional sub-feature pills (Slide 2: 100% Offline, Instant Tap) */}
            {slide.featurePill1 && slide.featurePill2 && (
              <View style={styles.featurePillsRow}>
                <View style={styles.subPill}>
                  <Ionicons name={slide.featurePill1.icon as any} size={14} color="#0D9488" />
                  <Text style={styles.subPillText}>{slide.featurePill1.text}</Text>
                </View>
                <View style={styles.subPill}>
                  <Ionicons name={slide.featurePill2.icon as any} size={14} color="#0D9488" />
                  <Text style={styles.subPillText}>{slide.featurePill2.text}</Text>
                </View>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Pagination Indicator */}
      <OnboardingPagination activeIndex={currentIndex} totalDots={3} />

      {/* Bottom Action Area */}
      <View style={styles.bottomArea}>
        <TouchableOpacity style={styles.primaryButton} onPress={handleNext} activeOpacity={0.88}>
          <Text style={styles.primaryButtonText}>{currentSlide.primaryButtonText}</Text>
          <Feather name="arrow-right" size={17} color="#FFFFFF" style={styles.buttonArrow} />
        </TouchableOpacity>

        {/* Dynamic Secondary Action */}
        {currentSlide.secondaryActionType === 'skip-tour' && (
          <TouchableOpacity onPress={handleSkip} style={styles.secondaryLink}>
            <Text style={styles.secondaryLinkText}>Skip Tour</Text>
          </TouchableOpacity>
        )}

        {currentSlide.secondaryActionType === 'back-and-skip' && (
          <View style={styles.backAndSkipRow}>
            <TouchableOpacity onPress={handleBack} style={styles.backLink}>
              <Text style={styles.backLinkText}>← Back</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSkip} style={styles.skipIntroLink}>
              <Text style={styles.secondaryLinkText}>Skip Intro</Text>
            </TouchableOpacity>
          </View>
        )}

        {currentSlide.secondaryActionType === 'have-account' && (
          <TouchableOpacity onPress={handleAlreadyHaveAccount} style={styles.secondaryLink}>
            <Text style={styles.alreadyAccountText}>I already have an account</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandEmblem: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: '#0B2545',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  skipHeaderText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#64748B',
  },
  carousel: {
    flex: 1,
  },
  slideContainer: {
    width,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  illustrationCard: {
    width: width - 48,
    height: width * 0.72,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F2942',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 20,
    position: 'relative',
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlayBar: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveGreenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  cardLeftText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardRightBadge: {
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardRightText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0D9488',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0FDFA',
    borderWidth: 1,
    borderColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0D9488',
    letterSpacing: 0.6,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.4,
    marginBottom: 10,
    lineHeight: 28,
    paddingHorizontal: 8,
  },
  slideDescription: {
    fontSize: 13.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  featurePillsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  subPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  subPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#334155',
  },
  bottomArea: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#0B2545',
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B2545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  buttonArrow: {
    marginLeft: 8,
  },
  secondaryLink: {
    paddingVertical: 6,
  },
  secondaryLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
  },
  backAndSkipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backLink: {
    paddingVertical: 4,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  skipIntroLink: {
    paddingVertical: 4,
  },
  alreadyAccountText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0D9488',
  },
});
