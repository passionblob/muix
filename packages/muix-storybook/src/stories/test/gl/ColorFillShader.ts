import chroma from "chroma-js"

export function ColorFillShader(color: string) {
  const [r, g, b, a] = chroma(color).rgba();
  return {
    uniforms: {
      tDiffuse: {value: null},
      color: {value: {x: r/255, y: g/255, z: b/255, w: a}}
    },
    vertexShader: `
    varying vec2 v_uv;
    void main() {
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: ` 
    uniform sampler2D tDiffuse;
    uniform vec4 color;

    varying vec2 v_uv;
    
    void main() {
      vec2 uv = v_uv;
      vec4 tex = texture2D(tDiffuse, uv);

      if (tex.a > 0.0) {
        gl_FragColor = color;
      } else {
        gl_FragColor = vec4(0.0);
      }
    }
    `,
  }
}