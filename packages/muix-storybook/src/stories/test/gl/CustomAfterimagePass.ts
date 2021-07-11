import {
	LinearFilter,
	MeshBasicMaterial,
	NearestFilter,
	RGBAFormat,
	ShaderMaterial,
	UniformsUtils,
	WebGLRenderTarget
} from 'three';
import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { CustomAfterImageShader } from "./CustomAfterimageShader"

class CustomAfterimagePass extends Pass {
  shader: typeof CustomAfterImageShader
  uniforms: {[key: string]: {value: any}}
  textureComp: THREE.WebGLRenderTarget
  textureOld: THREE.WebGLRenderTarget
  shaderMaterial: THREE.ShaderMaterial
  compFsQuad: FullScreenQuad
  copyFsQuad: FullScreenQuad

	constructor( damp = 0.96, decay = 0.2 ) {

		super();

		if ( CustomAfterImageShader === undefined ) console.error( 'THREE.CustomAfterimagePass relies on CustomAfterImageShader' );

		this.shader = CustomAfterImageShader;

		this.uniforms = UniformsUtils.clone( this.shader.uniforms );

		this.uniforms[ 'damp' ].value = damp;
		this.uniforms[ 'decay' ].value = decay;

		this.textureComp = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {

			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat

		} );

		this.textureOld = new WebGLRenderTarget( window.innerWidth, window.innerHeight, {

			minFilter: LinearFilter,
			magFilter: NearestFilter,
			format: RGBAFormat

		} );

		this.shaderMaterial = new ShaderMaterial( {

			uniforms: this.uniforms,
			vertexShader: this.shader.vertexShader,
			fragmentShader: this.shader.fragmentShader

		} );

		this.compFsQuad = new FullScreenQuad( this.shaderMaterial );

		const material = new MeshBasicMaterial();
		this.copyFsQuad = new FullScreenQuad( material );

	}

	render(
    renderer: THREE.WebGLRenderer,
    writeBuffer: THREE.WebGLRenderTarget,
    readBuffer: THREE.WebGLRenderTarget
    /*, deltaTime, maskActive*/ 
    ) {

		this.uniforms[ 'tOld' ].value = this.textureOld.texture;
		this.uniforms[ 'tNew' ].value = readBuffer.texture;

		renderer.setRenderTarget( this.textureComp );
		this.compFsQuad.render( renderer );

    //@ts-ignore
		this.copyFsQuad.material.map = this.textureComp.texture;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.copyFsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );

			if ( this.clear ) renderer.clear();

			this.copyFsQuad.render( renderer );

		}

		// Swap buffers.
		const temp = this.textureOld;
		this.textureOld = this.textureComp;
		this.textureComp = temp;
		// Now textureOld contains the latest image, ready for the next frame.

	}

	setSize( width: number, height: number ) {

		this.textureComp.setSize( width, height );
		this.textureOld.setSize( width, height );

	}

}

export { CustomAfterimagePass };