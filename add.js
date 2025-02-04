import * as THREE from 'three';
import { OrbitControls, ThreeMFLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const canvas = document.getElementById('canvas');
const [width, height] = [window.innerWidth, window.innerHeight];

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, width / height);
camera.position.z = 10;
camera.position.y = 10;

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
    console.log(child);
  });

  action.play();
  // make little bit small model and fix it in rigth position
  gltf.scene.position.y = 3;
  gltf.scene.rotation.y = -1.5;
  gltf.scene.scale.set(0.1, 0.1, 0.1);

  scene.add(gltf.scene);
});

const directionalLight = new THREE.DirectionalLight('white', 2.5);
directionalLight.castShadow = true;

directionalLight.position.set(-3, 6, 0);
scene.add(directionalLight);

const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight
);
// scene.add(directionalLightHelper);

directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

const ambeinLight = new THREE.AmbientLight('white', 0.5);
scene.add(ambeinLight);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 50),
  new THREE.MeshStandardMaterial()
);

floor.rotation.x = -(Math.PI / 2);
floor.receiveShadow = true;
scene.add(floor);

const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.shadowMap.enabled = true;
renderer.setSize(width, height);
renderer.setClearColor(0x000000);

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

  window.requestAnimationFrame(tick);
  renderer.render(scene, camera);
};

tick();
