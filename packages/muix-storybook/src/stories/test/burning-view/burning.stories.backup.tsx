import React, { CSSProperties } from 'react';
import { storiesOf } from '@storybook/react-native';
import * as PIXI from "pixi.js"
import { getRange } from '@monthem/utils';
import html2canvas from "html2canvas";
import { View, Text, StyleProp, ViewStyle, Image } from 'react-native';
import { StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native';

type BurningViewProps = {
  style?: CSSProperties
}

const canvasWidth = 450
const aspectRatio = 9 / 16
const canvasHeight = canvasWidth / aspectRatio

const frameNumbers = getRange(49, 264).map((i) => {
  const num = getRange(0, (5 - String(i).length - 1)).map(() => "0").join("") + i
  return num
})

const maskImages = frameNumbers.map((num) => {
  return `http://localhost:8887/ae-exports/burn-mask/burn-mask_${num}.png`
})

const fireImages = frameNumbers.map((num) => {
  return `http://localhost:8887/ae-exports/burn-fire/burn-fire_${num}.png`
})

const dummyImage = "http://localhost:8887/assets/dummy.jpeg"


const BurningView: React.FC<BurningViewProps> = ({ children, style }) => {
  const rootRef = React.useRef<HTMLDivElement>(null);
  const _target = React.useRef<HTMLDivElement>(null);
  const app = React.useRef(new PIXI.Application({
    width: canvasWidth,
    height: canvasHeight,
    transparent: true,
  })).current
  const targetTexture = PIXI.Texture.from(dummyImage);
  const fireSprite = PIXI.AnimatedSprite.fromImages(fireImages);
  const maskSprite = PIXI.AnimatedSprite.fromImages(maskImages);

  const magic = async () => {
    if (!_target.current) return;

    // const _tempCanvas = await html2canvas(_target.current)
    // _target.current.style.setProperty("display", "none")
    // const targetImage = _tempCanvas.toDataURL("image/png")

    const targetSprite = new PIXI.Sprite(targetTexture);

    fireSprite.width = app.screen.width;
    fireSprite.height = app.screen.height;
    maskSprite.width = app.screen.width;
    maskSprite.height = app.screen.height;

    targetSprite.width = canvasWidth * 0.6
    targetSprite.height = canvasHeight * 0.6
    targetSprite.x = canvasWidth * 0.2
    targetSprite.y = canvasHeight * 0.2

    maskSprite.blendMode = PIXI.BLEND_MODES.DST_IN

    app.stage.addChild(targetSprite);
    app.stage.addChild(maskSprite);
    app.stage.addChild(fireSprite);

    app.view.style.setProperty("margin-left", `-${canvasWidth * 0.2}px`)
    app.view.style.setProperty("margin-top", `-${canvasHeight * 0.2}px`)

    rootRef.current?.appendChild(app.view)

    fireSprite.gotoAndPlay(0);
    maskSprite.gotoAndPlay(0);
  }

  React.useEffect(() => {
    setTimeout(() => {
      magic()
    }, 1000)

    return () => {
    }
  }, [])

  return (
    <div
      ref={rootRef}
      style={{
        width: canvasWidth * 0.6,
        height: canvasHeight * 0.6,
      }}
    >
      <div ref={_target} style={StyleSheet.flatten([{
        width: canvasWidth * 0.6,
        height: canvasHeight * 0.6,
        position: "absolute",
        left: -10000,
        paddingLeft: 3,
        paddingRight: 3,
        paddingTop: 3,
        paddingBottom: 3,
      }, style])}>
        {children}
      </div>
    </div>
  )
}

const BurningViewStory = () => {
  return (
    <View>
      <BurningView style={{ backgroundColor: "blue" }}>
        <View style={{backgroundColor: "white", margin: 10}}>
          <Text>꺄하하하 재밌다</Text>
          <Text>여기다 살을 좀 더 보태보자</Text>
        </View>
      </BurningView>
    </View>
  )
}

storiesOf("Test/Burning View", module)
  .add("BurningView", () => <BurningViewStory />)
