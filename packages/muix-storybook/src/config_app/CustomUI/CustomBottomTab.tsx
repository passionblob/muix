import { Conditional, SupportedComponent } from '@muix/muix-components/src';
import React, { Component, Fragment } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

export class CustomBottomTab extends Component<CustomBottomTabProps, CustomBottomTabState> {
    render() {
        const {tabs} = this.props;
        return (
            <SafeAreaView style={styles.wrapper}>
                <Tabs tabs={tabs} />
            </SafeAreaView>
        )
    }
}

const Tabs: React.FC<TabsProps> = (props) => {
    const {tabs} = props;
    return (
        <View style={styles.tabContainer}>
            {tabs.map(({text, onPressTab, active}, i) => (
                <Fragment key={text}>
                    <Tab text={text} onPressTab={onPressTab} active={active} />
                    <Conditional
                        shouldRender={i < tabs.length - 1}
                        component={View}
                        props={{style: styles.tabSeperator}}
                    />
                </Fragment>
            ))}
        </View>
    )
}

const Tab: React.FC<TabProps> = (props) => {
    const {text, onPressTab, active} = props;
    const textStyle = [styles.tabText, active && styles.tabTextActiveStyle]
    return (
        <TouchableOpacity onPress={onPressTab} style={styles.tab}>
            <Text style={textStyle}>{text}</Text>
        </TouchableOpacity>
    )
}

interface CustomBottomTabProps {
    tabs: TabProps[]
}

interface CustomBottomTabState {
    current: string
}

type TabsProps = {
    tabs: TabProps[]
}

type TabProps = {
    active: boolean
    text: string
    onPressTab: () => any
}

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: "white",
    },
    tabContainer: {
        height: 50,
        width: "100%",
        flexDirection: "row",
        borderBottomWidth: 1,
        borderTopWidth: 1,
        borderColor: "lightgrey"
    },
    tabSeperator: {
        width: 1,
        height: "100%",
        backgroundColor: "lightgrey",
    },
    tab: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    tabText: {
        color: "grey"
    },
    tabTextActiveStyle: {
        fontWeight: "bold",
        color: "black",
    }
})

export default CustomBottomTab
