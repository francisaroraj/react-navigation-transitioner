import React from 'react';
import { View, Text, ScrollView, Image, Dimensions, TouchableOpacity } from 'react-native';
import { withNavigation, SafeAreaView } from 'react-navigation';
import Animated from "react-native-reanimated";

import { createFluidNavigator } from './lib/createFluidNavigator';
import { TransitionView } from './lib/TransitionView';

import styles from './styles';
import { createItemsData } from './data';

const ImageFooter = () => (
  <View style={styles.imageHeader}>
    <Text>❤ 😱</Text>
  </View>
);

const Avatar = ({ avatar }) => (
  <View style={styles.imageHeader}>
    <AvatarImage source={avatar.source} />
    <Text style={styles.avatarText}>{avatar.name}</Text>
  </View>
);

const AvatarImage = ({ source }) => (
  <Image source={source} style={styles.avatarImage} />
);

const SmallAvatarImage = ({ source }) => (
  <Image source={source} style={styles.avatarSmallImage} />
);

class Card extends React.Component {
  render() {
    const { item, onSelect } = this.props;
    return (
      <TransitionView style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelect && onSelect(item)}
        >
          <Avatar avatar={item.avatar} />
          <Image style={styles.smallImage} source={item.source} />
          <ImageFooter />
        </TouchableOpacity>
      </TransitionView>
    );
  }
}

class FeedScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = { items: [] };
  }

  componentWillMount() {
    this.setState((prevState) => ({ ...prevState, items: createItemsData() }));
  }

  render() {
    const { items } = this.state;
    const { navigation } = this.props;
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.container}>
          {items.map((item) => (          
            <Card
              key={item.id}
              item={item}
              onSelect={() => navigation.navigate('imageDetails', { item })}
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

class ImageDetailsScreen extends React.Component {
  render() {
    const { navigation } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.bigCard}>
          <View style={styles.bigImageContainer}>
            <Image style={styles.bigImage} source={navigation.getParam('item').source} />
            <ImageFooter />
          </View>          
          <View style={styles.buttons}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('comments', { 
                item: navigation.getParam('item') })
              }
              >
              <Text style={{color:'#04F', textDecorationLine:'underline'}}>Comments</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.buttons}
          onPress={() => navigation.goBack()}
        >
          <Text style={{ color: '#FFF', fontSize: 22, fontWeight: 'bold'}}>←</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class CommentsScreen extends React.Component {
  render() {
    const { navigation } = this.props;
    return (
      <SafeAreaView style={styles.bigCard}>
        <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backHeader}
          >
            <Text style={{ marginRight: 8 }}>←</Text>
            <Text>Back</Text>
          </TouchableOpacity>
        <ScrollView style={styles.commentsContainer}>
          {navigation.getParam('item').comments.map((comment, index) => (
            <Comment key={index} comment={comment} />
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

const routeConfigs = {
  feed: { screen: FeedScreen },
  imageDetails: { screen: ImageDetailsScreen },
  comments: { screen: CommentsScreen },
};

export default createFluidNavigator(routeConfigs);
