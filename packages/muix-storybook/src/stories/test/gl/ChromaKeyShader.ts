export const ChromaKeyShader = {
  uniforms: {
    tDiffuse: {value: null},
    color: {value: {x: 0, y: 0, z: 0}},
    similarity: {value: 0.0},
    smoothness: {value: 0.2},
    spill: {value: 0.0},
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
  uniform vec3 color;
  uniform float similarity;
  uniform float smoothness;
  uniform float spill;
  
  precision mediump float;
  
  varying vec2 v_uv;

  // From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
  vec2 RGBtoUV(vec3 rgb) {
    return vec2(
      rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
      rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
    );
  }

  vec4 ProcessChromaKey(sampler2D _tex, vec2 _uv) {
    vec4 rgba = texture2D(_tex, _uv);
    float chromaDist = distance(RGBtoUV(texture2D(_tex, _uv).rgb), RGBtoUV(color));

    float baseMask = chromaDist - similarity;
    float fullMask = pow(clamp(baseMask / smoothness, 0., 1.), 1.5);
    rgba.a = fullMask;

    float spillVal = pow(clamp(baseMask / spill, 0., 1.), 1.5);
    float desat = clamp(rgba.r * 0.2126 + rgba.g * 0.7152 + rgba.b * 0.0722, 0., 1.);
    rgba.rgb = mix(vec3(desat, desat, desat), rgba.rgb, spillVal);

    return rgba;
  }

  void main() {
    vec2 uv = v_uv;
    gl_FragColor = ProcessChromaKey(tDiffuse, uv);
  }
  `,
}