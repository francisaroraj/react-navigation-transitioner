import React from 'react';
import { Dimensions } from 'react-native';
import Animated, { Easing } from "react-native-reanimated";
const { Value, timing, interpolate } = Animated;

import { TransitionContext } from "../../../Transitioner";
import { FluidTransitionContext } from './FluidTransitionContext';
import Transitions from './transitions';

export const TransitionView = (props) => {
  const { children, style } = props;
  return (
    <TransitionContext.Consumer>
      {transitionContext => (
        <FluidTransitionContext.Consumer>
          {fluidTransitionContext => {
            return (
              <Animated.View {...props} 
                style={[style, Transitions.Horizontal(
                  fluidTransitionContext.getNavigation().state.key,
                  fluidTransitionContext.getTransitionProgress(transitionContext.getTransition(
                    fluidTransitionContext.getNavigation().state.key)),                
                  fluidTransitionContext.getIsForwardDirection(),
                  fluidTransitionContext.getIsTransitioningToRoute())]}
                >
                {children}
              </Animated.View>
            );
          }}
        </FluidTransitionContext.Consumer>
      )}
    </TransitionContext.Consumer>);
};