import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { ExpoWebGLRenderingContext, GLView } from "expo-gl";

storiesOf("Test/WebGL", module)
  .add("Pixi", () => <PixiStory />)

const PixiStory = () => {
  return (
    <GLView
      onContextCreate={(gl) => {
      }}
    />
  )
}

