type ReadPixelProperty = {
  resolution: {x: number, y: number}
  threshold: {x: number, y: number, z: number, w: number}
}

export function ReadPixelShader({resolution, threshold}: ReadPixelProperty) {
  return {
    uniforms: {
      tDiffuse: {value: null},
      resolution: {value: resolution},
      random: {value: Math.random()},
      threshold: {value: threshold}
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
    uniform vec2 resolution;
    uniform vec4 threshold;
    uniform float random;
  
    varying vec2 v_uv;
    
    void main() {
      vec4 pixels[3000];
      int pixelCount;

      vec2 uv = v_uv;
      bool isFirstLine = uv.y * resolution.y <= 1.0;

      if (!isFirstLine) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      } else {

        // collect visible pixels
        for (float y = 0.0; y < resolution.y; y += 1.0) {
          vec4 pixel = texture(tDiffuse, vec2(uv.x, y/resolution.y));
          if (pixel.r >= threshold.r
            && pixel.g >= threshold.g
            && pixel.b >= threshold.b
            && pixel.a >= threshold.a
          ) {
            pixels[pixelCount] = vec4(uv.x, y/resolution.y, 0.0, 1.0);
            pixelCount += 1;
          }
        }

        if (pixelCount <= 0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        } else {
          int picked = int(floor(random * float(pixelCount)));
          gl_FragColor = pixels[picked];
        }
      }
    }
    `,
  }
}