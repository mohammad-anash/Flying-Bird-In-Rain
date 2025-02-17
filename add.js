import * as THREE from 'three';
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { calcNURBSDerivatives } from 'three/examples/jsm/curves/NURBSUtils.js';

// canvas
const canvas = document.getElementById('canvas');

// screen size
let [width, height] = [window.innerWidth, window.innerHeight];

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(75, width / height);
camera.position.z = 10;
camera.position.y = 10;

// screen resize functionality
window.addEventListener('resize', (event) => {
  width = window.innerWidth;
  height = window.innerHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

let mixer = null;

// GLTFLoader
const gltfLoader = new GLTFLoader();
gltfLoader.load('3d model/scene.gltf', (gltf) => {
  // apply animation
  mixer = new THREE.AnimationMixer(gltf.scene);
  const action = mixer.clipAction(gltf.animations[0]);

  // add shadow
  const model = gltf.scene;
  model.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      child.material.side = THREE.DoubleSide;
    }
  });

  action.play();
  // make little bit small model and fix it in rigth position
  gltf.scene.position.y = 3;
  gltf.scene.rotation.y = -1.5;
  gltf.scene.scale.set(0.1, 0.1, 0.1);

  scene.add(gltf.scene);
});

// directionalLight  for shadows
const directionalLight = new THREE.DirectionalLight('white', 2.5);
directionalLight.castShadow = true;

directionalLight.position.set(-3, 6, 0);
scene.add(directionalLight);

directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;

// controls for move around object
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const raycaster = new THREE.Raycaster();
const rayOrigin = new THREE.Vector3(0, 0.1, 0); // Slightly above the floor
const rayDirection = new THREE.Vector3(0, -1, 0); // Pointing downward
rayDirection.normalize();

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial()
);

floor.rotation.x = -(Math.PI / 2);
floor.receiveShadow = true;
scene.add(floor);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('textures/particles/1.png');

let getDrops = null;

function generateRainsDrop(rainCount) {
  const rainGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(rainCount * 3);

  for (let i = 0; i < rainCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 50;
    positions[i + 1] = Math.random() * 50;
    positions[i + 2] = (Math.random() - 0.5) * 50;
  }

  rainGeometry.setAttribute(
    'position',
    new THREE.BufferAttribute(positions, 3)
  );

  const rainMaterial = new THREE.PointsMaterial({ color: 0xaaaaaa, size: 0.2 });
  rainMaterial.depthTest = true;
  rainMaterial.transparent = true;
  rainMaterial.alphaMap = texture;
  getDrops = new THREE.Points(rainGeometry, rainMaterial);
  scene.add(getDrops);
}

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

const clock = new THREE.Clock();
let previouseTime = 0;

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previouseTime;
  previouseTime = elapsedTime;

  controls.update();

  if (mixer) {
    mixer.update(deltaTime);
  }

  raycaster.set(rayOrigin, rayDirection);

  generateRainsDrop(20);
  window.requestAnimationFrame(tick);
  renderer.render(scene, camera);
};

tick();

window.addEventListener('dblclick', (event) => {
  if (!document.fullscreenElement) {
    canvas.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

console.log('something Update');
