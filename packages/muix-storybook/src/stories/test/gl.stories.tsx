import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { View } from 'react-native';
import { GLView, ExpoWebGLRenderingContext } from "expo-gl"

storiesOf("Test/Shape", module)
    .add(
        "GL/Simple",
        () => <SimpleGLStory />,
    )


const SimpleGLStory = () => {
    return (
        <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center'
        }}>
            <GLView
                style={{
                    width: 300,
                    height: 300,
                    backgroundColor: "lightgrey"
                }}
                onContextCreate={onContextCreate}
            />
        </View>
    )
}

function onContextCreate(gl: ExpoWebGLRenderingContext) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    const vertSource = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;

    void main(void) {
        vec2 zeroToOne = a_position / u_resolution;
        vec2 zeroToTwo = zeroToOne * 2.0;
        vec2 clipSpace = zeroToTwo - 1.0;
        vec2 inversed = clipSpace * vec2(1, -1);
        gl_Position = vec4(inversed, 0, 1);
    }
    `
    const fragSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main(void) {
        gl_FragColor = u_color;
    }
    `
    const vert = createShader(gl.VERTEX_SHADER, vertSource);
    const frag = createShader(gl.FRAGMENT_SHADER, fragSource);
    const program = createProgram(vert, frag)
    gl.useProgram(program);

    const resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution")
    const colorUniformLocation = gl.getUniformLocation(program, "u_color");
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(positionAttributeLocation);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const bufferOffset = 0;
    gl.vertexAttribPointer(
        positionAttributeLocation,
        size,
        type,
        normalize,
        stride,
        bufferOffset,
    )

    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 6;

    gl.uniform2f(resolutionUniformLocation, 300, 300)
    for (let i = 0; i < 50; i += 1) {
        setRectangle(gl, randomInt(300), randomInt(300), randomInt(50), randomInt(50))
        gl.uniform4f(colorUniformLocation, Math.random(), Math.random(), Math.random(), 1)
        gl.drawArrays(primitiveType, offset, count);
    }    

    function createShader(type: number, source: string) {
        const shader = gl.createShader(type)
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        
        const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (success) {
            return shader
        }

        console.log(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
    }

    function createProgram(vert: WebGLShader, frag: WebGLShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vert);
        gl.attachShader(program, frag);
        gl.linkProgram(program);
        
        const success = gl.getProgramParameter(program, gl.LINK_STATUS);
        if (success) {
            return program;
        }
        
        console.log(gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
    }

    function randomInt(range) {
        return Math.floor(Math.random() * range);
    }

    function setRectangle(gl: ExpoWebGLRenderingContext, x: number, y: number, width: number, height: number) {
        const x1 = x;
        const x2 = x + width;
        const y1 = y;
        const y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2
        ]), gl.STATIC_DRAW);
    }

    gl.flush();
    gl.endFrameEXP();
}