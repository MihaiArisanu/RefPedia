import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const wp = (percentage) => (percentage * width) / 100;

export const hp = (percentage) => (percentage * height) / 100;