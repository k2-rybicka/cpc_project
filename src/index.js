import * as THREE from "three";
import * as Tone from "tone";

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import "./styles.css";

let scene, camera, renderer;
let colour, intensity, light;
let ambientLight;
let raycaster, mouse, intersects;

let orbit;
let loader = new THREE.TextureLoader();

let sceneHeight, sceneWidth;

let clock, delta, interval;

let geometry, material;
let sphere;
let mouseDown;

let hello, listener, audioLoader;

let size = 10;
let divisions = 10;
let gridHelper = new THREE.GridHelper(size, divisions);

let startButton = document.getElementById("startButton");
startButton.addEventListener("click", init);

function init() {
  let overlay = document.getElementById("overlay");
  overlay.remove();
  Tone.start();
  mouseDown = false;

  clock = new THREE.Clock();
  delta = 0;
  interval = 1 / 25;

  sceneWidth = window.innerWidth;
  sceneHeight = window.innerHeight;
  scene = new THREE.Scene();
  scene.background = new THREE.Color("#d1b8db");

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.z = 5;
  camera.position.x = 0;
  camera.position.y = 0;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.enableZoom = true;
  orbit.enableRotate = false;

  colour = 0xffffff;
  intensity = 1;
  light = new THREE.DirectionalLight(colour, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);
  ambientLight = new THREE.AmbientLight(0xffffff, 0.25);
  scene.add(ambientLight);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  intersects = [];

  geometry = new THREE.BoxBufferGeometry(2, 2, 2);
  material = new THREE.MeshBasicMaterial({
    map: loader.load("textures/gb.png")
  });
  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  scene.add(gridHelper);

  listener = new THREE.AudioListener();
  camera.add(listener);
  hello = new THREE.PositionalAudio(listener);

  audioLoader = new THREE.AudioLoader();
  audioLoader.load("./sounds/hello.wav", function (buffer) {
    hello.setBuffer(buffer);
    hello.setRefDistance(10);
    hello.setRolloffFactor(0.9);
    hello.playbackRate = 1;
    hello.offset = 0;
    hello.setDirectionalCone(180, 230, 0.1);
    hello.setLoop(false);
    hello.setVolume(1);
    hello.duration = 4;
  });

  window.addEventListener("pointerdown", triggerAttack, false);
  window.addEventListener("pointerup", triggerRelease, false);

  window.addEventListener("resize", onWindowResize, false); //resize callback
  play();
}

function stop() {
  renderer.setAnimationLoop(null);
}

function render() {
  renderer.render(scene, camera);
}

function play() {
  renderer.setAnimationLoop(() => {
    update();
    render();
  });
}

function update() {
  orbit.update();
  sphere.rotation.y += 0.005;
  delta += clock.getDelta();
  if (delta > interval) {
    delta = delta % interval;
  }
}

function onWindowResize() {
  sceneHeight = window.innerHeight;
  sceneWidth = window.innerWidth;
  renderer.setSize(sceneWidth, sceneHeight);
  camera.aspect = sceneWidth / sceneHeight;
  camera.updateProjectionMatrix();
}

function triggerAttack(event) {
  console.log("down");
  raycaster.setFromCamera(mouse, camera);
  intersects = raycaster.intersectObject(sphere);

  if (intersects.length > 0) {
    mouseDown = true;
    hello.play();
  }

  if (mouseDown) {
    sphere.material.color.setHex(0xb8b8b8);
  }
}

function triggerRelease() {
  mouseDown = false; // set mouseDown flag to false
  console.log("up");
  sphere.material.color.setHex(0xffffff); // return planet's colour to it grey
}
