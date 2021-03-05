import { AppRegistry } from 'react-native'
import { withKnobs } from '@storybook/addon-knobs'
import { getStorybookUI, configure } from '@storybook/react-native'

import { name as appName } from '../../app.json'
import { loadStories } from '../storyLoader'
import {addDecorator} from "../storybook/utils"
import * as customDecorators from "../storybook/decorators"

import './rn-addons'

Object.values(customDecorators)
  .forEach((decorator) => addDecorator(decorator))

addDecorator(withKnobs)

configure(loadStories, module)

const StorybookUIRoot = getStorybookUI({
  asyncStorage: null,
})

AppRegistry.registerComponent(appName, () => StorybookUIRoot)

export default StorybookUIRoot
