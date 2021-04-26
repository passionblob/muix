import React from 'react';
import {storiesOf} from '@storybook/react-native';
import {StoryFn} from "@storybook/addons"
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import {Box, Proportional, ProportionalProps} from '@monthem/muix'
import chroma from 'chroma-js';

type Case = {
    caseTitle: string
    proportions: ProportionalProps["proportions"]
    style?: ProportionalProps["style"]
}

const cases: Case[] = [
    {
        caseTitle: "비례식으로 크기를 지정합니다",
        proportions: [1, 1],
        style: {flexDirection: "row"}
    },
    {
        caseTitle: "1대1과 2대2는 동일한 비를 갖습니다",
        proportions: [2, 2],
        style: {flexDirection: "row"}
    },
    {
        caseTitle: "1 : 2 : 3으로 크기를 지정한 예시입니다",
        proportions: [1, 2, 3],
        style: {flexDirection: "row"}
    },
    {
        caseTitle: "undefined는 컨텐츠 크기에 맞게 렌더링합니다",
        proportions: [undefined, 3],
        style: {flexDirection: "row"}
    },
    {
        caseTitle: "나머지 공간은 비례식에 따라 크기가 달라집니다",
        proportions: [undefined, 1, 3],
        style: {flexDirection: "row"}
    },
    {
        caseTitle: "undefined의 위치는 상관없습니다",
        proportions: [1, undefined, 3],
        style: {flexDirection: "row"}
    },
    {
        caseTitle: "undefined는 항상 컨텐츠 크기만큼 렌더링합니다",
        proportions: [undefined, undefined],
        style: {flexDirection: "row"}
    },
    {
        caseTitle: "세로로도 렌더링할 수 있습니다",
        proportions: [1, 2, 3, 4],
        style: {flexDirection: "column", flexWrap: "wrap", height: 600}
    },
    {
        caseTitle: "세로로 렌더링할 때에도 undefined는 컨텐츠 크기만큼만 차지합니다",
        proportions: [1, 2, undefined, 4],
        style: {flexDirection: "column", flexWrap: "wrap", height: 600}
    },
]

const ProportionalStory: StoryFn<JSX.Element> = (p) => {
    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {cases.map((storyCase, i) => {
                const {caseTitle, ...props} = storyCase
                const {proportions} = props;
                return (
                    <View key={caseTitle}>
                        <Text style={styles.caseTitle}>{i}) {caseTitle}</Text>
                        <Proportional {...props}>
                            {Array(proportions.length).fill(0).map((_, i) => (
                                <View key={`${caseTitle}_${i}`} style={{
                                    backgroundColor: chroma.random().hex(),
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <View style={styles.proportionTextCircle}>
                                        <Text style={styles.proportionText}>{proportions[i] || "undefined"}</Text>
                                    </View>
                                </View>
                            ))}
                        </Proportional>
                        <Box height={20} />
                    </View>
                )
            })}
        </ScrollView>
    )
}


storiesOf("Molecules/Layout", module)
    .add(
        "Proportional",
        ProportionalStory,
    )


const styles = StyleSheet.create({
    caseTitle: {
        color: "grey",
        fontSize: 16,
        marginBottom: 5,
    },
    proportionText: {
        fontWeight: "bold",
        fontSize: 18,
        color: "white",
    },
    proportionTextCircle: {
        backgroundColor: "rgba(0,0,0,0.2)",
        paddingHorizontal: 10,
        paddingVertical: 5,
        margin: 10,
        borderRadius: 3,
        alignItems: "center",
        justifyContent: "center"
    }
})