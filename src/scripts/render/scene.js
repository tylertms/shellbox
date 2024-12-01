import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { ColorCorrectionShader } from 'three/examples/jsm/shaders/ColorCorrectionShader';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(20, window.innerWidth / window.innerHeight, 0.1, 500);

scene.background = new THREE.Color(0);

let scale = 1.2
camera.position.set(30 * scale, 34 * scale, 44 * scale);


const renderer = new THREE.WebGLRenderer({
    antialias: true,
});


renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true; // Enable shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use softer shadows for better performance
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.2;
controls.zoomSpeed = 1;
controls.maxDistance = 200;
controls.minDistance = 10;

// Ambient light (no shadows for performance)
const ambientLight = new THREE.AmbientLight(0xffffff, 1.75);
ambientLight.userData = { permanent: true };
scene.add(ambientLight);

// Directional light with shadows
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.75);
directionalLight.position.set(-12, 12, 7.5);
directionalLight.castShadow = true; // Enable shadows for this light
directionalLight.shadow.mapSize.width = 2048; // Lower resolution for better performance
directionalLight.shadow.mapSize.height = 2048;
directionalLight.shadow.camera.near = -50;
directionalLight.shadow.camera.far = 100;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 50;
directionalLight.shadow.camera.bottom = -50;
directionalLight.shadow.bias = -0.001; // Adjust bias to reduce artifacts
directionalLight.userData = { permanent: true };
scene.add(directionalLight);


window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Post-Processing
const composer = new EffectComposer(renderer);

// RenderPass: Renders the scene normally
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

const saturationPass = new ShaderPass(ColorCorrectionShader);

saturationPass.uniforms['powRGB'].value.set(1.0, 1.0, 1.0); // Default color adjustments
saturationPass.uniforms['mulRGB'].value.set(1.1, 1.1, 1.1); 
composer.addPass(saturationPass);

function animate() {
    controls.update();
    composer.render(); // Use composer instead of renderer
    requestAnimationFrame(animate);
}

animate();

export { scene, camera, renderer };