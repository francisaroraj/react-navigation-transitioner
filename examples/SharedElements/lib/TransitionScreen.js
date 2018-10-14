import React from 'react';
import { StyleSheet } from 'react-native';
import Animated from "react-native-reanimated";

import { TransitionContext } from '../../../Transitioner';

import { FluidTransitionContext } from './FluidTransitionContext';
import Transitions from './transitions/';

export class TransitionScreen extends React.Component {
  _context = {
    getNavigation: () => this.props.navigation,
    getTransitioningFromState: () => this.props.transitioningFromState,
    getTransitioningToState: () => this.props.transitioningToState,
    getIsForwardDirection: () => this.getIsForwardDirection(),
    getIsTransitioningToRoute: () => this.getIsTransitioningToRoute(),
    getTransitionProgress: transition => this.getTransitionProgress(transition)
  };

  getIsForwardDirection = () => {
    const {transitioningFromState, transitioningToState} = this.props;
    if(!transitioningFromState || !transitioningToState) return false;
    if(transitioningFromState.index === transitioningToState.index) return true;
    return transitioningFromState.index < transitioningToState.index;
  }

  getIsTransitioningToRoute = () => {
    const { key }  = this.props.navigation.state;
    const {transitioningFromState, transitioningToState} = this.props;
    if (!transitioningToState) return false;
    const { index } = transitioningToState;
        
    return transitioningToState.routes[index].key === key ? true: false;
  }

  getTransitionProgress = transition => {
    const {transitioningFromState, transitioningToState} = this.props;
    if(!transition || (!transitioningFromState && !transitioningToState)) return null;
    const { progress } = transition;
    return progress;
  }

  render() {
    const { children, navigation, transition, transitioningFromState, transitioningToState} = this.props;
    return (
      <TransitionContext.Consumer>
        {transitionContext => (
          <FluidTransitionContext.Provider value={this._context}>
            <Animated.View style={[styles.container, Transitions.Horizontal(
              navigation.state.key,
              this.getTransitionProgress(transition),                
              this.getIsForwardDirection(),
              this.getIsTransitioningToRoute())]}>
              {children}
            </Animated.View>
          </FluidTransitionContext.Provider>
        )}
      </TransitionContext.Consumer>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,    
  }
})
