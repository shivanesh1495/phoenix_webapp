import * as THREE from 'https://cdn.skypack.dev/three@0.129.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js';
import { gsap } from 'https://cdn.skypack.dev/gsap';

// Initialize scene
const scene = new THREE.Scene();
scene.background = null;

// Camera setup
const camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 5);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container3D').appendChild(renderer.domElement);

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xff9933, 1.2);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffcc66, 1.5);
mainLight.position.set(3, 3, 3);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xff3300, 0.7);
fillLight.position.set(-3, 2, -1);
scene.add(fillLight);

// Load model
const loader = new GLTFLoader();
let model;
let mixer;

loader.load(
    '/phoenix_bird.glb',
    (gltf) => {
        model = gltf.scene;
        model.scale.set(0.0001,0.0001,0.0001); // Set dragon to 10cm x 10cm x 10cm
        model.position.set(-1, -4, -4);
        model.rotation.set(-0.6, Math.PI, 0);
        scene.add(model);

        model.traverse((node) => {
            if (node.isMesh) {
                node.material.transparent = false;
                node.material.opacity = 1;
            }
        });

        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const action = mixer.clipAction(gltf.animations[0]);
            action.play();
        }

        modelMove();
    },
    (xhr) => console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}%`),
    (error) => console.error('Error loading model:', error)
);

// Section-based model movement
const sectionPositions = [
    { id: 'banner', position: { x: 0.5, y: 0.1, z: 0.6}, rotation: { x: 0.3, y: Math.PI+0.8, z: 20 }, scale: 0.005 },
    { id: 'intro', position: { x: 0.5, y: 0.2, z: -0.4 }, rotation: { x: 1, y: Math.PI + 0.5, z: 0.1 }, scale: 0.002 },
    { id: 'description', position: { x: -4.2, y: -1, z: -5 }, rotation: { x: 0.2, y: Math.PI - 0.5, z: -0.1 }, scale: 0.002 },
    { id: 'contact', position: { x: -2, y: -1, z: -3 }, rotation: { x: 0.7, y: Math.PI, z: 0 }, scale: 0.001 }
];

const modelMove = () => {
    const sections = document.querySelectorAll('.section');
    let currentSection;

    sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2) {
            currentSection = section.id;
        }
    });

    const activePosition = sectionPositions.find(p => p.id === currentSection);

    if (activePosition && model) {
        gsap.to(model.position, { ...activePosition.position, duration: 2, ease: 'power2.out' });
        gsap.to(model.rotation, { ...activePosition.rotation, duration: 2, ease: 'power2.out' });
        gsap.to(model.scale, { x: activePosition.scale, y: activePosition.scale, z: activePosition.scale, duration: 2, ease: 'power2.out' });
    }
};

// Animation loop
const clock = new THREE.Clock();
const animate = () => {
    requestAnimationFrame(animate);
    if (mixer) mixer.update(clock.getDelta());
    renderer.render(scene, camera);
};
animate();

// Event listeners
window.addEventListener('scroll', modelMove);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Debugging
setTimeout(() => {
    console.log("Scene children:", scene.children);
}, 5000);
