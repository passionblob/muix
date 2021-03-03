import {DecoratorFunction} from "@storybook/addons"
import * as StorybookApi from "@storybook/react-native"

export const addDecorator = (decorator: DecoratorFunction<JSX.Element>): void => {
    StorybookApi.addDecorator(decorator as DecoratorFunction<unknown>)
}