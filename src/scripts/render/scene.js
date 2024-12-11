import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { ColorCorrectionShader } from 'three/examples/jsm/shaders/ColorCorrectionShader';


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    20, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    500
);

let performanceMode = false;
scene.background = new THREE.Color(0);

let scale = 1.2;
camera.position.set(30 * scale, 34 * scale, 44 * scale);

const renderer = new THREE.WebGLRenderer({
    antialias: !performanceMode,
    logarithmicDepthBuffer: true
});

renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use PCFSoftShadowMap for smoother edges


renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.LinearEncoding;
renderer.physicalCorrectLights = true;
renderer.gammaOutput = true;
renderer.gammaFactor = 0.1;
renderer.shadowMap.enabled = !performanceMode;

document.body.appendChild(renderer.domElement);

// Apply CSS saturate filter
renderer.domElement.style.filter = 'saturate(1.4) contrast(1.4)';

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.2;
controls.zoomSpeed = 1;
controls.maxDistance = 200;
controls.minDistance = 10;

// Ambient light (constant)
// on a scale from 0 to 2, default 1
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
ambientLight.userData = { permanent: true };
scene.add(ambientLight);

// Directional light with shadows
// on a scale from 0 to 6, default 2
const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(-12, 12, 7.5);
directionalLight.castShadow = !performanceMode;

if (!performanceMode) {
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = -50;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.bias = -0.001;
    directionalLight.shadow.radius = 0; // Soft shadow
}

directionalLight.userData = { permanent: true };
scene.add(directionalLight);

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

export default function applyPerformanceMode(mode) {
    performanceMode = mode;

    renderer.antialias = !performanceMode;
    renderer.shadowMap.enabled = !performanceMode;
    directionalLight.castShadow = !performanceMode;

    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

export { scene, camera, renderer, ambientLight, directionalLight };
