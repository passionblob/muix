import React from 'react'
import { Platform } from "react-native"
import { HoverableProps } from './types'
import ReactDOMServer from "react-dom/server"

const triggerMouseEvent = (node: Node, eventType: string) => {
  const mouseEvent = document.createEvent("MouseEvent")
  mouseEvent.initEvent(eventType, true, true)
  node.dispatchEvent(mouseEvent);
}

export class HoverableWeb extends React.Component<HoverableProps> {
  containerRef = React.createRef<HTMLDivElement>()
  handlers: Function[] = []

  get isWeb() {
    return Platform.OS !== "android" && Platform.OS !== "ios"
  }

  componentDidMount() {
    if (!this.isWeb) return
    const {
      style,
      onHoverIn,
      onHoverOut
    } = this.props

    if (!this.containerRef.current) return;

    const getHoverNode = () => {
      if (!style) return null

      const _tempEle = React.createElement("div", { style: style })
      const _rendered = ReactDOMServer.renderToStaticMarkup(_tempEle)
      const _hoverContainer = document.createElement("div")
  
      _hoverContainer.innerHTML = _rendered
      _hoverContainer.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
      `
      const _hoverNode = _hoverContainer.firstChild as HTMLDivElement
      
      _hoverNode.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
        ${_hoverNode.style.cssText}
      `

      return {_hoverContainer, _hoverNode}
    }


    const fragment = document.createDocumentFragment()

    const children = Array.from(this.containerRef.current.children) as HTMLDivElement[]

    children.forEach((child) => {
      const hoverNode = getHoverNode()

      const onMouseDownHoverNode = () => {
        hoverNode?._hoverNode.style.setProperty("display", "none")
        triggerMouseEvent(child, "mousedown")
      }

      hoverNode?._hoverNode.addEventListener("mousedown", onMouseDownHoverNode)

      if (!child.style.position.match(/absolute|fixed/g)) {
        child.style.setProperty("position", "relative")
      }

      const onMouseEnter = () => {
        if (onHoverIn) onHoverIn()
        if (hoverNode?._hoverContainer) {
          child.insertBefore(hoverNode?._hoverContainer, child.firstChild)
        }
      }

      const onMouseLeave = () => {
        if (onHoverOut) onHoverOut()
        if (hoverNode?._hoverContainer) {
          child.removeChild(hoverNode?._hoverContainer)
        }
      }

      const onMouseDown = () => {
        if (hoverNode?._hoverContainer) {
          hoverNode?._hoverNode.style.setProperty("display", "none")
        }
      }
      
      const onMouseUp = () => {
        if (hoverNode?._hoverContainer) {
          triggerMouseEvent(child, "click")
          child.insertBefore(hoverNode?._hoverContainer, child.firstChild)
          hoverNode?._hoverNode.style.setProperty("display", "flex")
        }
      }

      const unsubscribe = () => {
        child.removeEventListener("mouseenter", onMouseEnter)
        child.removeEventListener("mouseleave", onMouseLeave)
        child.removeEventListener("mousedown", onMouseDown)
        child.removeEventListener("mouseup", onMouseUp)
        hoverNode?._hoverNode.addEventListener("mousedown", onMouseDownHoverNode)
      }

      child.addEventListener("mouseenter", onMouseEnter)
      child.addEventListener("mouseleave", onMouseLeave)
      child.addEventListener("mousedown", onMouseDown)
      child.addEventListener("mouseup", onMouseUp)

      this.handlers.push(unsubscribe)
    })

    fragment.append(...children)

    this.containerRef.current.replaceWith(fragment)
  }

  componentWillUnmount() {
    this.handlers.forEach((unsubscribe) => unsubscribe())
  }

  render() {
    const { children } = this.props

    if (React.Children.count(children) > 1) {
      throw Error("Hoverable accepts only one child")
    }

    if (!this.isWeb) return children

    return (
      <div ref={this.containerRef}>
        {children}
      </div>
    )
  }
}
