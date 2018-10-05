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
  };

  render() {
    const { children, navigation, transitioningFromState, transitioningToState} = this.props;
    return (
      <TransitionContext.Consumer>
        {transitionContext => (
          <FluidTransitionContext.Provider value={this._context}>
            <Animated.View style={[styles.container, Transitions.Horizontal(
              navigation.state.key,
              transitionContext.getTransition(navigation.state.key), 
              transitioningFromState, 
              transitioningToState)]}>
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
    flex: 1,
  }
})
