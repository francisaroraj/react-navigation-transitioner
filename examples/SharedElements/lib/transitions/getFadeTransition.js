import Animated, { Easing } from "react-native-reanimated";
const { Value, timing, interpolate } = Animated;

export const getFadeTransition = (route, transition, fromState, toState) => {
  let opacity = 1;
  if (transition && toState) {
    const { transitionRouteKey } = transition;
    if (transitionRouteKey === route) {
      const { progress } = transition;
      const fromOpacity = fromState ? fromState.routes.find(r => r.key === route,) ? 1 : 0 : 0;
      const toOpacity = toState.routes.find(r => r.key === route) ? 1 : 0;
      opacity = interpolate(progress, {
        inputRange: [0, 1],
        outputRange: [fromOpacity, toOpacity],
      });
    }
  }
  return { opacity };
}