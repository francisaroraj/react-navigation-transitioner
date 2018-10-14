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
    }),
    renderScreen: (
      ScreenComponent, transition, transitions, transitioningFromState, 
      transitioningToState, transitionRouteKey, navigation, ref) => {
        return (
        <TransitionScreen
          navigation={navigation}
          transition={transition} 
          transitioningFromState={transitioningFromState}
          transitioningToState={transitioningToState}
          transitionRouteKey={transitionRouteKey}
        >
          <ScreenComponent navigation={navigation}/>
        </TransitionScreen>
      );}
  }
}

export const createFluidNavigator = (routeConfigs, options) => {
  const TransitionNavigator = createTransitionNavigator(routeConfigs, opts);
  return TransitionNavigator;
}
