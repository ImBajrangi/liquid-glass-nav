import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Global Tap Highlight Fix for Web
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `* { -webkit-tap-highlight-color: transparent !important; outline: none !important; }`;
  document.head.append(style);
}

/**
 * LiquidNav Component (Configurable Edition)
 * @param {Array} tabs - Array of { id, icon: LucideIcon }
 * @param {String} mode - 'drag' or 'press-hold' (Mutually Exclusive)
 */
const LiquidNav = ({ 
  tabs, 
  mode = 'drag', 
  activeColor = '#55624d', 
  inactiveColor = '#94a3b8', 
  pillColor = '#e2e8f0',
  onTabChange 
}) => {
  const [currentPage, setCurrentPage] = useState(tabs[0].id);
  const currentIdx = tabs.findIndex(t => t.id === currentPage);
  const currentIdxRef = useRef(currentIdx);

  const scrollX = useRef(new Animated.Value(currentIdx * 0)).current;
  const pillWidth = useRef(new Animated.Value(56)).current;
  const pillScaleX = useRef(new Animated.Value(1)).current;
  const pillScaleY = useRef(new Animated.Value(1)).current;

  const NAV_WIDTH = Math.min(SCREEN_WIDTH - 40, 400);
  const TAB_WIDTH = (NAV_WIDTH - 20) / tabs.length;

  useEffect(() => {
    currentIdxRef.current = currentIdx;
    Animated.spring(scrollX, {
      toValue: currentIdx * TAB_WIDTH,
      useNativeDriver: false,
      friction: 8,
      tension: 100,
    }).start();
  }, [currentIdx]);

  const triggerBulgeIn = () => {
    if (mode !== 'press-hold') return;
    Animated.parallel([
      Animated.spring(pillScaleX, { toValue: 1.12, useNativeDriver: false, friction: 8 }),
      Animated.spring(pillScaleY, { toValue: 1.06, useNativeDriver: false, friction: 8 }),
    ]).start();
  };

  const triggerBulgeOut = () => {
    if (mode !== 'press-hold') return;
    Animated.parallel([
      Animated.spring(pillScaleX, { toValue: 1, useNativeDriver: false, friction: 8 }),
      Animated.spring(pillScaleY, { toValue: 1, useNativeDriver: false, friction: 8 }),
    ]).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => mode === 'drag',
      onMoveShouldSetPanResponder: (evt, gestureState) => mode === 'drag' && Math.abs(gestureState.dx) > 5,
      onPanResponderMove: (evt, gestureState) => {
        if (mode !== 'drag') return;
        const startX = currentIdxRef.current * TAB_WIDTH;
        const newX = startX + gestureState.dx;
        const clampedX = Math.max(0, Math.min(newX, (tabs.length - 1) * TAB_WIDTH));
        scrollX.setValue(clampedX);

        const stretch = 56 + Math.min(Math.abs(gestureState.dx) * 0.2, 34);
        pillWidth.setValue(stretch);
        pillScaleY.setValue(0.9);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (mode !== 'drag') return;
        const startX = currentIdxRef.current * TAB_WIDTH;
        const finalX = startX + gestureState.dx;
        const nearestIndex = Math.round(Math.max(0, Math.min(finalX, (tabs.length - 1) * TAB_WIDTH)) / TAB_WIDTH);
        
        Animated.parallel([
          Animated.spring(pillWidth, { toValue: 56, useNativeDriver: false, friction: 6 }),
          Animated.spring(pillScaleY, { toValue: 1, useNativeDriver: false, friction: 6 }),
        ]).start();

        if (tabs[nearestIndex].id !== currentPage) {
          setCurrentPage(tabs[nearestIndex].id);
          if (onTabChange) onTabChange(tabs[nearestIndex].id);
        } else {
          Animated.spring(scrollX, {
            toValue: currentIdxRef.current * TAB_WIDTH,
            useNativeDriver: false,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.navWrapper}>
      <View style={[styles.navBar, { width: NAV_WIDTH }]} {...panResponder.panHandlers}>
        <Animated.View style={[styles.bubbleContainer, { width: TAB_WIDTH, transform: [{ translateX: scrollX }] }]}>
          <Animated.View 
            style={[
              styles.bubble, 
              { 
                backgroundColor: pillColor, 
                width: pillWidth, 
                transform: [{ scaleX: pillScaleX }, { scaleY: pillScaleY }] 
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
              onPressIn={triggerBulgeIn}
              onPressOut={triggerBulgeOut}
              onPress={() => {
                if (mode === 'press-hold' || !isActive) {
                  setCurrentPage(tab.id);
                  if (onTabChange) onTabChange(tab.id);
                }
              }} 
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
