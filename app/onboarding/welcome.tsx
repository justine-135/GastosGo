import { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { styles } from '../../src/screens/onboarding/welcome.styles';
import { colors } from '../../src/theme/colors';

const FEATURE_PILLS = ['No account needed', 'Stays on your phone', 'Free forever'];

function useStaggeredFade(delay: number) {
  const anim = useRef(new Animated.ValueXY({ x: 0, y: 16 })).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.timing(anim.y, { toValue: 0, duration: 500, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  return { opacity, transform: [{ translateY: anim.y }] };
}

export default function WelcomeScreen() {
  const logoStyle = useStaggeredFade(100);
  const eyebrowStyle = useStaggeredFade(160);
  const titleStyle = useStaggeredFade(200);
  const subStyle = useStaggeredFade(240);
  const pillsStyle = useStaggeredFade(300);

  return (
    <LinearGradient
      colors={['#EEF1FE', '#F7F7F9', '#EEF1FE']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.fill}
    >
      <View style={styles.contentContainer}>
        <Animated.View style={[logoStyle]}>
          <LinearGradient
            colors={[colors.brandSoft, colors.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoWrapper}
          >
            <Text style={styles.logoEmoji}>💸</Text>
          </LinearGradient>
        </Animated.View>

        <Animated.Text style={[styles.eyebrow, eyebrowStyle]}>
          Track Smarter
        </Animated.Text>

        <Animated.View style={[styles.headlineRow, titleStyle]}>
          <Text style={styles.headlineText}>The smarter way to </Text>
          <Text style={styles.headlineBrand}>save</Text>
        </Animated.View>

        <Animated.Text style={[styles.sub, subStyle]}>
          Take control of your savings, one peso at a time.
        </Animated.Text>

        <Animated.View style={[styles.pillsRow, pillsStyle]}>
          {FEATURE_PILLS.map((label) => (
            <View key={label} style={styles.pill}>
              <Text style={styles.pillText}>{label}</Text>
            </View>
          ))}
        </Animated.View>

        <View style={styles.ctaWrapper}>
          <LinearGradient
            colors={[colors.brandSoft, colors.brand]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/onboarding')}
              activeOpacity={0.85}
            >
              <Text style={styles.ctaLabel}>Get Started</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        <Text style={styles.disclaimer}>No account · Your data stays on your phone</Text>
      </View>
    </LinearGradient>
  );
}
