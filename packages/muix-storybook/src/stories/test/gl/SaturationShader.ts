type SaturationProperty = {
  amount?: number;
}

export function SaturationShader({amount = 1}: SaturationProperty) {
  return {
    uniforms: {
      tDiffuse: {value: null},
      amount: {value: amount},
    },
    vertexShader: `
    varying vec2 v_uv;
    void main() {
      v_uv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
    fragmentShader: `
    varying vec2 v_uv;
    uniform sampler2D tDiffuse;
    uniform float amount;

    vec3 czm_saturation(vec3 rgb, float adjustment) {
      // Algorithm from Chapter 16 of OpenGL Shading Language
      const vec3 W = vec3(0.2125, 0.7154, 0.0721);
      vec3 intensity = vec3(dot(rgb, W));
      return mix(intensity, rgb, adjustment);
    }

    void main() {
      vec2 uv = v_uv;
      vec4 color = texture2D(tDiffuse, uv);
      gl_FragColor = vec4(czm_saturation(color.rgb, amount), color.a);
    }
    `,
  }
}