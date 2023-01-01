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

function Particle(pos, vel, color=undefined) {
  this.pos = pos;
  this.vel = vel;
  this.acc = new THREE.Vector3(0, -1, 0)
  this.color = color
  if (this.color == undefined)
    this.color = HSLToRGB(THREE.Math.randInt(0, 360), 100, 100)
}

Particle.prototype.update = function() {
  this.vel.add(this.acc)
  this.pos.add(this.vel)
}

// alpha value [0, 1]
Particle.prototype.draw = function(alpha) {
  // code goes here
}

function Firework(pos, size=undefined, color=undefined) {
  this.pos = pos.clone();
  this.size = size;
  if (size == undefined)
    this.size = size = THREE.Math.randInt(30, 70)
  this.particles = []
  for (let i = 0; i < this.size; ++i) {
    let phi = THREE.Math.randFloat(0, 2*Math.PI)
    let theta = THREE.Math.randFloat(0, Math.PI)
    // console.log(phi, theta)
    let r = Math.sqrt(size)
    let x = r*Math.cos(phi)*Math.sin(theta)
    let y = r*Math.sin(phi)*Math.sin(theta)
    let z = r*Math.cos(theta)
    this.particles.push(new Particle(this.pos, new THREE.Vector3(x, y, z)))
  }
  this.ttl = this.size*5;
  this.lifetime = 0;
  console.log(this)
}

Firework.prototype.update = function() {
  this.particles.forEach(particles => particles.update())
}

Firework.prototype.draw = function() {
  this.lifetime += 1;
  this.particles.forEach(particles => particles.draw(1 - this.lifetime/this.ttl))
}