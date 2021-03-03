import {DecoratorFunction} from "@storybook/addons"

type ElementDecorator = DecoratorFunction<JSX.Element>

export function defineDecorator(decorator: ElementDecorator): ElementDecorator {
    return decorator;
}