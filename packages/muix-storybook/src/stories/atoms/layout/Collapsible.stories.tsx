import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Collapsible, CollapsibleHeaderProps } from '@monthem/muix';

const indices = Array(10).fill(0).map((_, i) => i)

const ExampleHeader = (props: CollapsibleHeaderProps) => {
  const { collapsed, toggleCollapsed } = props
  return (
    <View style={styles.header}>
      <Text>I'm collapsible</Text>
      <TouchableOpacity
        onPress={toggleCollapsed}
        style={styles.toggleButton}
      >
        <Text>{collapsed ? "Collapsed" : "Openned"}</Text>
      </TouchableOpacity>
    </View>
  )
}

storiesOf("Atoms/Layout", module)
  .add("Collapsible(Animated)", () => (
    <ScrollView>
      {indices.map((i) => (
        <Collapsible key={i} header={ExampleHeader}>
          <View style={styles.dummyContent} />
        </Collapsible>
      ))}
    </ScrollView>
  ),
  )

const styles = StyleSheet.create({
  dummyContent: {
    height: 300,
    backgroundColor: "lightgrey"
  },
  header: {
    padding: 10,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "ghostwhite",
  },
  toggleButton: {
    padding: 10,
    backgroundColor: "pink",
    borderRadius: 20,
  }
})