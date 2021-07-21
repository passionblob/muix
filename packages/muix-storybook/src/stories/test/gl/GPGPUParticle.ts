import * as THREE from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer";

type GPGPUParticleParams = {
  renderer: THREE.WebGLRenderer
  // power of two is recommended as a input for this.
  fboWidth?: number
  dt?: number
  // particle properties
  rate?: number
  lifetime?: number
  sprayCone?: number
  angle?: number
  size?: number
  initialVelocity?: number
  initialOpacity?: number
  growRate?: number
  xRandomiser?: number
  yRandomiser?: number
  velocityRandomiser?: number
  whirlAngle?: number
  whirlDiversion?: boolean
  swingAngle?: number
  swingCount?: number
  swingCountRandomiser?: number
  swingAngleRandomiser?: number
  sizeRandomiser?: number
  growRateRandomiser?: number
  angleRandomiser?: number
  opacityRandomiser?: number
  opacityRate?: number
  gravity?: number
  acc?: number
  windX?: number
  windY?: number
  windXRandomiser?: number
  windYRandomiser?: number
  hue?: number
  saturation?: number
  lightness?: number
  hueRandomiser?: number
  saturationRandomiser?: number
  lightnessRandomiser?: number
}

export class GPGPUParticle extends THREE.Mesh {
  // GPGPU texture size
  private WIDTH = 32;

  private PARTICLE_MAX_COUNT = this.WIDTH * this.WIDTH;
  private PARTICLE_PER_EMIT = this.WIDTH / 4;

  gpuCompute: GPUComputationRenderer

  dtEmitPosition: THREE.DataTexture;
  dtPosition: THREE.DataTexture;
  dtProgress: THREE.DataTexture;
  dtColor: THREE.DataTexture;
  dtSelect: THREE.DataTexture;
  dtToggle: THREE.DataTexture;
  dtComplete: THREE.DataTexture;
  dtVelocity?: THREE.DataTexture;
  dtAcc?: THREE.DataTexture;

  emitPositionVariable: Variable
  positionVariable: Variable
  progressVariable: Variable
  selectVariable: Variable
  toggleVariable: Variable
  completeVariable: Variable
  colorVariable: Variable
  velocityVariable?: Variable;
  accVariable?: Variable;

  startIndex = 0;
  endIndex = 0;

  positionFBO: THREE.WebGLRenderTarget;
  progressFBO: THREE.WebGLRenderTarget;
  colorFBO: THREE.WebGLRenderTarget;
  toggleFBO: THREE.WebGLRenderTarget;
  emitPositionFBO: THREE.WebGLRenderTarget;
  selectFBO: THREE.WebGLRenderTarget;
  completeFBO: THREE.WebGLRenderTarget;
  velocityFBO?: THREE.WebGLRenderTarget;
  accFBO?: THREE.WebGLRenderTarget;

  compute: GPUComputationRenderer["compute"]

  constructor({
    renderer,
    fboWidth = 32,
    rate = 8,
    lifetime = 1000,
    dt = 1 / 60,
    size = 0.05,
    sizeRandomiser = 0.03,
    sprayCone = 360,
    angle = 0,
    growRate = -0.04,
    growRateRandomiser = 0.03,
    whirlAngle = 0,
    whirlDiversion = false,
    xRandomiser = 0.1,
    yRandomiser = 0.1,
    initialOpacity = 1.0,
    opacityRandomiser = 0,
    opacityRate = -1.0,
    gravity = 0.0,
    initialVelocity = 0.15,
    velocityRandomiser = 0.05,
    windX = 0.0,
    windXRandomiser = 0.0,
    windY = 0.0,
    windYRandomiser = 0.0,
    acc = -0.15,
    angleRandomiser = 0.0,
    hue = 0.0,
    saturation = 1.0,
    lightness = 0.5,
    hueRandomiser = 1.0,
    saturationRandomiser = 0,
    lightnessRandomiser = 0,
    swingAngle = 30.0,
    swingCount = 1.0,
    swingCountRandomiser = 0.0,
    swingAngleRandomiser = 10.0,
  }: GPGPUParticleParams) {
    super();

    this.WIDTH = fboWidth;
    this.PARTICLE_MAX_COUNT = fboWidth * fboWidth;
    this.PARTICLE_PER_EMIT = rate;

    this.gpuCompute = new GPUComputationRenderer(fboWidth, fboWidth, renderer);
    this.compute = this.gpuCompute.compute.bind(this.gpuCompute);

    this.dtEmitPosition = this.gpuCompute.createTexture();
    this.dtPosition = this.gpuCompute.createTexture();
    this.dtProgress = this.gpuCompute.createTexture();
    this.dtColor = this.gpuCompute.createTexture();
    this.dtSelect = this.gpuCompute.createTexture();
    this.dtToggle = this.gpuCompute.createTexture();
    this.dtComplete = this.gpuCompute.createTexture();

    this.emitPositionVariable = this.gpuCompute.addVariable("textureTouch", emitPositionShader, this.dtEmitPosition);
    this.positionVariable = this.gpuCompute.addVariable("texturePosition",
      positionShader({
        angle,
        sprayCone,
        whirlAngle,
        whirlDiversion,
        angleRandomiser,
        gravity,
        windX,
        windXRandomiser,
        windY,
        windYRandomiser,
        initialVelocity,
        velocityRandomiser,
        lifetime,
        acc,
        swingCount,
        swingAngle,
        swingCountRandomiser,
        swingAngleRandomiser,
      }),
      this.dtPosition);
    this.progressVariable = this.gpuCompute.addVariable("textureProgress", progressShader(lifetime, dt), this.dtProgress);
    this.selectVariable = this.gpuCompute.addVariable("textureSelect", selectShader, this.dtSelect);
    this.toggleVariable = this.gpuCompute.addVariable("textureToggle", toggleShader, this.dtToggle);
    this.completeVariable = this.gpuCompute.addVariable("textureComplete", completeShader, this.dtComplete);
    this.colorVariable = this.gpuCompute.addVariable("textureColor",
      colorShader({
        initialOpacity,
        opacityRandomiser,
        opacityRate,
        lifetime,
        hue,
        saturation,
        lightness,
        hueRandomiser,
        saturationRandomiser,
        lightnessRandomiser,
      }),
      this.dtColor)
      ;

    this.gpuCompute.setVariableDependencies(this.positionVariable, [this.positionVariable, this.progressVariable, this.emitPositionVariable]);
    this.gpuCompute.setVariableDependencies(this.progressVariable, [this.progressVariable, this.toggleVariable, this.completeVariable]);
    this.gpuCompute.setVariableDependencies(this.selectVariable, [this.selectVariable]);
    this.gpuCompute.setVariableDependencies(this.toggleVariable, [this.selectVariable, this.progressVariable, this.toggleVariable, this.completeVariable]);
    this.gpuCompute.setVariableDependencies(this.completeVariable, [this.completeVariable, this.toggleVariable, this.progressVariable, this.selectVariable]);
    this.gpuCompute.setVariableDependencies(this.colorVariable, [this.colorVariable, this.progressVariable, this.completeVariable]);
    this.gpuCompute.setVariableDependencies(this.emitPositionVariable, [this.toggleVariable, this.selectVariable, this.emitPositionVariable]);

    const error = this.gpuCompute.init();

    if (error) {
      console.error(error);
    }

    this.positionFBO = this.gpuCompute.getCurrentRenderTarget(this.positionVariable) as THREE.WebGLRenderTarget;
    this.progressFBO = this.gpuCompute.getCurrentRenderTarget(this.progressVariable) as THREE.WebGLRenderTarget;
    this.colorFBO = this.gpuCompute.getCurrentRenderTarget(this.colorVariable) as THREE.WebGLRenderTarget;

    this.toggleFBO = this.gpuCompute.getCurrentRenderTarget(this.toggleVariable) as THREE.WebGLRenderTarget;
    this.emitPositionFBO = this.gpuCompute.getCurrentRenderTarget(this.emitPositionVariable) as THREE.WebGLRenderTarget;
    this.selectFBO = this.gpuCompute.getCurrentRenderTarget(this.selectVariable) as THREE.WebGLRenderTarget;
    this.completeFBO = this.gpuCompute.getCurrentRenderTarget(this.completeVariable) as THREE.WebGLRenderTarget;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        textureColor: { value: this.colorFBO.texture },
        texturePosition: { value: this.positionFBO.texture },
        textureProgress: { value: this.progressFBO.texture },
      },
      vertexShader: `
      uniform sampler2D texturePosition;
      uniform sampler2D textureProgress;
      attribute vec2 reference;
      varying vec2 vReference;

      const float lifetime = ${lifetime}.0;
      const float growRate = ${growRate.toPrecision(5)};
      const float growRateRandomiser = ${growRateRandomiser.toPrecision(5)};
      const float size = ${size.toPrecision(5)};
      const vec2 xyRandomiser = vec2(${xRandomiser.toPrecision(5)}, ${yRandomiser.toPrecision(5)});

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vReference = reference;
        float progress = texture(textureProgress, reference).x;
        vec2 translate = texture(texturePosition, reference).xy * 2.0 - 1.0;
        float elapsed = lifetime * progress;
        float growRateRandomiserFactor = -growRateRandomiser/2.0 + random(vReference) * growRateRandomiser;
        float growRateScale = (growRate + sign(growRate) * growRateRandomiserFactor) / size;
        float scale = max(1.0 + growRateScale * elapsed / 1000.0, 0.0);

        vec2 xyRandomiserFactor = -xyRandomiser/2.0 + vec2(random(vReference), random(vReference + 1.0)) * xyRandomiser;

        vec2 tmpPos = position.xy;
        tmpPos.xy *= scale;
        tmpPos.xy += xyRandomiserFactor;

        vec2 newPos = tmpPos.xy + translate;

        gl_Position = projectionMatrix * viewMatrix * vec4(newPos, 0.0, 1.0);
      }
      `,
      fragmentShader: `
      uniform sampler2D textureColor;
      varying vec2 vReference;

      void main() {
        vec4 color = texture(textureColor, vReference);

        gl_FragColor = color;
      }
      `,
      transparent: true
    });

    const circleGeometry = new THREE.CircleGeometry(size);
    this.geometry = this.getParticleGeometry({
      count: this.PARTICLE_MAX_COUNT,
      particleGeometry: circleGeometry,
      referenceFBOSize: { x: this.WIDTH, y: this.WIDTH },
      size,
      sizeRandomiser,
    });
    this.material = material;

    this.positionVariable.material.uniforms['emitPosition'] = {
      value: { x: 0, y: 0 }
    }

    this.selectVariable.material.uniforms['startIndex'] = {
      value: 0
    }

    this.selectVariable.material.uniforms['endIndex'] = {
      value: 0
    }

    this.emitPositionVariable.material.uniforms['emitPosition'] = {
      value: { x: 0, y: 0 }
    }
  }

  emit(x: number, y: number) {
    if (this.startIndex === this.endIndex) {
      this.endIndex += this.PARTICLE_PER_EMIT;
      this.endIndex %= this.PARTICLE_MAX_COUNT;
    } else {
      this.startIndex += this.PARTICLE_PER_EMIT;
      this.startIndex %= this.PARTICLE_MAX_COUNT;
      this.endIndex += this.PARTICLE_PER_EMIT;
      this.endIndex %= this.PARTICLE_MAX_COUNT;
    }

    this.positionVariable.material.uniforms['emitPosition'] = {
      value: { x, y }
    }

    this.selectVariable.material.uniforms['startIndex'] = {
      value: this.startIndex
    }

    this.selectVariable.material.uniforms['endIndex'] = {
      value: this.endIndex
    }

    this.emitPositionVariable.material.uniforms['emitPosition'] = {
      value: { x, y }
    }
  }

  getParticleGeometry = cloneGeometryToBuffer
}


const emitPositionShader = `
uniform vec2 emitPosition;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  bool toggled = texture(textureToggle, uv).x >= 1.0;
  bool selected = texture(textureSelect, uv).x >= 1.0;
  vec2 prev = texture(textureTouch, uv).xy;
  vec2 next = prev;

  if (selected && !toggled) {
    next = emitPosition;
  }

  gl_FragColor = vec4(next, 0.0, 1.0);
}
`;

interface PositionShaderParams {
  angle: number,
  sprayCone: number,
  whirlAngle: number,
  whirlDiversion: boolean,
  angleRandomiser: number
  gravity: number
  windX: number
  windY: number
  windXRandomiser: number
  windYRandomiser: number
  initialVelocity: number,
  velocityRandomiser: number,
  lifetime: number,
  acc: number,
  swingAngle: number,
  swingCount: number,
  swingAngleRandomiser: number,
  swingCountRandomiser: number,
}

function positionShader({
  angle,
  sprayCone,
  whirlAngle,
  whirlDiversion,
  angleRandomiser,
  gravity,
  windX,
  windXRandomiser,
  windY,
  windYRandomiser,
  acc,
  initialVelocity,
  velocityRandomiser,
  lifetime,
  swingAngle,
  swingCount,
  swingAngleRandomiser,
  swingCountRandomiser,
}: PositionShaderParams) {
  return `
  const float dt = 0.016;
  const float cone = ${sprayCone.toPrecision(5)};
  const float angle = ${angle.toPrecision(5)};
  const float whirlAngle = ${whirlAngle.toPrecision(5)};
  const bool whirlDiversion = ${whirlDiversion};
  
  const float angleRandomiser = ${angleRandomiser.toPrecision(5)};
  const float gravity = ${gravity.toPrecision(5)};
  const float windX = ${windX.toPrecision(5)};
  const float windY = ${windY.toPrecision(5)};
  const float windXRandomiser = ${windXRandomiser.toPrecision(5)};
  const float windYRandomiser = ${windYRandomiser.toPrecision(5)};

  const float acc = ${acc.toPrecision(5)};
  const float lifetime = ${lifetime}.0;
  const float initialVelocity = ${initialVelocity.toPrecision(5)};
  const float velocityRandomiser = ${velocityRandomiser.toPrecision(5)};

  const float swingAngle = ${swingAngle.toPrecision(5)};
  const float swingCount = ${swingCount.toPrecision(5)};
  const float swingAngleRandomiser = ${swingAngleRandomiser.toPrecision(5)};
  const float swingCountRandomiser = ${swingCountRandomiser.toPrecision(5)};
  
  float easeOutCubic(float x) {
    return 1.0 - pow(1.0 - x, 3.0);
  }
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float randomise(float randomiser, vec2 randomVec2) {
    return -randomiser / 2.0 + random(randomVec2) * randomiser;
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float progress = texture(textureProgress, uv).x;
    vec2 emitPosition = texture(textureTouch, uv).xy;
    vec2 prev = texture(texturePosition, uv).xy;
    vec2 next = prev;

    float coneAngleFactor = mod(random(uv)*360.0, cone) - cone / 2.0;
    float whirlAngleFactor = whirlAngle;
    
    if (whirlDiversion) {
      whirlAngleFactor *= (step(0.5, random(uv + 1.0)) * 2.0 - 1.0);
    }

    float randomAngle = randomise(angleRandomiser, uv + progress);

    float randomisedSwingAngle = swingAngle + randomise(swingAngleRandomiser, uv + 0.123);
    float randomisedSwingCount = swingCount + randomise(swingCountRandomiser, uv - 0.325);
    float swingAngleFactor = sin(progress * radians(360.0 * 2.0 * randomisedSwingCount)) * randomisedSwingAngle;

    float angle = radians(angle + coneAngleFactor + whirlAngleFactor * progress + randomAngle + swingAngleFactor);

    vec2 angleVector = vec2(cos(angle), sin(angle));

    float elapsed = progress * lifetime / 1000.0;
    float randomVelocity = -velocityRandomiser/2.0 + velocityRandomiser * random(uv);
    float velocity = initialVelocity + acc * elapsed + randomVelocity;
 
    vec2 gravityVector = vec2(0.0, -gravity);

    float windXFactor = windX - windXRandomiser + windXRandomiser * random(uv) * 2.0;
    float windYFactor = windY - windYRandomiser + windYRandomiser * random(uv) * 2.0;

    vec2 windVector = vec2(windXFactor, windYFactor);
    
    if (progress <= 0.0) {
      next.xy = emitPosition;
    } else {
      next.xy +=
      velocity * angleVector * dt
      + gravityVector * dt
      + windVector * dt;
    }
  
    gl_FragColor = vec4(next, 1.0 - progress, 1.0);
  }
  `;
}

const selectShader = `
uniform float startIndex;
uniform float endIndex;

float isSelected() {
  float result = 0.0;
  float index = resolution.x * gl_FragCoord.y + gl_FragCoord.x - resolution.x / 2.0;

  if (startIndex < endIndex) {
    if (index >= startIndex && index < endIndex) {
      result = 1.0;
    }
  } else {
    if (index >= startIndex || index < endIndex) {
      result = 1.0;
    }
  }

  if (floor(startIndex) == floor(endIndex)) {
    result = 0.0;
  }

  return result;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float next = isSelected();

  gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
}
`;

const toggleShader = `
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float progress = texture(textureProgress, uv).x;
  bool selected = texture(textureSelect, uv).x >= 1.0;
  bool completed = texture(textureComplete, uv).x >= 1.0;
  float prev = texture(textureToggle, uv).x;
  float next = prev;

  if (selected && !completed) {
    next = 1.0;
  }

  if (completed) {
    next = 0.0;
  }
  
  gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
}
`;

const completeShader = `
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float progress = texture(textureProgress, uv).x;
  bool toggled = texture(textureToggle, uv).x >= 1.0;
  bool selected = texture(textureSelect, uv).x >= 1.0;
  float prev = texture(textureComplete, uv).x;
  float next = prev;

  if (toggled && progress >= 1.0) {
    next = 1.0;
  }

  if (!selected && prev >= 1.0) {
    next = 0.0;
  }
  
  gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
}
`;

function progressShader(duration = 1000, dt = 1 / 60) {
  return `
  const float duration = ${duration}.0;
  const float dt = ${dt.toPrecision(5)};
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    bool toggled = texture(textureToggle, uv).x >= 1.0;
    bool completed = texture(textureComplete, uv).x >= 1.0;
    float prev = texture(textureProgress, uv).x;
    float next = prev;

    if (toggled) {
      next += dt * (1000.0 / duration);
    }
  
    if (completed) {
      next = 0.0;
    }
  
    gl_FragColor = vec4(next, 0.0, 0.0, 1.0);
  }		
  `;
}

type ColorShaderParams = {
  initialOpacity: number
  opacityRandomiser: number
  opacityRate: number
  lifetime: number
  hue: number
  saturation: number
  lightness: number
  hueRandomiser: number
  saturationRandomiser: number
  lightnessRandomiser: number
}

function colorShader({
  initialOpacity,
  opacityRandomiser,
  opacityRate,
  lifetime,
  hue,
  saturation,
  lightness,
  hueRandomiser,
  lightnessRandomiser,
  saturationRandomiser,
}: ColorShaderParams) {
  return `
  const float dt = 0.016;
  const float opacity = ${initialOpacity.toPrecision(5)};
  const float opacityRandomiser = ${opacityRandomiser.toPrecision(5)};
  const float opacityRate = ${opacityRate.toPrecision(5)};
  const float lifetime = ${lifetime}.0;
  const float hueRandomiser = ${hueRandomiser.toPrecision(5)};
  const float lightnessRandomiser = ${lightnessRandomiser.toPrecision(5)};
  const float saturationRandomiser = ${saturationRandomiser.toPrecision(5)};
  const float hue = ${hue.toPrecision(5)};
  const float saturation = ${saturation.toPrecision(5)};
  const float lightness = ${lightness.toPrecision(5)};

  vec3 rgbToHsl(float r, float g, float b){
    float maxColor = max(max(r, g), b);
    float minColor = min(min(r, g), b);
    float h, s, l = (maxColor + minColor) / 2.0;

    if (maxColor == minColor) {
      h = s = 0.0;
    } else {
      float d = maxColor - minColor;

      if (l > 0.5) {
        s = d / (2.0 - maxColor - minColor);
      } else {
        s = d / (maxColor + minColor);
      }

      if (maxColor == r) {
        float constant;
        if (g < b) {
          constant = 6.0;
        } else {
          constant = 0.0;
        }
        h = (g-b)/d + constant;
      } else if (maxColor == g) {
        h = (b-r)/d + 2.0;
      } else if (maxColor == b) {
        h = (r-g)/d + 4.0;
      }
  
      h /= 6.0;
    }

    return vec3(h, s, l);
  }

  float hueToRgb(float p, float q, float t) {
    if (t < 0.0) t += 1.0;
    if (t > 1.0) t -= 1.0;
    if (t < 1.0/6.0) return p + (q-p) * 6.0 * t;
    if (t < 1.0/2.0) return q;
    if (t < 2.0/3.0) return p + (q-p) * (2.0/3.0 - t) * 6.0;
    return p;
  }

  vec3 hslToRgb(float h, float s, float l) {
    float r, g, b;

    if (s == 0.0) {
      r = g = b = l;
    } else {
      float q;

      if (l < 0.5) {
        q = l * (1.0 + s);
      } else {
        q = l + s - l * s;
      }

      float p = 2.0 * l - q;

      r = hueToRgb(p, q, h + 1.0/3.0);
      g = hueToRgb(p, q, h);
      b = hueToRgb(p, q, h - 1.0/3.0);
    }

    return vec3(r, g, b);
  }
  
  float easeOutCubic(float x) {
    return 1.0 - pow(1.0 - x, 3.0);
  }
  
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float normalizeRandomiser(float randomiser, float offset) {
    vec2 uv = gl_FragCoord.xy / resolution;
    return -randomiser / 2.0 + randomiser * random(uv + offset);
  }

  float normalizeRandomiser(float randomiser) {
    vec2 uv = gl_FragCoord.xy / resolution;
    return -randomiser / 2.0 + randomiser * random(uv);
  }
  
  void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float progress = texture(textureProgress, uv).x;
    bool completed = texture(textureComplete, uv).x >= 1.0;
    vec3 prev = texture(textureColor, uv).xyz;
    vec3 next = prev;
    float baseOpacity = opacity - normalizeRandomiser(opacityRandomiser);
    float rateMultiplier = easeOutCubic(progress) * lifetime / 1000.0;

    float h = hue + normalizeRandomiser(hueRandomiser, 1.0);
    float s = saturation + normalizeRandomiser(saturationRandomiser, -1.0);
    float l = lightness + normalizeRandomiser(lightnessRandomiser, 0.5);
    vec3 rgb = hslToRgb(h, s, l);
  
    float alpha;
    if (!completed) {
      alpha = baseOpacity + rateMultiplier * opacityRate;
    } else {
      alpha = 0.0;
    }

    if (progress <= 0.0) {
      alpha = 0.0;
    }
    
    gl_FragColor = vec4(rgb, alpha);
  }
  `;
}

type CloneGeometryToBufferParams = {
  particleGeometry: THREE.BufferGeometry,
  count: number,
  referenceFBOSize: { x: number, y: number },
  size?: number,
  sizeRandomiser?: number,
  itemSize?: number
}

function cloneGeometryToBuffer({
  count,
  particleGeometry,
  referenceFBOSize,
  sizeRandomiser = 0,
  size = 0.05,
  itemSize = 3,
}: CloneGeometryToBufferParams) {
  const basePositionBuffer = Array.from(particleGeometry.getAttribute("position").array);
  const baseVertexCount = basePositionBuffer.length / itemSize;
  const baseIndice = particleGeometry.index as THREE.BufferAttribute;

  const indice = [];
  const positionBuffer = [];
  const referenceBuffer = [];

  const randomiserScale = sizeRandomiser / size;

  for (let i = 0; i < count; i += 1) {
    const random = Math.random();

    positionBuffer.push(...basePositionBuffer.map((val) => {
      const randomScale = Math.max(1 - randomiserScale / 2 + random * randomiserScale, 0);
      return val * randomScale
    }));

    for (let j = 0; j < baseIndice.array.length; j += 1) {
      const index = baseIndice.array[j];
      indice.push(baseVertexCount * i + index);
    }

    for (let j = 0; j < baseVertexCount; j += 1) {
      const x = (i % referenceFBOSize.x) / referenceFBOSize.x;
      const y = Math.floor(i / referenceFBOSize.y) / referenceFBOSize.y;
      referenceBuffer.push(x, y);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indice);
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positionBuffer, itemSize));
  geometry.setAttribute("reference", new THREE.Float32BufferAttribute(referenceBuffer, 2));

  return geometry;
}


function getPointGeometry(count: number, referenceFBOSize: { x: number, y: number }) {
  const positionBuffer = [];
  const referenceBuffer = [];

  for (let i = 0; i < count; i += 1) {
    positionBuffer.push(0, 0, 0);

    const x = (i % referenceFBOSize.x) / referenceFBOSize.x;
    const y = Math.floor(i / referenceFBOSize.y) / referenceFBOSize.y;
    referenceBuffer.push(x, y);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positionBuffer, 3));
  geometry.setAttribute("reference", new THREE.Float32BufferAttribute(referenceBuffer, 2));

  return geometry;
}