import * as THREE from "three";
import { GPUComputationRenderer, Variable } from "three/examples/jsm/misc/GPUComputationRenderer";

type GPGPUParticleParams = {
  renderer: THREE.WebGLRenderer
  // power of two is recommended as a input for this.
  fboWidth?: number
  countPerEmit?: number
  positionShader?: string
  colorShader?: string
  lifetime?: number
  dt?: number
}

export class GPGPUParticle extends THREE.Mesh {
  // GPGPU texture size
  private WIDTH = 32;

  private PARTICLE_MAX_COUNT = this.WIDTH * this.WIDTH;
  private PARTICLE_PER_EMIT = this.WIDTH;

  gpuCompute: GPUComputationRenderer

  dtEmitPosition: THREE.DataTexture;
  dtPosition: THREE.DataTexture;
  dtProgress: THREE.DataTexture;
  dtColor: THREE.DataTexture;
  dtSelect: THREE.DataTexture;
  dtToggle: THREE.DataTexture;
  dtComplete: THREE.DataTexture;

  emitPositionVariable: Variable
  positionVariable: Variable
  progressVariable: Variable
  selectVariable: Variable
  toggleVariable: Variable
  completeVariable: Variable
  colorVariable: Variable

  startIndex = 0;
  endIndex = 0;

  positionFBO: THREE.WebGLRenderTarget;
  progressFBO: THREE.WebGLRenderTarget;
  colorFBO: THREE.WebGLRenderTarget;
  toggleFBO: THREE.WebGLRenderTarget;
  emitPositionFBO: THREE.WebGLRenderTarget;
  selectFBO: THREE.WebGLRenderTarget;
  completeFBO: THREE.WebGLRenderTarget;

  compute: GPUComputationRenderer["compute"]

  constructor({
    renderer,
    fboWidth = 32,
    countPerEmit = 16,
    colorShader: _colorShader = colorShader,
    positionShader: _positionShader = positionShader,
    lifetime,
    dt,
  }: GPGPUParticleParams) {
    super();

    this.WIDTH = fboWidth;
    this.PARTICLE_MAX_COUNT = fboWidth * fboWidth;
    this.PARTICLE_PER_EMIT = countPerEmit;

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
    this.positionVariable = this.gpuCompute.addVariable("texturePosition", _positionShader, this.dtPosition);
    this.progressVariable = this.gpuCompute.addVariable("textureProgress", progressShader(lifetime, dt), this.dtProgress);
    this.selectVariable = this.gpuCompute.addVariable("textureSelect", selectShader, this.dtSelect);
    this.toggleVariable = this.gpuCompute.addVariable("textureToggle", toggleShader, this.dtToggle);
    this.completeVariable = this.gpuCompute.addVariable("textureComplete", completeShader, this.dtComplete);
    this.colorVariable = this.gpuCompute.addVariable("textureColor", _colorShader, this.dtColor);

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

      void main() {
        vReference = reference;
        float progress = texture(textureProgress, reference).x;
        vec2 translate = texture(texturePosition, reference).xy * 2.0 - 1.0;
        float scale = 1.0 - progress;

        vec2 tmpPos = position.xy;
        tmpPos.xy *= scale;

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

    const circleGeometry = new THREE.CircleGeometry(0.05);
    this.geometry = this.getParticleGeometry(circleGeometry);
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

  getParticleGeometry(particleGeometry: THREE.BufferGeometry, itemSize = 3) {
    const cloned = cloneGeometryToBuffer(
      particleGeometry,
      this.PARTICLE_MAX_COUNT,
      { x: this.WIDTH, y: this.WIDTH },
      itemSize
    );

    return cloned
  }
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

const positionShader = `
const float dt = 0.016;

float easeOutCubic(float x) {
  return 1.0 - pow(1.0 - x, 3.0);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float progress = texture(textureProgress, uv).x;
  vec2 emitPosition = texture(textureTouch, uv).xy;
  vec2 prev = texture(texturePosition, uv).xy;
  vec2 next = prev;
  vec2 destination = (vec2(random(uv), random(uv + emitPosition)) * 2.0 - 1.0);
  float distanceFactor = 0.1;

  next.xy = emitPosition
    +	easeOutCubic(progress)
    * destination
    * distanceFactor;

  gl_FragColor = vec4(next, 0.0, 1.0);
}
`;


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
  const float duration = ${duration.toPrecision(5)};
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

const colorShader = `
const float dt = 0.016;

float easeOutCubic(float x) {
  return 1.0 - pow(1.0 - x, 3.0);
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float progress = texture(textureProgress, uv).x;
  bool completed = texture(textureComplete, uv).x >= 1.0;
  vec3 prev = texture(textureColor, uv).xyz;
  vec3 next = prev;

  float alpha;
  if (!completed) {
    alpha = 1.0 - (1.0 - easeOutCubic(progress));
  } else {
    alpha = 0.0;
  }

  vec3 color = vec3(random(uv), random(uv + 0.1), random(uv + 0.2));

  gl_FragColor = vec4(color, alpha);
}
`;

function cloneGeometryToBuffer(particleGeometry: THREE.BufferGeometry, count: number, referenceFBOSize: { x: number, y: number }, itemSize = 3) {
  const basePositionBuffer = Array.from(particleGeometry.getAttribute("position").array);
  const baseVertexCount = basePositionBuffer.length / itemSize;
  const baseIndice = particleGeometry.index as THREE.BufferAttribute;

  const indice = [];
  const positionBuffer = [];
  const referenceBuffer = [];

  for (let i = 0; i < count; i += 1) {
    const random = Math.random();

    positionBuffer.push(...basePositionBuffer.map((val) => val * random));

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