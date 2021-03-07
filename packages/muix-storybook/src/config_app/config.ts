import { AppRegistry } from 'react-native'
import { getStorybookUI, configure, addDecorator } from '@storybook/react-native'
import { name as appName } from '../../app.json'
import { loadStories } from '../storyLoader'
import * as customDecorators from "../lib/storybook/decorators"
import CustomUI from "./CustomUI"
import './rn-addons'

Object.values(customDecorators).forEach((decorator) => addDecorator(decorator))

configure(loadStories, module)

getStorybookUI({
  asyncStorage: null,
  onDeviceUI: false,
})

AppRegistry.registerComponent(appName, () => CustomUI)

export default CustomUI
