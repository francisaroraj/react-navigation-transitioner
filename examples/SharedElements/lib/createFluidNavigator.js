import React from 'react';
import Animated, { Easing } from "react-native-reanimated";
const { Value, timing } = Animated;

import createTransitionNavigator from "../../../Transitioner";
import { TransitionContext } from '../../../Transitioner';

import { TransitionScreen } from './TransitionScreen';
import { FluidTransitionContext } from './FluidTransitionContext';

const opts = {
  navigationOptions : {
    createTransition: transition => ({
      ...transition,
      progress: new Value(0),
    }),
    runTransition: transition =>
      new Promise(resolve => {
        if(transition.progress.__children.length === 0) resolve();
        timing(transition.progress, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.cubic),
        }).start(resolve);
    })
  }
}

export const createFluidNavigator = (routeConfigs, options) => {
  const wrappedRouteConfigs = {};
  Object.keys(routeConfigs).map(routeName => {
    const userRoute = routeConfigs[routeName];
    const Screen = userRoute.screen || userRoute;
    wrappedRouteConfigs[routeName] = {
      screen: (props) => {        
        return (
          <TransitionScreen {...props}>
            <Screen {...props}/>
          </TransitionScreen>
        );
      }
    };
  });
  
  const TransitionNavigator = createTransitionNavigator(wrappedRouteConfigs, opts);
  const FluidNavigator = (props) => {
    return (
      <Animated.View style={{ flex: 1 }}>
        <TransitionNavigator {...props} />
      </Animated.View>
    );
  }
  FluidNavigator.router = TransitionNavigator.router;
  return FluidNavigator;
}
