import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

const AnimatedText = Animated.createAnimatedComponent(Text);

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

export function SplashScreen({ onFinish }: SplashScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];

  // Animations pour le logo
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const logoRotation = useSharedValue(0);

  // Animations pour le titre
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);

  // Animations pour le sous-titre
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);

  // Animations pour les icônes décoratives
  const icon1Opacity = useSharedValue(0);
  const icon1Scale = useSharedValue(0);
  const icon2Opacity = useSharedValue(0);
  const icon2Scale = useSharedValue(0);
  const icon3Opacity = useSharedValue(0);
  const icon3Scale = useSharedValue(0);

  // Animation de sortie
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    // Animation d'entrée séquentielle
    // 1. Logo avec effet bounce
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.cubic) })
    );
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoRotation.value = withTiming(360, { duration: 800, easing: Easing.out(Easing.cubic) });

    // 2. Titre après le logo
    titleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(
      800,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // 3. Sous-titre
    subtitleOpacity.value = withDelay(1400, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(
      1400,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.cubic) })
    );

    // 4. Icônes décoratives avec délai
    icon1Opacity.value = withDelay(2000, withTiming(1, { duration: 400 }));
    icon1Scale.value = withDelay(
      2000,
      withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 200 })
      )
    );

    icon2Opacity.value = withDelay(2300, withTiming(1, { duration: 400 }));
    icon2Scale.value = withDelay(
      2300,
      withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 200 })
      )
    );

    icon3Opacity.value = withDelay(2600, withTiming(1, { duration: 400 }));
    icon3Scale.value = withDelay(
      2600,
      withSequence(
        withTiming(1.3, { duration: 300 }),
        withTiming(1, { duration: 200 })
      )
    );

    // 5. Animation de sortie après 5 secondes
    const timer = setTimeout(() => {
      containerOpacity.value = withTiming(
        0,
        {
          duration: 500,
          easing: Easing.inOut(Easing.ease),
        },
        () => {
          runOnJS(onFinish)();
        }
      );
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotation.value}deg` },
    ],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const icon1AnimatedStyle = useAnimatedStyle(() => ({
    opacity: icon1Opacity.value,
    transform: [{ scale: icon1Scale.value }],
  }));

  const icon2AnimatedStyle = useAnimatedStyle(() => ({
    opacity: icon2Opacity.value,
    transform: [{ scale: icon2Scale.value }],
  }));

  const icon3AnimatedStyle = useAnimatedStyle(() => ({
    opacity: icon3Opacity.value,
    transform: [{ scale: icon3Scale.value }],
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.background },
        containerAnimatedStyle,
      ]}>
      <View style={styles.content}>
        {/* Logo/Icone principal */}
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View
            style={[
              styles.logoCircle,
              { backgroundColor: colors.tint + '20' },
            ]}>
            <Ionicons name="bag" size={80} color={colors.tint} />
          </View>
        </Animated.View>

        {/* Titre */}
        <Animated.View style={titleAnimatedStyle}>
          <AnimatedText
            style={[styles.title, { color: colors.text }]}>
            BRS-CSI
          </AnimatedText>
        </Animated.View>

        {/* Sous-titre */}
        <Animated.View style={subtitleAnimatedStyle}>
          <AnimatedText
            style={[styles.subtitle, { color: colors.icon }]}>
            Système de suivi des bagages
          </AnimatedText>
        </Animated.View>

        {/* Icônes décoratives */}
        <View style={styles.iconsContainer}>
          <Animated.View style={icon1AnimatedStyle}>
            <View style={[styles.iconCircle, { backgroundColor: colors.tint + '15' }]}>
              <Ionicons name="airplane" size={32} color={colors.tint} />
            </View>
          </Animated.View>

          <Animated.View style={icon2AnimatedStyle}>
            <View style={[styles.iconCircle, { backgroundColor: colors.tint + '15' }]}>
              <Ionicons name="location" size={32} color={colors.tint} />
            </View>
          </Animated.View>

          <Animated.View style={icon3AnimatedStyle}>
            <View style={[styles.iconCircle, { backgroundColor: colors.tint + '15' }]}>
              <Ionicons name="shield-checkmark" size={32} color={colors.tint} />
            </View>
          </Animated.View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width,
    height: height,
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 60,
  },
  iconsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

