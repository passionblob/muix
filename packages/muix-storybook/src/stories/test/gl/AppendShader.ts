export const AppendShader: {
  uniforms: {
    tDiffuse: {value: null | THREE.Texture},
    map: {value: null | THREE.Texture},
  },
  vertexShader: string,
  fragmentShader: string,
} = {
  uniforms: {
    tDiffuse: {value: null},
    map: {value: null},
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
  uniform sampler2D map;

  varying vec2 v_uv;
  
  float getLuminance(vec3 rgb) {
    return dot(rgb, vec3(0.375, 0.5, 0.125));
  }

  void main() {
    vec2 uv = v_uv;
    vec4 texOrigin = texture2D(tDiffuse, uv);
    vec4 texAppended = texture2D(map, uv);

    float luminance = getLuminance(texAppended.rgb);

    gl_FragColor = texOrigin * (1.0 - luminance) + texAppended;
  }
  `,
}