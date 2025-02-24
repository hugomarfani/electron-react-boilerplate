import React, { useState, Component, useEffect } from 'react';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as THREE from 'three';

import texture from './Assets/bg.jpg';
import t1 from './Assets/Test.png'
import { lerp } from 'three/src/math/MathUtils';
import frozenLetItGo from '../../assets/audio/frozen_let_it_go.mp3'
import { AiOutlineForward, AiOutlineBackward } from 'react-icons/ai';
import { FaPlay, FaPause } from 'react-icons/fa';

const loadImage = path => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = path;
    img.onload = () => resolve(img);
    img.onerror = e => reject(e);
  });
};

class ShaderVisuals extends Component {
  constructor(props) {
    super(props);
    this.track = props.track
    this.progress = 0
    this.hoverProgress = 10;
    this.rotation = 0
    this.mountRef = React.createRef();
    this.audio = null;

    this.state = {
      isPlaying: false,
      rotation: 0
    };

    this.togglePlayPause = this.togglePlayPause.bind(this);
  }

  togglePlayPause() {
    this.setState((prevState) => ({ isPlaying: !prevState.isPlaying }));
    if (this.state.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play();
    }
  }

  componentDidMount() {
    // Set number of particles
    this.size = 128;
    this.number = this.size * this.size;

    // Create the scene
    this.scene = new THREE.Scene();

    // Set size from container
    this.width = this.mountRef.current.clientWidth;
    this.height = this.mountRef.current.clientHeight;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true
    });
    this.renderer.setClearColor(0xffffff, 1);
    this.renderer.setSize(this.width, this.height);
    this.mountRef.current.appendChild(this.renderer.domElement);

    // Load background texture
    const loader = new THREE.TextureLoader();
    loader.load(texture, texture => {
      this.scene.background = texture;
    });

    // Mouse and raycaster setup (if needed later)
    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.01, 10);
    this.camera.position.z = 1;

    // OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableRotate = false;

    this.time = 0;

    // Load textures and then add objects to the scene
    Promise.all([this.getPixelDataFromImage(t1)]).then(textures => {
      this.textures = textures;
      this.data1 = textures[0];
      this.getPixelDataFromImage(t1);
      this.setupFBO();
      this.mouseEvents();
      this.visualiseMusic();
      this.addObjects();
      this.setupResize();
      this.animate(); // Start the animation loop
    });

  }

  async getPixelDataFromImage(url) {
    let img = await loadImage(url);
    let canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    let ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, img.width, img.height);
    let canvasData = ctx.getImageData(0, 0, img.width, img.height).data;

    let pixels = [];
    for (let i = 0; i < canvasData.length; i += 4) {
      let x = (i / 4) % img.width;
      let y = Math.floor((i / 4) / img.width);
      if (canvasData[i] < 20) {
        pixels.push({ x: x / canvas.width - 0.5, y: 0.5 - y / canvas.height });
      }
    }

    // Create data texture
    const data = new Float32Array(4 * this.number);
    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        const index = 4 * (i * this.size + j);
        let randomPixel = pixels[Math.floor(Math.random() * pixels.length)];
        // Optionally add random noise
        let distributionFactor = 0;
        if (Math.random() < 0.00001) {
          randomPixel = {
            x: (Math.random() - 0.5) * distributionFactor,
            y: (Math.random() - 0.5) * distributionFactor
          };
        }
        data[index + 0] = randomPixel.x + (Math.random() - 0.5) * 0.0001;
        data[index + 1] = randomPixel.y + (Math.random() - 0.5) * 0.0001;
        data[index + 2] = 0;
        data[index + 3] = 1;
      }
    }

    let dataTexture = new THREE.DataTexture(
      data,
      this.size,
      this.size,
      THREE.RGBAFormat,
      THREE.FloatType
    );
    dataTexture.needsUpdate = true;
    return dataTexture;
  }

  mouseEvents() {
    this.planeMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(10,10),
      new THREE.MeshBasicMaterial()
  )

  window.addEventListener('mousemove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = - (e.clientY / window.innerHeight) * 2 + 1;
      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObjects([this.planeMesh]);
      if(intersects.length > 0){
          console.log(intersects[0].point);
          console.log(this.analyser.getAverageFrequency());
          this.simMaterial.uniforms.uMouse.value = intersects[0].point;
      }
    });
  }

  setupResize(){
    window.addEventListener('resize', this.resize.bind(this));
  }

  resize(){
    this.width = this.mountRef.current.clientWidth;
    this.height = this.mountRef.current.clientHeight;
    this.renderer.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  }

  // Frame Buffer Output
  setupFBO(){
    const data = new Float32Array(4 * this.number);
    for(let i = 0; i < this.size; i++){
        for(let j = 0; j < this.size; j++){
            const index = i * this.size + j;
            data[4 * index + 0] = lerp(-0.5, 0.5, Math.random());
            data[4 * index + 1] = lerp(-0.5, 0.5, Math.random());
            data[4 * index + 2] = 0;
            data[4 * index + 3] = 1;
        }
    }

    this.positions = new THREE.DataTexture(data, this.size, this.size, THREE.RGBAFormat, THREE.FloatType);
    this.positions.needsUpdate = true;


    // create FBO scene
    this.sceneFBO = new THREE.Scene();
    this.cameraFBO = new THREE.OrthographicCamera(-1, 1, 1, -1, -2, 2);

    this.cameraFBO.position.set(0, 0, 1);
    this.cameraFBO.lookAt(new THREE.Vector3(0,0,0));

    const simVertexShader = `
        varying vec2 vUv;
        uniform float time;
        void main(){

            vUv = uv;
            vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
            gl_Position = projectionMatrix * mvPosition;
        }`;

    const simFragmentShader = `
        varying vec2 vUv;
        uniform sampler2D uCurrentPosition;
        uniform sampler2D uOriginalPosition;
        uniform float time;
        uniform vec3 uMouse;

        void main(){
            vec2 position = texture2D( uCurrentPosition, vUv ).xy;
            vec2 original = texture2D( uOriginalPosition , vUv ).xy;

            vec2 force = original - uMouse.xy;
            float len = length(force);
            float forceFactor = 1./max(1., len * 100.);

            vec2 positionToGo = original + normalize(force) * forceFactor * 0.1 ;

            position.xy += (positionToGo - position) * 0.05;

            //explosion effect
            // position.xy += normalize(position.xy) * 0.001;

            gl_FragColor = vec4(position, 0., 1.);
            // gl_FragColor =vec4(vUv, 0., 1.);
        }`;



    let geo = new THREE.PlaneGeometry(2, 2, 2, 2);

    this.simMaterial = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe:true
    });

    this.simMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 0},
            uMouse: {value: new THREE.Vector3()},
            uProgress: {value: 0},

            uCurrentPosition: {value: this.data1},
            uOriginalPosition: {value: this.data1},
        },
        vertexShader: simVertexShader,
        fragmentShader: simFragmentShader,
        wireframe: false
    });

    this.simMesh = new THREE.Mesh(geo, this.simMaterial);
    this.sceneFBO.add(this.simMesh);

    this.renderTarget = new THREE.WebGLRenderTarget(this.size, this.size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType
    });

    this.renderTarget1 = new THREE.WebGLRenderTarget(this.size, this.size, {
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        format: THREE.RGBAFormat,
        type: THREE.FloatType
    });
  }


  visualiseMusic(){
    const listeners = new THREE.AudioListener();
    this.camera.add(listeners);

    const sound = new THREE.Audio(listeners);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(frozenLetItGo, buffer => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      this.audio = sound;
    });
    this.analyser = new THREE.AudioAnalyser(sound, 32);
  }

  addObjects(){
    this.geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.number * 3);
    const uvs = new Float32Array(this.number * 2);

    for(let i = 0; i < this.size; i++){
      for(let j = 0; j < this.size; j++){
          const index = 3 * (i * this.size + j);
          positions[index + 0] = (j / this.size) - 0.5;
          positions[index + 1] = (i / this.size) - 0.5;
          positions[index + 2] = 0;

          const index2 = 2 * (i * this.size + j);
          uvs[index2] = j / (this.size - 1);
          uvs[index2 + 1] = i / (this.size - 1);
      }
    }

    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));

    const vertexShader = `
      varying vec2 vUv;
      uniform float time;
      uniform sampler2D uTexture;
      uniform float uFrequency;

      float normalizeFrequency( float f ) {
          return f / 120.;
      }

      vec3 expelParticlesByFrequency(float f, vec3 position) {
          vec2 center = vec2(0.0, 0.0);
          position += f * position * 0.5;
          return position;
      }

      void main(){
          vUv = uv;
          vec3 newpos = position;
          vec4 color = texture2D( uTexture, vUv );
          newpos.xy = color.xy;

          float radius = sqrt( newpos.x * newpos.x + newpos.y * newpos.y );
          float angle = atan( newpos.y, newpos.x ) + time * 0.1;

          float f = normalizeFrequency(uFrequency);
          newpos = expelParticlesByFrequency(f, newpos);

          vec4 mvPosition = modelViewMatrix * vec4( newpos, 1.0 );
          gl_PointSize = (2.0 / -mvPosition.z );
          gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      uniform sampler2D uTexture;
      void main(){
        vec4 color = texture2D( uTexture, vUv );
        vec2 uv = vUv;
        // gl_FragColor = color;
        // Create gradient blue color

        gl_FragColor = vec4(.5, .8 , 1., 1.);
      }
    `;

    this.material = new THREE.ShaderMaterial({
      uniforms: {
        time: {value: 0},
        uTexture: {value: this.positions},
        uFrequency: {value: this.analyser.getAverageFrequency()}
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      depthWrite: false,
      depthTest: false,
      transparent: true
    });

    this.mesh = new THREE.Points(this.geometry, this.material);
    this.scene.add(this.mesh);
  }

  // Rename the animation loop method to 'animate'
  animate = () => {
    this.time += 0.01;

    this.material.uniforms.time.value = this.time;
    this.simMaterial.uniforms.time.value = this.time;
    this.material.uniforms.uFrequency.value = this.analyser.getAverageFrequency();

    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.sceneFBO, this.cameraFBO);
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);

    // swap render targets
    const tmp = this.renderTarget;
    this.renderTarget = this.renderTarget1;
    this.renderTarget1 = tmp;

    this.material.uniforms.uTexture.value = this.renderTarget.texture;
    this.simMaterial.uniforms.uCurrentPosition.value = this.renderTarget1.texture;
    window.requestAnimationFrame(this.animate);
  };

  componentWillUnmount() {
    // Cancel the animation frame if it's running
    cancelAnimationFrame(this.requestID);
    // Remove any event listeners if added (e.g., resize)
    // window.removeEventListener('resize', this.handleResize);
    // Clean up the DOM by removing the renderer's canvas
    if (this.mountRef.current && this.renderer.domElement.parentNode === this.mountRef.current) {
      this.mountRef.current.removeChild(this.renderer.domElement);
    }
  }



  // This is the React lifecycle render method that returns the component's JSX.
  render() {
    return (
      <>
        <div
          ref={this.mountRef}
          style={{
            width: '100%',
            height: '100vh',
            overflow: 'hidden',
            margin: 0,
            padding: 0
          }}
        />
        <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          display: 'flex',

          // The height will shrink as the viewport shrinks:
          maxHeight: '15vh',  // max is 15% of the viewport height
          minHeight: '50px',  // but never go below 50px

          justifyContent: 'center',
          padding: '10px',
          transition: 'all 0.3s ease-in-out',
          zIndex: 2
        }}
        >
          {/* ------- Player Controller -------- */}
          <div
            style={{
              minHeight: '10vh',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '2rem 0',
            }}
          >
            {/* Pill-shaped player container */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#fff',
                borderRadius: '999px',
                width: '650px',
                height: '100px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                position: 'relative',
                overflow: 'hidden',
                padding: '0 1.5rem',
                paddingLeft: '100px', // add padding to the left to accommodate album art
              }}
            >
              {/* Album art */}
              <div
                style={{
                  width: '80px', // increased width
                  height: '80px', // increased height
                  borderRadius: '50%',
                  overflow: 'hidden',
                  marginRight: '1rem',
                  position: 'absolute', // position absolute to fill the corner
                  top: '10px', // adjust top position
                  left: '10px', // adjust left position
                  transform: `rotate(${this.rotation}deg)`,
                  transition: this.isPlaying ? 'none' : 'transform 0.1s linear',
                }}
              >
                <img
                  src={this.track.albumArt}
                  alt={this.track.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              {/* Track info and progress bar side by side */}
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                {/* Title + Artist (top) */}
                <div style={{ marginBottom: '0.5rem' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>
                    {this.track.title}
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#555' }}>
                    {this.track.artist}
                  </p>
                </div>

                {/* Progress bar (bottom) */}
                <div
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    background: '#e0e0e0',
                    position: 'relative',
                    cursor: 'pointer', // add cursor pointer to indicate interactivity
                  }}
                  // onClick={} // add onClick event
                  // onMouseMove={} // add onMouseMove event
                  // onMouseLeave={} // add onMouseLeave event
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${this.progress}%`,
                      background: '#000', // pick any colour you like
                      borderRadius: '4px',
                      transition: 'width 0.1s linear',
                    }}
                  />
                  {this.hoverProgress !== null && (
                    <div
                      style={{
                        height: '100%',
                        width: `${this.hoverProgress}%`,
                        background: 'rgba(85, 85, 85, 0.3)', // ghost bar color
                        borderRadius: '4px',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        pointerEvents: 'none', // make sure it doesn't interfere with clicks
                        transition: 'width 0.1s linear',
                      }}
                    />
                  )}
                </div>
              </div>

              {/* Playback controls */}
              <div
                style={{
                  marginLeft: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  marginRight: '0.5rem',
                }}
              >
                <button  style={iconButtonStyle}>
                  <AiOutlineBackward />
                </button>
                <button onClick={this.togglePlayPause} style={iconButtonStyle}>
                  {this.state.isPlaying ? <FaPause /> : <FaPlay />}
                </button>
                <button style={iconButtonStyle}>
                  <AiOutlineForward />
                </button>
                <button style={iconButtonStyle}>Options</button>
              </div>
            </div>
          </div>
        </div>
        </>
    );
  }
}

const iconButtonStyle = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  cursor: 'pointer',
  margin: '0 0.5rem',
};

export default ShaderVisuals;
