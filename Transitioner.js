import React from "react";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import {
  createNavigator,
  StackRouter,
  NavigationProvider,
} from "react-navigation";

export const TransitionContext = React.createContext(null);

const interleaveArrays = (a, b) => {
  let aIndex = 0;
  let bIndex = 0;
  let out = [];
  const ensureItem = item => {
    if (item && out.indexOf(item) === -1) {
      out.push(item);
    }
  };
  while (aIndex <= a.length - 1 || aIndex <= b.length - 1) {
    ensureItem(a[aIndex]);
    aIndex += 1;
    ensureItem(b[bIndex]);
    bIndex += 1;
  }
  return out;
};

const getTransitionOwnerRouteKey = (fromState, toState) => {
  let transitionKey = fromState.routes[fromState.index].key;
  if (toState && toState.index >= fromState.index) {
    transitionKey = toState.routes[toState.index].key;
  }
  return transitionKey;
};

const defaultCreateTransition = transition => {
  return { ...transition };
};

const defaultRunTransition = () => {};

const getStateForNavChange = (props, state) => {
  // by this point we know the nav state has changed and it is safe to provide a new state. static
  // getDerivedStateFromProps will never interrupt a transition (when there is state.transitionRouteKey),
  // and _runTransition runs this after the previous transition is complete.
  const { navigation } = props;
  const nextNavState = navigation.state;

  // Transitions are requested by setting nav state.isTransitioning to true.
  // If false, we set the state immediately without transition
  if (!nextNavState.isTransitioning) {
    return {
      transitions: state.transitions,
      transitionRouteKey: null,
      transitioningFromState: null,
      transitioningFromDescriptors: null,
      navState: nextNavState,
      descriptors: props.descriptors,
    };
  }
  const transitionRouteKey = getTransitionOwnerRouteKey(
    state.navState,
    nextNavState,
  );
  const descriptor =
    props.descriptors[transitionRouteKey] ||
    state.descriptors[transitionRouteKey] ||
    state.transitioningFromDescriptors[transitionRouteKey];
  const { options } = descriptor;
  const createTransition = options.createTransition || defaultCreateTransition;
  const transition =
    state.transitions[transitionRouteKey] ||
    createTransition({
      navigation: props.navigation,
      transitionRouteKey,
    });
  return {
    transitions: {
      ...state.transitions,
      [transitionRouteKey]: transition,
    },
    transitionRouteKey,
    transitioningFromState: state.navState,
    transitioningFromDescriptors: state.descriptors,
    navState: nextNavState,
    descriptors: props.descriptors,
  };
};

export class Transitioner extends React.Component {
  state = {
    // an object of transitions by route key
    transitions: {},
    // if this is present, there is a transition in progress:
    transitionRouteKey: null,
    // this will be the previous nav state and descriptors, when there is a transition in progress
    transitioningFromState: null,
    transitioningFromDescriptors: {},
    // this is the current navigation state and descriptors:
    navState: this.props.navigation.state,
    descriptors: this.props.descriptors,
  };

  // never re-assign this!
  _transitionRefs = {};

  static getDerivedStateFromProps = (props, state) => {
    // Transition only happens when nav state changes
    if (props.navigation.state === state.navState) {
      return state;
    }
    // Never interrupt a transition in progress.
    if (state.transitionRouteKey) {
      return state;
    }
    return getStateForNavChange(props, state);
  };

  async _startTransition() {
    // Put state in function scope, so we are confident that we refer to the exact same state later for getStateForNavChange.
    // Even though our state shouldn't change during the animation.
    const { state } = this;
    const {
      transitions,
      transitionRouteKey,
      transitioningFromState,
      transitioningFromDescriptors,
      navState,
      descriptors,
    } = state;

    const descriptor =
      descriptors[transitionRouteKey] ||
      transitioningFromDescriptors[transitionRouteKey];
    const { runTransition } = descriptor.options;
    const run = runTransition || defaultRunTransition;

    const transition = transitions[transitionRouteKey];
    // Run animation, this might take some time..
    await run(
      transition,
      this._transitionRefs,
      transitioningFromState,
      navState,
    );

    // after async animator, this.props may have changed. re-check it now:
    if (navState === this.props.navigation.state) {
      // Navigation state is currently the exact state we were transitioning to. Set final state and we're done
      this.setState({
        transitionRouteKey: null,
        transitioningFromState: null,
        transitioningFromDescriptors: {},
        // navState and descriptors remain unchanged at this point.
      });
      // Also de-reference old screenRefs by replacing this._transitionRefs
      const toKeySet = new Set(navState.routes.map(r => r.key));
      navState.routes.forEach(r => {
        if (!toKeySet.has(r.key)) {
          delete this._transitionRefs[r.key];
        }
      });
    } else {
      // Navigation state prop has changed during the transtion! Schedule another transition
      this.setState(getStateForNavChange(this.props, state));
    }
  }

  componentDidUpdate(lastProps, lastState) {
    if (
      // If we are transitioning
      this.state.transitionRouteKey &&
      // And this is a new transition,
      lastState.transitioningFromState !== this.state.transitioningFromState
    ) {
      this._startTransition().then(
        () => {},
        e => {
          console.error("Error running transition:", e);
        },
      );
    }
  }

  _transitionContext = {
    getTransition: transitionRouteKey => {
      const { navState, transitionFromState, transitions } = this.state;
      const defaultTransitionKey = getTransitionOwnerRouteKey(
        navState,
        transitionFromState,
      );
      const key = transitionRouteKey || defaultTransitionKey;
      return transitions[key];
    },
  };

  render() {
    const {
      transitions,
      transitionRouteKey,
      transitioningFromState,
      transitioningFromDescriptors,
      navState,
      descriptors,
    } = this.state;

    const mainRouteKeys = navState.routes.map(r => r.key);
    let routeKeys = mainRouteKeys;

    if (transitionRouteKey) {
      if (transitioningFromState) {
        const prevRouteKeys = transitioningFromState.routes.map(r => r.key);
        // While transitioning, our main nav state is navState. But we also need to render screens from the last state, preserving the order
        routeKeys = interleaveArrays(prevRouteKeys, mainRouteKeys);
      }
    }

    return (
      <TransitionContext.Provider value={this._transitionContext}>
        {routeKeys.map((key, index) => {
          const ref =
            this._transitionRefs[key] ||
            (this._transitionRefs[key] = React.createRef());
          const descriptor =
            descriptors[key] || transitioningFromDescriptors[key];
          const C = descriptor.getComponent();

          const backScreenStyles = {}; // FIX THIS:
          // const backScreenRouteKeys = routeKeys.slice(index + 1);
          // const backScreenStyles = backScreenRouteKeys.map(
          //   backScreenRouteKey => {
          //     const backScreenDescriptor =
          //       toDescriptors[backScreenRouteKey] ||
          //       this.state.descriptors[backScreenRouteKey];
          //     const { options } = backScreenDescriptor;
          //     if (!transition || !options.getBehindTransitionAnimatedStyle) {
          //       return {};
          //     }
          //     return options.getBehindTransitionAnimatedStyle(transition);
          //   },
          // );
          let transition = transitions[key];

          return (
            <Animated.View
              style={[{ ...StyleSheet.absoluteFillObject }, backScreenStyles]}
              pointerEvents={"auto"}
              key={key}
            >
              <NavigationProvider value={descriptor.navigation}>
                <C
                  transition={transition}
                  transitions={transitions}
                  transitioningFromState={transitioningFromState}
                  transitioningToState={
                    transitionRouteKey ? this.props.navigation.state : null
                  }
                  transitionRouteKey={transitionRouteKey}
                  navigation={descriptor.navigation}
                  transitionRef={ref}
                />
              </NavigationProvider>
            </Animated.View>
          );
        })}
      </TransitionContext.Provider>
    );
  }
}

const createTransitionNavigator = (routeConfig, opts) => {
  const router = StackRouter(routeConfig, opts);
  const Nav = createNavigator(Transitioner, router);
  return Nav;
};

export default createTransitionNavigator;
