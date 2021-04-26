import { AppRegistry } from 'react-native'
import { getStorybookUI, configure, addDecorator, clearDecorators } from '@storybook/react-native'
import { addons } from "@storybook/addons"
import { name as appName } from '../../app.json'
import { loadStories } from '../storyLoader'
import { globalDecorator } from "../lib/storybook/decorators"
import './rn-addons'

clearDecorators()
addDecorator(globalDecorator)

configure(loadStories, module)

const StorybookUI = getStorybookUI({
  asyncStorage: null,
  onDeviceUI: true,
  disableWebsockets: false,
})

const channel = addons.getChannel();
Object.assign(channel, {
  isAsync: false
})

AppRegistry.registerComponent(appName, () => StorybookUI)

export default StorybookUI
