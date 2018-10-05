import React from 'react';
import { Text, Image, View } from 'react-native';
import styles from './styles';

export const Avatar = ({ avatar }) => (
  <View style={styles.imageHeader}>
    <AvatarImage source={avatar.source} />
    <Text style={styles.avatarText}>{avatar.name}</Text>
  </View>
);

export const AvatarImage = ({ source }) => (
  <Image source={source} style={styles.avatarImage} />
);

export const SmallAvatarImage = ({ source }) => (
  <Image source={source} style={styles.avatarSmallImage} />
);