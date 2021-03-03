import {addons} from '@storybook/addons'
import {configure} from "@storybook/react-native"
import {loadStories} from "../storyLoader"
import * as customDecorators from "../storybook/decorators"
import {addDecorator} from "../storybook/utils"

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

Object.values(customDecorators)
    .forEach((decorator) => addDecorator(decorator))

configure(loadStories, module)
