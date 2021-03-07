import {addons} from '@storybook/addons'
import {configure, addDecorator} from "@storybook/react-native"
import {loadStories} from "../storyLoader"

addons.setConfig({
    isFullscreen: false,
    showNav: true,
    showPanel: true,
    panelPosition: 'bottom',
    sidebarAnimations: true,
    enableShortcuts: true,
    isToolshown: true,
    theme: undefined,
    selectedPanel: undefined,
    initialActive: 'sidebar',
    showRoots: false,
})

configure(loadStories, module)
