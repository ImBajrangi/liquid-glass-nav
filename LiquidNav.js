import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Animated, PanResponder, Platform } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Inject global web styles for tap highlight if on web
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    * { -webkit-tap-highlight-color: transparent !important; outline: none !important; }
  `;
  document.head.append(style);
}

/**
 * LiquidNav Component
 * @param {Array} tabs - Array of { id, icon: LucideIcon }
 * @param {String} activeColor - Hex/HSL color for active state
 * @param {String} inactiveColor - Hex/HSL color for inactive state
 * @param {String} pillColor - Hex/HSL color for the liquid pill
 * @param {Function} onTabChange - Callback function(id)
 */
const LiquidNav = ({ 
  tabs, 
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
  const pillScale = useRef(new Animated.Value(1)).current;

  const NAV_MAX_WIDTH = 420;
  const NAV_HORIZONTAL_PADDING = 20;
  const ACTUAL_NAV_WIDTH = Math.min(SCREEN_WIDTH - (NAV_HORIZONTAL_PADDING * 2), NAV_MAX_WIDTH);
  const TAB_AREA_WIDTH = ACTUAL_NAV_WIDTH - 20;
  const TAB_WIDTH = TAB_AREA_WIDTH / tabs.length;

  // Unified Liquid Animation Sequence
  const triggerLiquidFlow = (toIndex) => {
    Animated.parallel([
      Animated.spring(scrollX, {
        toValue: toIndex * TAB_WIDTH,
        useNativeDriver: false,
        friction: 8,
        tension: 100,
      }),
      Animated.sequence([
        Animated.timing(pillWidth, { toValue: 80, duration: 150, useNativeDriver: false }),
        Animated.spring(pillWidth, { toValue: 56, useNativeDriver: false, friction: 6 }),
      ]),
    ]).start();
  };

  useEffect(() => {
    if (currentIdxRef.current !== currentIdx) {
      triggerLiquidFlow(currentIdx);
      currentIdxRef.current = currentIdx;
    }
  }, [currentIdx]);

  const handlePressIn = () => {
    Animated.spring(pillScale, { toValue: 1.15, useNativeDriver: false, friction: 5 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pillScale, { toValue: 1, useNativeDriver: false, friction: 5 }).start();
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dx) > 5,
      onPanResponderGrant: () => {
        handlePressIn();
      },
      onPanResponderMove: (evt, gestureState) => {
        const startX = currentIdxRef.current * TAB_WIDTH;
        const newX = startX + gestureState.dx;
        const clampedX = Math.max(0, Math.min(newX, TAB_AREA_WIDTH - TAB_WIDTH));
        scrollX.setValue(clampedX);

        const stretch = 56 + Math.min(Math.abs(gestureState.dx) * 0.2, 34);
        pillWidth.setValue(stretch);
      },
      onPanResponderRelease: (evt, gestureState) => {
        handlePressOut();
        const startX = currentIdxRef.current * TAB_WIDTH;
        const finalX = startX + gestureState.dx;
        const nearestIndex = Math.round(Math.max(0, Math.min(finalX, TAB_AREA_WIDTH - TAB_WIDTH)) / TAB_WIDTH);
        
        if (tabs[nearestIndex].id !== currentPage) {
          setCurrentPage(tabs[nearestIndex].id);
          if (onTabChange) onTabChange(tabs[nearestIndex].id);
        } else {
          Animated.parallel([
            Animated.spring(scrollX, { toValue: currentIdxRef.current * TAB_WIDTH, useNativeDriver: false, friction: 8 }),
            Animated.spring(pillWidth, { toValue: 56, useNativeDriver: false, friction: 6 }),
          ]).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.navContainer}>
      <View style={[styles.navBar, { width: ACTUAL_NAV_WIDTH }]} {...panResponder.panHandlers}>
        <Animated.View 
          style={[
            styles.pillContainer, 
            { 
              width: TAB_WIDTH,
              transform: [{ translateX: scrollX }] 
            }
          ]} 
        >
          <Animated.View 
            style={[
              styles.liquidPill, 
              { 
                backgroundColor: pillColor,
                width: pillWidth,
                transform: [{ scale: pillScale }] 
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
              onPress={() => {
                setCurrentPage(tab.id);
                if (onTabChange) onTabChange(tab.id);
              }} 
              style={[styles.navItem, { width: TAB_WIDTH }]}
              activeOpacity={1}
            >
              <Icon 
                size={22} 
                color={isActive ? activeColor : inactiveColor} 
                strokeWidth={isActive ? 2.5 : 2}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 34,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navBar: {
    flexDirection: 'row',
    height: 76,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 38,
    paddingHorizontal: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  pillContainer: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    left: 10,
  },
  liquidPill: {
    height: 52,
    borderRadius: 26,
  },
  navItem: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

export default LiquidNav;
