import React, { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Global Tap Highlight Fix for Web
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `* { -webkit-tap-highlight-color: transparent !important; outline: none !important; }`;
  document.head.append(style);
}

/**
 * LiquidNav Component (Simplified Fluid Version)
 */
const LiquidNav = ({ 
  tabs, 
  activeColor = '#55624d', 
  inactiveColor = '#94a3b8', 
  pillColor = '#e2e8f0',
  onTabChange 
}) => {
  const [currentPage, setCurrentPage] = useState(tabs[0].id);
  const scrollX = useRef(new Animated.Value(0)).current;
  const pillWidth = useRef(new Animated.Value(56)).current;
  const pillScale = useRef(new Animated.Value(1)).current;

  const NAV_WIDTH = Math.min(SCREEN_WIDTH - 40, 400);
  const TAB_WIDTH = (NAV_WIDTH - 20) / tabs.length;

  const handlePress = (id, index) => {
    setCurrentPage(id);
    if (onTabChange) onTabChange(id);
    
    Animated.parallel([
      Animated.spring(scrollX, {
        toValue: index * TAB_WIDTH,
        useNativeDriver: false,
        bounciness: 8,
        speed: 12,
      }),
      Animated.sequence([
        Animated.timing(pillWidth, { toValue: 80, duration: 150, useNativeDriver: false }),
        Animated.spring(pillWidth, { toValue: 56, useNativeDriver: false, bounciness: 10 }),
      ]),
    ]).start();
  };

  const handlePressIn = () => {
    Animated.spring(pillScale, { toValue: 1.15, useNativeDriver: false, bounciness: 20 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pillScale, { toValue: 1, useNativeDriver: false, bounciness: 20 }).start();
  };

  return (
    <View style={styles.navWrapper}>
      <View style={[styles.navBar, { width: NAV_WIDTH }]}>
        <Animated.View style={[styles.bubbleContainer, { width: TAB_WIDTH, transform: [{ translateX: scrollX }] }]}>
          <Animated.View style={[styles.bubble, { backgroundColor: pillColor, width: pillWidth, transform: [{ scale: pillScale }] }]} />
        </Animated.View>
        
        {tabs.map((tab, index) => {
          const isActive = currentPage === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity 
              key={tab.id}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              onPress={() => handlePress(tab.id, index)} 
              style={styles.tab}
              activeOpacity={1}
            >
              <Icon size={24} color={isActive ? activeColor : inactiveColor} strokeWidth={isActive ? 2.5 : 2} />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navWrapper: { position: 'absolute', bottom: 34, width: '100%', alignItems: 'center' },
  navBar: {
    flexDirection: 'row',
    height: 72,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 36,
    paddingHorizontal: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  tab: { flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  bubbleContainer: { position: 'absolute', left: 10, height: '100%', alignItems: 'center', justifyContent: 'center' },
  bubble: { height: 52, borderRadius: 26 },
});

export default LiquidNav;
