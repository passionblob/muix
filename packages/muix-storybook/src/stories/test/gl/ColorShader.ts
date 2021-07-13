import chroma from "chroma-js"

export function ColorShader(color: string) {
  const [r, g, b, a] = chroma(color).rgba();
  return {
    uniforms: {
      color: {value: {x: r/255, y: g/255, z: b/255, w: a}}
    },
    vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    uniform vec4 color;
    void main() {
      gl_FragColor = color;
    }
    `,
  }
}