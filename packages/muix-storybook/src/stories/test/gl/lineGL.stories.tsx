import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { LayoutChangeEvent, PanResponder, View } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"

storiesOf("Test/WebGL", module)
  .add("Line", () => <LineGLStory />)

const LineGLStory = () => {
  let layout = React.useRef({ width: 0, height: 0 });
  const uniform = React.useRef({
    resolution: null,
    color: null,
  }).current;
  const attribute = React.useRef({
    position: null,
  }).current;
  const glRef = React.useRef<ExpoWebGLRenderingContext>();

  const onLayout = (e: LayoutChangeEvent) => {
    layout.current = e.nativeEvent.layout
    if (glRef.current) {
      const gl = glRef.current
      gl.viewport(0, 0, layout.current.width, layout.current.height)
      gl.uniform2f(uniform.resolution, layout.current.width, layout.current.height)
      gl.flush()
    }
  }

  function onContextCreate(_gl: ExpoWebGLRenderingContext) {
    setTimeout(() => {
      glRef.current = _gl
      const gl = glRef.current;

      const a_position = "a_position"
      const u_resolution = "u_resolution"
      const u_color = "u_color"

      const vert = createShader(gl.VERTEX_SHADER)`
      attribute vec2 ${a_position};
      uniform vec2 ${u_resolution};
      
      void main(void) {
        vec2 relativePosition = ${a_position} / ${u_resolution};
        vec2 multiplied = relativePosition * 2.0;
        vec2 normalized = multiplied - 1.0;
        vec2 inversed = normalized * vec2(1, -1);
        gl_Position = vec4(inversed, 0, 1);
      }
      `

      const frag = createShader(gl.FRAGMENT_SHADER)`
      precision mediump float;
      uniform vec4 ${u_color};
      void main(void) {
        gl_FragColor = ${u_color};
      }
      `

      const program = createProgram(vert, frag)
      gl.useProgram(program)

      uniform.resolution = gl.getUniformLocation(program, u_resolution);
      uniform.color = gl.getUniformLocation(program, u_color);
      attribute.position = gl.getAttribLocation(program, a_position);

      gl.enableVertexAttribArray(attribute.position);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

      const bufferSize = 2;
      const bufferType = gl.FLOAT;
      const normalize = false;
      const bufferStride = 0;
      const bufferOffset = 0;

      gl.vertexAttribPointer(
        attribute.position,
        bufferSize,
        bufferType,
        normalize,
        bufferStride,
        bufferOffset
      )

      gl.uniform2f(uniform.resolution, layout.current.width, layout.current.height)
      gl.uniform4f(uniform.color, 1, 0, 0, 1)

      drawCircle({x: 50, y: 100, radius: 50, fragCount: 3, degree: 360})
      drawCircle({x: 150, y: 100, radius: 50, fragCount: 4, degree: 360})
      drawCircle({x: 250, y: 100, radius: 50, fragCount: 5, degree: 360})
      drawCircle({x: 350, y: 100, radius: 50, fragCount: 6, degree: 360})
      drawCircle({x: 50, y: 200, radius: 50, fragCount: 7, degree: 360})
      drawCircle({x: 150, y: 200, radius: 50, fragCount: 8, degree: 360})
      drawCircle({x: 250, y: 200, radius: 50, fragCount: 9, degree: 360})
      drawCircle({x: 350, y: 200, radius: 50, fragCount: 10, degree: 360})
      drawCircle({x: 50, y: 300, radius: 50, fragCount: 100, degree: 360})
      drawCircle({x: 150, y: 300, radius: 50, fragCount: 100, degree: 120})

      gl.flush()
      gl.endFrameEXP()

      function createShader(type: number) {
        const shader = gl.createShader(type)
        return (strings: TemplateStringsArray, ...args: string[]) => {
          const concat = strings
            .map((str, i) => str.concat(args[i] || ""))
            .reduce((acc, str) => acc.concat(str))
          gl.shaderSource(shader, concat)
          gl.compileShader(shader)

          const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
          if (success) return shader
          throw Error("couldn't compile shader")
        }
      }

      function createProgram(vert: WebGLShader, frag: WebGLShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vert);
        gl.attachShader(program, frag);
        gl.linkProgram(program);
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) return program
        throw Error("couldn't link program")
      }

      function drawCircle(option: {degree: number, radius: number, fragCount: number, x: number, y: number}) {
        const {
          degree,
          fragCount,
          radius,
          x,
          y,
        } = option
  
        const degreeDiff = degree / fragCount;
  
        const circleVertices = Array(fragCount).fill(0).map((_, i) => {
          const rad1 = (Math.PI / 180) * degreeDiff * i
          const x1 = Math.cos(rad1) * radius
          const y1 = Math.sin(rad1) * radius
          const rad2 = (Math.PI / 180) * degreeDiff * (i + 1)
          const x2 = Math.cos(rad2) * radius
          const y2 = Math.sin(rad2) * radius
          return [
            x, y,
            x + x1, y + y1,
            x + x2, y + y2
          ]
        }).reduce((acc, ele) => acc.concat(ele))
  
        const primitiveType = gl.TRIANGLES
        const drawOffset = 0
        const drawCount = fragCount * 3
  
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(circleVertices),
          gl.STATIC_DRAW
        )
  
        gl.drawArrays(primitiveType, drawOffset, drawCount)
      }
    })
  }

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <GLView
        style={{
          height: 500,
          width: "100%",
          backgroundColor: "lightgrey"
        }}
        // {...panHandlers}
        onLayout={onLayout}
        onContextCreate={onContextCreate}
      />
    </View>
  )
}
