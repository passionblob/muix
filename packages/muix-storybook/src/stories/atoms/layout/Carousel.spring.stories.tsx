import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import WebColors from '@monthem/web-color';
import utils from "@monthem/utils"
import { Carousel, CarouselScrollInterpolator } from "@monthem/muix"
import { animated } from '@react-spring/native';

const carouselItemCount = 10000
const indice = Array(carouselItemCount).fill(0).map((_, i) => i)

const exampleInterpolator: CarouselScrollInterpolator = {
  translateX: (info) => {
    const { width = 300 } = info.layout
    return {
      range: [-1, carouselItemCount - 1],
      output: [-1 * width, (carouselItemCount - 1) * width]
    }
  }
}

const RandomColorBox = ({ index }: { index: number }) => {
  const color = React.useRef(utils.obejct.getRandomEntry(WebColors).value);
  return (
    <View
      key={index}
      style={{
        backgroundColor: color.current,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <Text
        style={{
          backgroundColor: "black",
          padding: 10,
          color: "white",
          fontSize: 30,
          fontWeight: "bold",
        }}
      >
        {index}
      </Text>
    </View>
  )
}

const CarouselStory = () => {
  const carouselRefs = React.useRef<Carousel[]>([])

  const scrollToRandom = () => {
    carouselRefs.current.forEach((carousel) => carousel.scrollToRandom())
  }

  const scrollToPrev = () => {
    carouselRefs.current.forEach((carousel) => carousel.scrollToPrev())
  }

  const scrollToNext = () => {
    carouselRefs.current.forEach((carousel) => carousel.scrollToNext())
  }

  const catchRef = (_ref: Carousel) => {
    if (_ref) {
      carouselRefs.current.push(_ref)
    }
  }

  return (
    <ScrollView>
      <Carousel
        auto
        ref={catchRef}
        items={indice}
        renderItem={({item, index}) => <RandomColorBox index={index} />}
        vertical
        initialIndex={100}
        style={{ height: 100, backgroundColor: "lightgrey", marginBottom: 20 }}
      />
      <Carousel
        auto
        ref={catchRef}
        items={indice}
        renderItem={({item, index}) => <RandomColorBox index={index} />}
        scrollInterpolator={exampleInterpolator}
        style={{ height: 100, backgroundColor: "lightgrey", marginBottom: 20 }}
      />
      <Carousel
        ref={catchRef}
        items={indice.slice(0, 3)}
        infinite={false}
        renderItem={({item, index}) => <RandomColorBox index={index} />}
        scrollInterpolator={customScrollInterpolator1}
        style={{ height: 100, backgroundColor: "lightgrey", marginBottom: 20 }}
      />
      <Carousel
        ref={catchRef}
        items={indice}
        renderItem={({item, index}) => <RandomColorBox index={index} />}
        scrollInterpolator={customScrollInterpolator2}
        style={{ height: 300, backgroundColor: "lightgrey", marginBottom: 20 }}
      />
      <Carousel
        ref={catchRef}
        items={indice}
        renderItem={({item, index}) => <RandomColorBox index={index} />}
        scrollInterpolator={customScrollInterpolator3}
        style={{ height: 300, backgroundColor: "lightgrey", marginBottom: 20 }}
      />
      <Carousel
        ref={catchRef}
        items={indice}
        renderItem={({item, index}) => <RandomColorBox index={index} />}
        scrollInterpolator={customScrollInterpolator4}
        style={{ height: 300, backgroundColor: "lightgrey", marginBottom: 20 }}
      />
      <Carousel
        ref={catchRef}
        items={indice}
        renderItem={({item, index}) => <RandomColorBox index={index} />}
        scrollInterpolator={customScrollInterpolator5}
        hideInactive
        style={{ height: 300, backgroundColor: "lightgrey", marginBottom: 20 }}
      />
      <TouchableOpacity onPress={scrollToRandom}>
        <Text style={{ fontSize: 40, padding: 20, borderWidth: 1 }}>Random</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={scrollToPrev}>
        <Text style={{ fontSize: 40, padding: 20, borderWidth: 1 }}>Prev</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={scrollToNext}>
        <Text style={{ fontSize: 40, padding: 20, borderWidth: 1 }}>Next</Text>
      </TouchableOpacity>
    </ScrollView>
  )
}

const customScrollInterpolator1: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, 0, 1],
    output: [-info.layout.width / 2, 0, info.layout.width / 2],
  }),
  opacity: () => ({
    range: [-1, 0, 1],
    output: [0, 1, 0],
  }),
  zIndex: () => ({
    range: [-1, 0, 1],
    output: [0, 10, 0],
  }),
  scale: (info) => ({
    range: [-1, 0, 1, info.itemLength - 1],
    output: [0.5, 1, 0.5, 0]
  }),
}

const customScrollInterpolator2: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, 0, 4],
    output: [-Math.random() * info.layout.width * 0.5 - info.layout.width * 0.5, -25, 25],
    extrapolate: "clamp",
  }),
  translateY: (info) => ({
    range: [-1, 0, 4],
    output: [Math.random() * 60 - 30, -5, 10],
  }),
  opacity: (info) => ({
    range: [-1, 0, 3, 4],
    output: [0, 1, 0.8, 0],
    extrapolate: "clamp"
  }),
  scale: (info) => ({
    range: [-1, 4],
    output: [0.8, 0.8]
  }),
}

const customScrollInterpolator3: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, 0, 1, info.itemLength - 1],
    output: [-info.layout.width, 0, 100, info.layout.width * (info.itemLength - 1)],
  }),
  opacity: (info) => ({
    range: [-1, 0, info.itemLength - 2, info.itemLength - 1],
    output: [0, 1, 0, 0]
  }),
}

const customScrollInterpolator4: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, 0, 1, info.itemLength - 1],
    output: [0, 0, 100, info.layout.width * (info.itemLength - 1)],
  }),
  height: (info) => ({
    range: [-1, 0, info.itemLength - 2, info.itemLength - 1],
    output: ["0%", "100%", "0%", "0%",]
  }),
}

const customScrollInterpolator5: CarouselScrollInterpolator = {
  translateX: (info) => ({
    range: [-1, 0, 1, info.itemLength - 1],
    output: [-info.layout.width, 0, 100, info.layout.width * (info.itemLength - 1)],
  }),
  rotateZ: (info) => ({
    range: [-1, 0, 1, info.itemLength - 1],
    output: [30, 0, -30]
  }),
}

storiesOf("Atoms/Layout", module)
  .add("Carousel(react-spring)", () => <CarouselStory />)

