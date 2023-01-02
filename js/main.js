import * as THREE from 'three'
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from './three/examples/jsm/postprocessing/RenderPass.js';
import {BloomPass} from './three/examples/jsm/postprocessing/BloomPass.js'
import {RenderPixelatedPass} from './three/examples/jsm/postprocessing/RenderPixelatedPass.js'
import {Firework} from './firework.js';

export const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('main').appendChild(renderer.domElement)

const composer = new EffectComposer(renderer);
// const renderPass = new RenderPass( scene, camera );
// composer.addPass( renderPass );
const renderPixelatePass = new RenderPixelatedPass(4, scene, camera);
composer.addPass(renderPixelatePass);

camera.position.z = 15;

// debug light
const light = new THREE.PointLight(0xffffff, 0.1, 2 );
scene.add(light);

const backPlaneGeo = new THREE.PlaneGeometry(10000, 10000);
const backPlaneMat = new THREE.MeshStandardMaterial({color:0xffffff, side: THREE.DoubleSide});
const backPlane = new THREE.Mesh(backPlaneGeo, backPlaneMat);
scene.add(backPlane);
backPlane.position.z = -1;

var mX, mY;
var isMouseDown;

var canvas = renderer.domElement;

document.getElementById('main').addEventListener('mousemove', e => {
    // get x,y coords into canvas where click occurred
    var rect = canvas.getBoundingClientRect(),
        x = e.clientX - rect.left,
        y = e.clientY - rect.top;
    // convert x,y to clip space; coords from top left, clockwise:
    // (-1,1), (1,1), (-1,-1), (1, -1)
    var mouse = new THREE.Vector3();
    mouse.x = ( (x / canvas.clientWidth ) * 2) - 1;
    mouse.y = (-(y / canvas.clientHeight) * 2) + 1;
    mouse.z = 0.5; // set to z position of mesh objects
    // reverse projection from 3D to screen
    mouse.unproject(camera);
    // convert from point to a direction
    mouse.sub(camera.position).normalize();
    // scale the projected ray
    var distance = -camera.position.z / mouse.z,
        scaled = mouse.multiplyScalar(distance),
        coords = camera.position.clone().add(scaled);
    mX = coords.x;
    mY = coords.y;
    return coords;
});

document.getElementById('main').addEventListener('mousedown', e => {
    isMouseDown = true;
});
document.getElementById('main').addEventListener('mouseup', e => {
    isMouseDown = false;
});

const lineMat = new THREE.LineBasicMaterial({
    color: 0xffffff
});

const points = [];
const interval = 5; // milisecond
const starSpace = 3;
var lastTime = null;
var line =  new THREE.Line();
line.material = lineMat;
let fireworks = []

function releaseFireworks(points) {
  let stars = points.filter((points, i) => i % starSpace == 0);
  fireworks = fireworks.concat(stars.map((star, i) => new Firework(star, 10*i)));
}

function animate() {
    requestAnimationFrame(animate);
    light.position.set(mX, mY, 0);
    renderer.render(scene, camera);
    if(isMouseDown) {
        if(lastTime == null) {
            lastTime = new Date().getTime();
            points.push(new THREE.Vector3(mX, mY, 0));
            return;
        }
        let now = new Date().getTime();
        if(now - lastTime >= interval) {
            points.push(new THREE.Vector3(mX, mY, 0));
            lastTime = now;
        }
    } else {
        lastTime = null;
        scene.remove(line);
        if(points.length > 0)
            releaseFireworks(points);
        points.length = 0;
    }
    if(points.length > 1) {
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        line.geometry = lineGeo;
        scene.add(line);
    }
    if (fireworks.length > 0) {
      fireworks.forEach(firework => {
        firework.update()
        firework.draw()
      });
      fireworks = fireworks.filter(firework => firework.particles.length > 0)
    }
    composer.render();
}
animate();