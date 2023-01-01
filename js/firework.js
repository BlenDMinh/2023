// pos: THREE.Vector3
// size: int
// color: [r, g, b]
const HSLToRGB = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [255 * f(0), 255 * f(8), 255 * f(4)];
};

const RGB2Hex = function(rgb) {
  [r, g, b] = rgb;
  let v = r*256*256 + g*256 + b;
  return v;
}

function Particle(pos, vel, color=undefined) {
  this.pos = pos;
  this.vel = vel;
  this.acc = new THREE.Vector3(0, -.001, 0)
  this.color = color
  if (this.color == undefined)
    this.color = HSLToRGB(THREE.Math.randInt(0, 360), 100, 100)
  this.particleMat = new THREE.MeshBasicMaterial({color: RGB2Hex(this.color), transparent: true})
  this.particleGeo = new THREE.SphereGeometry(0.1, 16, 16);
  this.particleObj = new THREE.Mesh(this.particleGeo, this.particleMat);
  this.particleObj.position.set(this.pos.x, this.pos.y, 0);
  // this.particleLig = new THREE.PointLight(RGB2Hex(this.color), 0.1, 2 );
  // this.particleLig.position.set(this.pos.x, this.pos.y, 0);
  // scene.add(this.particleLig);
  scene.add(this.particleObj);
}

Particle.prototype.update = function() {
  this.vel.add(this.acc)
  this.pos.add(this.vel)
  this.particleObj.position.set(this.pos.x, this.pos.y, 0);
  // this.particleLig.position.set(this.pos.x, this.pos.y, 0);
}

// alpha value [0, 1]
Particle.prototype.draw = function(alpha) {
  this.particleMat = new THREE.MeshBasicMaterial({color: RGB2Hex(this.color), opacity: alpha, transparent: true})
}

function Firework(pos, size=undefined, color=undefined) {
  this.pos = pos.clone();
  this.size = size;
  if (size == undefined)
    this.size = size = THREE.Math.randInt(50, 70)
  this.particles = []
  for (let i = 0; i < this.size; ++i) {
    let phi = THREE.Math.randFloat(0, 2*Math.PI)
    let theta = THREE.Math.randFloat(0, Math.PI)
    // console.log(phi, theta)
    let r = Math.sqrt(size)/100
    let x = r*Math.cos(phi)*Math.sin(theta)
    let z = r*Math.sin(phi)*Math.sin(theta)
    let y = r*Math.cos(theta)
    this.particles.push(new Particle(this.pos, new THREE.Vector3(x, y, z)))
  }
  this.ttl = this.size*3;
  this.lifetime = 0;
  // console.log(this)
}

Firework.prototype.update = function() {
  if(this.lifetime > this.ttl)
    this.particles.forEach(particle => scene.remove(particle.particleObj));
  else
    this.particles.forEach(particles => particles.update())
}

Firework.prototype.draw = function() {
  this.lifetime += 1;
  this.particles.forEach(particles => particles.draw(1 - this.lifetime/this.ttl))
}
