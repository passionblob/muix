import { addDecorator, addParameters, configure } from "@storybook/react"
import { create } from "@storybook/theming"
import { withKnobs } from "@storybook/addon-knobs"
import { loadStories } from '../storyLoader'

addDecorator(withKnobs);
addParameters({
	options: {
		theme: create({
			base: "light",
			brandTitle: "MUIX STORYBOOK",
			brandUrl: "/"
		}),
        isFullscreen: false,
        showPanel: false,
        panelPosition: "right",
        showNav: true,
		isToolshown: true,
		sidebarAnimations: true
	},
	layout: "fullscreen"
});

configure(loadStories, module);
