import React from 'react';
import { storiesOf } from '@storybook/react-native';
import { Animated, Text, View } from 'react-native';
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
                    height: 300
                }}
                onContextCreate={onContextCreate}
            />
        </View>
    )
}

function onContextCreate(gl: ExpoWebGLRenderingContext) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0.5, 0.5, 0.5, 1);

    const vertSource = `
    attribute vec4 a_position;
    void main(void) {     
        gl_Position = a_position;
        gl_PointSize = 100.0;
    }
    `
    const fragSource = `
    precision mediump float;
    void main(void) {
        gl_FragColor = vec4(1, 0, 0.5, 1);
    }
    `
    const vert = createShader(gl.VERTEX_SHADER, vertSource);
    const frag = createShader(gl.FRAGMENT_SHADER, fragSource);
    const program = createProgram(vert, frag)
    const positionAttributeLocation = gl.getAttribLocation(program, "a_position")
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

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
    const count = 3;
    gl.drawArrays(primitiveType, offset, count);

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

    function createProgram(vert: WebGLShader, fragmentShader: WebGLShader) {
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

    gl.flush();
    gl.endFrameEXP();
}