import { Dimensions } from 'react-native';
import Animated, { Easing } from "react-native-reanimated";
const { Value, timing, interpolate } = Animated;

export const getHorizontalTransition = (route, transition, fromState, toState) => {
  let translateX = 0;
  if (transition && toState) {
    const { transitionRouteKey } = transition;
    if (transitionRouteKey === route) {
      const { progress } = transition;
      const { width } = Dimensions.get('window');
      const from = -width; // fromState ? (fromState.routes.find(r => r.key === route) ? width : 0) : width;
      const to = 0; // toState.routes.find(r => r.key === route) ? 0 : -width;
      console.log(route, from, to);
      translateX = interpolate(progress, {
        inputRange: [0, 1],
        outputRange: [from, to],
      });
    }
  }
  return { transform: [ { translateX }] };
}