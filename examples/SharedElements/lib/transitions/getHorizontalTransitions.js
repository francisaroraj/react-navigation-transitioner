import { Dimensions } from 'react-native';
import Animated, { Easing } from "react-native-reanimated";
const { Value, timing, interpolate } = Animated;

export const getHorizontalTransition = (routeKey, progress, 
  isTransitioningForward, isTransitioningToRoute) => {
    let translateX = 0;
    if (progress) {
      let { width } = Dimensions.get('window');
      if ((isTransitioningForward && !isTransitioningToRoute) || 
        (!isTransitioningForward && isTransitioningToRoute)) width *= -0.5;

      const fromValue = isTransitioningToRoute ? width : 0;
      const toValue = isTransitioningToRoute ? 0 : width;     
      const outputRange = isTransitioningToRoute ? 
        [fromValue, fromValue, toValue] :
        [fromValue, toValue, toValue];
      
      console.log("Starting Horizontal Transition for " + routeKey, "forward: " + isTransitioningForward, 
        ", trans-to: " + isTransitioningToRoute, ", outputRange: " + outputRange);

      translateX = interpolate(progress, {
        inputRange: [0, 0.5, 1],
        outputRange,
      });
    } else {
      console.log("End Horizontal Transition for", routeKey);
    }
    return { transform:[{ translateX }] };
}