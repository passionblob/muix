import { AppRegistry } from 'react-native'
import { getStorybookUI, configure, addDecorator } from '@storybook/react-native'
import { addons } from "@storybook/addons"
import { name as appName } from '../../app.json'
import { loadStories } from '../storyLoader'
import * as customDecorators from "../lib/storybook/decorators"
import './rn-addons'
import { ResponsiveProvider } from '@muix/muix-components/src'

Object.values(customDecorators).forEach((decorator) => addDecorator(decorator))

configure(loadStories, module)

const StorybookUI = getStorybookUI({
  asyncStorage: null,
  onDeviceUI: true,
})

const channel = addons.getChannel();
Object.assign(channel, {
  isAsync: false
})

//@ts-ignore
AppRegistry.setWrapperComponentProvider(() => ResponsiveProvider)
AppRegistry.registerComponent(appName, () => StorybookUI)

export default StorybookUI
