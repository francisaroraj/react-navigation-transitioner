import Animated, { Easing } from "react-native-reanimated";
const { Value, timing, interpolate } = Animated;

export const getFadeTransition = (routeKey, progress, 
  isTransitioningForward, isTransitioningToRoute) => {
  let opacity = 1  
  if (progress) {
    const fromValue = isTransitioningToRoute ? 0 : 1;
    const toValue = isTransitioningToRoute ? 1 : 0;
    const outputRange = isTransitioningToRoute ? 
      [fromValue, fromValue, fromValue, toValue] :
      [fromValue, toValue, toValue, toValue];

    console.log("Starting Fade Transition for " + routeKey, "forward: " + isTransitioningForward, 
      ", trans-to: " + isTransitioningToRoute, ", outputRange: " + outputRange);

    opacity = interpolate(progress, {
      inputRange: [0, 0.1, 0.9, 1],
      outputRange,
    });
  }
  else {
    console.log("End Fade Transition for", routeKey);
  }
  return { opacity };
}