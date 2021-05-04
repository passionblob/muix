import React from "react"
import { Transitional } from "@monthem/muix"
import { storiesOf } from "@storybook/react-native"
import { StatusBar, Text, TouchableOpacity, View } from "react-native"

storiesOf("Atoms/Abstract", module)
	.add("Transitional", () => <TransitionalStory />)

const TransitionalStory = () => {
	const [conditions, setConditions] = React.useState([false, false, false, false]);
	const [transitioned, setTransitioned] = React.useState(false)
	const toggleCondition = (index: number) => {
		const toggled = Array(conditions.length).fill(false);
		toggled[index] = !conditions[index]
		setConditions(toggled)
	}

	return (
		<View style={{ flex: 1 }}>
			<View>
				{conditions.map((toggled, i) => (
					<TouchableOpacity key={i} onPress={() => toggleCondition(i)}>
						<Text style={{ padding: 10, borderWidth: 1, backgroundColor: toggled ? "green" : "grey" }}>{i}</Text>
					</TouchableOpacity>
				))}
			</View>

			<Transitional.View
				style={[styles.common, styles[`style${conditions.findIndex((val) => !!val)}`]]}
				config={{
					onTransitionEnd: (finished) => {
						if (finished.finished && !transitioned) {
							setTransitioned(true)
						}
					}
				}}
			>
				<Transitional.Text />
			</Transitional.View>
		</View>
	)
}

const styles = {
	common: {
		width: 200,
		height: 200,
	},
	style0: {
		borderColor: "black",
		backgroundColor: "yellow",
		borderWidth: 10,
		width: 100,
		height: 100,
	},
	style1: {
		backgroundColor: "dodgerblue",
		width: 100,
		height: 400,
		borderWidth: 10,
		borderColor: "blue",
		transform: [
			{ translateX: 100 },
		],
	},
	style2: {
		backgroundColor: "red",
		width: 200,
		height: 300,
		borderColor: "green",
		transform: [
			{ translateX: 200 },
			{ translateY: 100 },
		]
	},
	style3: {
		backgroundColor: "blue",
		width: 300,
		height: 200,
		borderWidth: 30,
		borderColor: "skyblue",
		borderRadius: 100,
		transform: [{ skewX: "0.5rad" }, { scale: 1.2 }]
	},
	style4: {
		backgroundColor: "green",
		width: 400,
		height: 100,
		borderWidth: 40,
		borderColor: "red",
		opacity: 0.5,
	},
	container: {
		flex: 1,
		paddingTop: StatusBar.currentHeight,
		marginHorizontal: 16
	},
	item: {
		backgroundColor: "#f9c2ff",
		padding: 20,
		marginVertical: 8
	},
	header: {
		fontSize: 32,
		backgroundColor: "#fff"
	},
	title: {
		fontSize: 24
	}
}