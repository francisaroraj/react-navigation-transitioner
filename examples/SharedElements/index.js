import React from 'react';
import { View, Text, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { withNavigation, SafeAreaView } from 'react-navigation';
import Animated, { Easing } from "react-native-reanimated";
const { Value, timing, interpolate } = Animated;

import createTransitionNavigator from "../../Transitioner";

import styles from './styles';
import { createItemsData } from './data';

const ImageFooter = () => (
  <View style={styles.imageHeader}>
    
  </View>
);

const AvatarImage = ({ source }) => (
  <Image source={source} style={styles.avatarImage} />
);

const SmallAvatarImage = ({ source }) => (
  <Image source={source} style={styles.avatarSmallImage} />
);

const Avatar = ({ avatar }) => (
  <View style={styles.imageHeader}>
    <AvatarImage source={avatar.source} />
    <Text style={styles.avatarText}>{avatar.name}</Text>
  </View>
);

const Card = ({ navigation, item, id }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.card}
      onPress={() => navigation.navigate('screen2', { id, item })}
      hitSlop={{ left: 20, top: 20, right: 20, bottom: 20 }}
    >
        <Avatar avatar={item.avatar} />
        <Image style={styles.smallImage} source={item.source} />
        <ImageFooter />
  
    </TouchableOpacity>

);

const NavCard = withNavigation(Card);

class Screen1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: [] };
  }

  componentWillMount() {
    this.setState((prevState) => ({ ...prevState, items: createItemsData() }));
  }

  render() {
    const { items } = this.state;
    return (
      <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        {items.map((item, index) => (
          <NavCard
            key={index}
            id={index}
            item={item}
          />
        ))}
      </ScrollView>
      </SafeAreaView>
      );
  }
}

const Comment = ({ comment }) => (
  <View style={styles.commentRow}>
    <SmallAvatarImage source={comment.avatar.source} />
    <Text style={styles.comment}>{comment.text}</Text>
  </View>
);

class Screen2 extends React.Component {
  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.bigCard}>
          <Image style={styles.bigImage} source={navigation.getParam('item').source} />
          <ImageFooter />
          <View style={styles.buttons}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('screen3', { id: navigation.getParam('id'), item: navigation.getParam('item') })}
              >
              <Text>Comments</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.buttons}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold'}}>&lt;-</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class Screen3 extends React.Component {
  render() {
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.bigCard}>
        <ScrollView style={styles.commentsContainer}>
          {navigation.getParam('item').comments.map((comment, index) => (
            <Comment key={index} comment={comment} />
          ))}
        </ScrollView>
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.buttons}
          >
            <Text>Back</Text>
          </TouchableOpacity>
      </SafeAreaView>
    );
  }
}

const ScreenContainer = ({children}) => (
  <Animated.View style={{ flex: 1}}>
    {children}
  </Animated.View>
);

const App = createTransitionNavigator({
    screen1: { screen: Screen1 },
    screen2: { screen: Screen2 },
    screen3: { screen: Screen3 },
  }, {
    navigationOptions : {
      createTransition: transition => ({
        ...transition,
        progress: new Value(0),
      }),
      runTransition: transition =>
        new Promise(resolve => {
          timing(transition.progress, {
            toValue: 1,
            duration: 500,
            easing: Easing.inOut(Easing.cubic),
          }).start(resolve);
      }),
      renderScreen: (ScreenComponent, transition, transitions, transitioningFromState, 
        transitioningToState, transitionRouteKey, navigation, ref) => {
          const myKey = navigation.state.key;
          let opacity = 1;
          if (transition && transitioningFromState) {
            const { progress } = transition;
            const fromOpacity = transitioningFromState.routes.find(r => r.key === myKey,) ? 1 : 0;
            const toOpacity = transitioningToState.routes.find(r => r.key === myKey) ? 1 : 0;
            opacity = interpolate(progress, {
              inputRange: [0, 1],
              outputRange: [fromOpacity, toOpacity],
            });
          }
          return (
            <Animated.View style={[styles.container, { opacity }]}>
              <ScreenComponent navigation={navigation}/>
            </Animated.View>
          );
        },
      renderContainer: (children) => (<ScreenContainer>{children}</ScreenContainer>)
    }
  });

export default App;
