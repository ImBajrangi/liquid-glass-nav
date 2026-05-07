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
 * LiquidNav Component (Jelly Glass Edition)
 * Features Squash & Stretch physics for a premium fluid feel.
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
  const pillScaleX = useRef(new Animated.Value(1)).current;
  const pillScaleY = useRef(new Animated.Value(1)).current;

  const NAV_WIDTH = Math.min(SCREEN_WIDTH - 40, 400);
  const TAB_WIDTH = (NAV_WIDTH - 20) / tabs.length;

  const handlePress = (id, index) => {
    setCurrentPage(id);
    if (onTabChange) onTabChange(id);
    
    Animated.parallel([
      Animated.spring(scrollX, {
        toValue: index * TAB_WIDTH,
        useNativeDriver: false,
        friction: 8,
        tension: 80,
      }),
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pillWidth, { toValue: 100, duration: 150, useNativeDriver: false }),
          Animated.timing(pillScaleY, { toValue: 0.75, duration: 150, useNativeDriver: false }),
        ]),
        Animated.parallel([
          Animated.spring(pillWidth, { toValue: 56, useNativeDriver: false, friction: 5, tension: 40 }),
          Animated.spring(pillScaleY, { toValue: 1, useNativeDriver: false, friction: 4, tension: 100 }),
        ]),
      ]),
    ]).start();
  };

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(pillScaleX, { toValue: 1.2, useNativeDriver: false, friction: 4 }),
      Animated.spring(pillScaleY, { toValue: 1.1, useNativeDriver: false, friction: 4 }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(pillScaleX, { toValue: 1, useNativeDriver: false, friction: 5 }),
      Animated.spring(pillScaleY, { toValue: 1, useNativeDriver: false, friction: 5 }),
    ]).start();
  };

  return (
    <View style={styles.navWrapper}>
      <View style={[styles.navBar, { width: NAV_WIDTH }]}>
        <Animated.View style={[styles.bubbleContainer, { width: TAB_WIDTH, transform: [{ translateX: scrollX }] }]}>
          <Animated.View 
            style={[
              styles.bubble, 
              { 
                backgroundColor: pillColor, 
                width: pillWidth, 
                transform: [
                  { scaleX: pillScaleX },
                  { scaleY: pillScaleY }
                ] 
              }
            ]} 
          />
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
