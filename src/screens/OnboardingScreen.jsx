import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

const ONBOARDING_DATA = [
  {
    id: 1,
    title: 'Your Digital Wardrobe',
    description: 'Upload and recognize your entire wardrobe. Never forget what you own again',
  },
  {
    id: 2,
    title: 'AI Powered Styling',
    description: 'Get personalized outfit suggestions based on weather, mood and occasion',
  },
  {
    id: 3,
    title: 'Virtual Try On',
    description: 'See how it fits before you wear it.',
  },
  {
    id: 4,
    title: 'Fashion Community',
    description: 'Share your style, discover trends, and connect with fashion lovers worldwide',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const translateX = new Animated.Value(0);

  const isLastScreen = currentIndex === ONBOARDING_DATA.length - 1;

  const handleContinue = () => {
    if (isLastScreen) {
      navigation.replace('LoginScreen');
    } else {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  // ✅ FIXED: Skip now directly goes to Login
  const handleSkip = () => {
    navigation.replace('LoginScreen');
  };

  // ✅ Swipe Handler
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX } = event.nativeEvent;

      if (translationX < -80 && currentIndex < ONBOARDING_DATA.length - 1) {
        // Swipe Left → Next
        setCurrentIndex(prev => prev + 1);
      }

      if (translationX > 80 && currentIndex > 0) {
        // Swipe Right → Back
        setCurrentIndex(prev => prev - 1);
      }
    }
  };

  const currentItem = ONBOARDING_DATA[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor='#141414' />

      {/* Top Bar */}
      <View style={styles.topBar}>
        {currentIndex > 0 ? (
          <TouchableOpacity onPress={handleBack}>
            <Text style={styles.topText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}

        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.topText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content with Swipe */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View style={{ flex: 1 }}>
          <View style={styles.content}>
            <Image
              source={require('../assets/logo01.png')}
              style={styles.logo}
            />

            <Text style={styles.title}>{currentItem.title}</Text>
            <Text style={styles.description}>{currentItem.description}</Text>
          </View>
        </Animated.View>
      </PanGestureHandler>

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {ONBOARDING_DATA.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.activeDot,
            ]}
          />
        ))}
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>
          {isLastScreen ? 'Continue' : 'Continue'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default OnboardingScreen;


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    paddingHorizontal:20
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
  },
  topText: {
    fontSize: 16,
    fontWeight:'600',
    color:'#FEFDFB'
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 50,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
    color:'#FEFDFB'
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    opacity: 0.75,
    color:'#D9D9DA',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  dot: {
    width: 16,
    height: 8,
    borderRadius: 50,
    backgroundColor: '#d9d9dad7',
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#C7DA2C',
    width: 32,
  },
  button: {
    marginHorizontal: 30,
    marginVertical:30,
    paddingVertical: 15,
    borderRadius: 50,
    backgroundColor: '#C7DA2C',
    alignItems: 'center',
  },
  buttonText: {
    color: '#141414',
    fontSize: 16,
    fontWeight:'600'
  },
});
