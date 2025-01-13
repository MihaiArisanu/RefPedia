import React from 'react'
import Home from './Home';
import Mail from './Mail';
import Lock from './Lock';
import User from './User';
import Heart from './Heart';
import Plus from './Plus';
import Search from './Search';
import Location from './Location';
import { theme } from '../../constants/theme';
import Camera from './Camera';
import Edit from './Edit';
import ArrowLeft from './ArrowLeft';
import Notification from './Notification';
import ThreeDotsCircle from './ThreeDotsCircle';
import ThreeDotsHorizontal from './ThreeDotsHorizontal';
import Logout from './logout';
import Image from './Image';
import Video from './Video';
import Show from './Show'
import Fullscreen from './Fullscreen';

const icons = {
    home: Home,
    mail: Mail,
    lock: Lock,
    user: User,
    heart: Heart,
    plus: Plus,
    search: Search,
    location: Location,
    camera: Camera,
    edit: Edit,
    arrowLeft: ArrowLeft,
    threeDotsCircle: ThreeDotsCircle,
    threeDotsHorizontal: ThreeDotsHorizontal,
    logout: Logout,
    image: Image,
    video: Video,
    notification: Notification,
    show: Show,
    fullscreen: Fullscreen,
}

const Icon = ({ name, ...props }) => {
  const IconComponent = icons[name];

  if (!IconComponent) {
      console.error(`Icon "${name}" not found in the icons list.`);
      return null;
  }

  return (
      <IconComponent
          height={props.size || 24}
          width={props.size || 24}
          strokeWidth={props.strokeWidth || 1.9}
          color={theme.colors?.textLight || '#000'}
          {...props}
      />
  );
};

export default Icon;
