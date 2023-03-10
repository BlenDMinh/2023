// pos: THREE.Vector3
// size: int
// color: [r, g, b]
import { scene } from "./main.js";
import { PlayFirework } from "./audio.js";
import * as THREE from 'three'

function HSVtoCLR(h, s, v) {
  var r, g, b, i, f, p, q, t;
  if (arguments.length === 1) {
    s = h.s, v = h.v, h = h.h;
  }
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0: r = v, g = t, b = p; break;
    case 1: r = q, g = v, b = p; break;
    case 2: r = p, g = v, b = t; break;
    case 3: r = p, g = q, b = v; break;
    case 4: r = t, g = p, b = v; break;
    case 5: r = v, g = p, b = q; break;
  }
  r = Math.round(r * 255)
  g = Math.round(g * 255)
  b = Math.round(b * 255)
  // console.log(r, g, b)
  return (r << 16) + (g << 8) + b
}

function boxMullerTransform() {
  const u1 = Math.random();
  const u2 = Math.random();
  
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
  
  return { z0, z1 };
}

function normaldist(mean=0, stddev=1) {
  const { z0, _ } = boxMullerTransform();
  return z0 * stddev + mean;
}

export function Particle(pos, vel, ttl, color=undefined) {
  this.pos = pos.clone();
  this.vel = vel;
  this.color = color
  if (this.color == undefined)
    this.color = HSVtoCLR(THREE.MathUtils.randFloat(0, 1), 1, 1)

  this.ttl = ttl;
  this.lifetime = 0;
  this.started = false;
}

Particle.prototype.start = function() {
  this.particleMat = new THREE.MeshPhongMaterial({
    emissive: this.color,
    transparent: true,
    opacity: 1
  });
  // console.log(this.color)
  this.particleGeo = new THREE.SphereGeometry(0.1, 16, 16);
  this.particleObj = new THREE.Mesh(this.particleGeo, this.particleMat);
  this.particleObj.position.set(this.pos.x, this.pos.y, 0);
  // sprite.scale.set(200, 200, 1.0);
  // this.particleObj.add(sprite); // this centers the glow at the mesh
  scene.add(this.particleObj);
  this.started = true
}

Particle.prototype.update = function() {
  if (!this.started)
    this.start();
  this.pos.add(this.vel)
  this.particleObj.position.set(this.pos.x, this.pos.y, 0);
  this.lifetime += 1
  if (this.lifetime >= this.ttl)
    scene.remove(this.particleObj)
}

// alpha value [0, 1]
Particle.prototype.draw = function(alpha) {
  if(this && this.particleMat && this.particleObj)
    this.particleMat.opacity = alpha;
}

export function Firework(pos, delay=0, size=undefined, color=undefined) {
  this.pos = pos.clone();
  this.size = size;
  if (size == undefined)
    this.size = size = THREE.MathUtils.randInt(20, 70)
  this.particles = []
  for (let i = 0; i < this.size*2; ++i) {
    let phi = THREE.MathUtils.randFloat(0, 2*Math.PI)
    let theta = THREE.MathUtils.randFloat(0, Math.PI)
    // console.log(phi, theta)
    let r = Math.sqrt(size)/100
    let x = r*Math.cos(phi)*Math.sin(theta)
    let z = r*Math.sin(phi)*Math.sin(theta)
    let y = r*Math.cos(theta)
    // console.log(x, y, z)
    this.particles.push(
      new Particle(
        this.pos, 
        new THREE.Vector3(x, y, z), 
        normaldist(this.size*2, this.size/10)
      )
    )
  }

  this.delay = delay
  // console.log(this)
}

Firework.prototype.update = function() {
  this.delay -= 1;
  if (this.delay >= 0)
    return;
  this.particles.forEach(particle => particle.update());
  this.particles = this.particles.filter(particle => particle.ttl > particle.lifetime);
}

Firework.prototype.draw = function() {
  var opacity;
  this.particles.forEach(particle => {opacity = 1 - Math.min(particle.lifetime, particle.ttl) / particle.ttl;particle.draw(opacity)});
  if(!this.light) {
    this.spriteMaterial = new THREE.SpriteMaterial( 
      { 
        map: new THREE.TextureLoader().load('images/glow.png'), 
        color: HSVtoCLR(THREE.MathUtils.randFloat(0, 1), 1, 1), transparent: false, blending: THREE.AdditiveBlending
      });
    this.light = new THREE.Sprite( this.spriteMaterial );
    this.light.position.set(this.pos.x, this.pos.y, 0);
    this.light.scale.set(5, 5, 1)
    // this.light = new THREE.PointLight(HSVtoCLR(THREE.MathUtils.randFloat(0, 1), 1, 1), 1, 5);
    // this.light.position.set(this.pos.x, this.pos.y, 0);
  }
  if(this.delay == 0) {
    this.delay = -1;
    scene.add(this.light);
    PlayFirework();
  }
  if(this.light) {
    this.spriteMaterial.opacity = opacity;
  }
}
