import * as THREE from 'three';

const ACCENT = 0xff3c00;
const clamp01 = (v) => Math.max(0, Math.min(1, v));

/**
 * The protagonist object: a microchip with a glowing die, radiating circuit
 * traces and five discipline nodes (Web/Dev, Technical, Design, Motion, SEO).
 * Rendered on a fixed full-viewport transparent canvas that floats between
 * section backgrounds (z-0) and section content (z-20).
 *
 * All motion is driven externally by writing to `scene.state` (GSAP scrubs)
 * plus internal idle animation and mouse tracking.
 */
export default class ChipScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.outputEncoding = THREE.sRGBEncoding;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this.camera.position.set(0, 0, 8);

    // Written to by GSAP ScrollTriggers (the "director").
    this.state = {
      x: 2.3, y: -0.1,
      rx: 0.5, ry: -0.55, ryExtra: 0,
      scale: 1,
      activation: 0.4, // 0-6: how many discipline nodes are lit
      pulse: 0,        // 0-1: reveal-section activation wave
      spin: 0.1,       // idle rotation speed
    };
    this.mouse = { x: 0, y: 0 };
    this.smooth = { x: 0, y: 0 };
    // rendered pose glides toward state each frame, so overlapping or
    // restarting scroll tweens can never snap the chip visibly
    this.pose = { x: this.state.x, y: this.state.y, rx: this.state.rx, ry: this.state.ry, scale: this.state.scale };

    this.#build();
    this.resize();

    this.clock = new THREE.Clock();
    this.running = true;
    this.renderer.setAnimationLoop(() => this.#tick());
  }

  #build() {
    const group = new THREE.Group();
    this.group = group;
    this.scene.add(group);

    // --- chip body ---
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 0.16, 2.2),
      new THREE.MeshStandardMaterial({ color: 0x141414, metalness: 0.75, roughness: 0.32 })
    );
    group.add(body);

    const plate = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.03, 1.9),
      new THREE.MeshStandardMaterial({ color: 0x1e1e1e, metalness: 0.6, roughness: 0.4 })
    );
    plate.position.y = 0.095;
    group.add(plate);

    // --- glowing die at the center ---
    this.die = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.07, 0.8),
      new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        emissive: ACCENT,
        emissiveIntensity: 1.3,
        roughness: 0.25,
        metalness: 0.4,
      })
    );
    this.die.position.y = 0.14;
    group.add(this.die);

    // --- pins along the four edges ---
    const pinGeo = new THREE.BoxGeometry(0.07, 0.05, 0.18);
    const pinMat = new THREE.MeshStandardMaterial({ color: 0xb9b9b9, metalness: 1, roughness: 0.35 });
    for (let side = 0; side < 4; side++) {
      for (let i = 0; i < 8; i++) {
        const pin = new THREE.Mesh(pinGeo, pinMat);
        const offset = -0.98 + (i * 1.96) / 7;
        const out = 1.19;
        if (side === 0) pin.position.set(offset, 0, out);
        if (side === 1) pin.position.set(offset, 0, -out);
        if (side === 2) { pin.position.set(out, 0, offset); pin.rotation.y = Math.PI / 2; }
        if (side === 3) { pin.position.set(-out, 0, offset); pin.rotation.y = Math.PI / 2; }
        group.add(pin);
      }
    }

    // --- circuit traces on the chip surface ---
    const traceMat = new THREE.LineBasicMaterial({
      color: ACCENT, transparent: true, opacity: 0.35,
    });
    const tracePts = [];
    for (let i = 0; i < 20; i++) {
      const a = (i / 20) * Math.PI * 2;
      const inner = 0.45, outer = 1.05;
      tracePts.push(
        new THREE.Vector3(Math.cos(a) * inner, 0.105, Math.sin(a) * inner),
        new THREE.Vector3(Math.cos(a) * outer, 0.105, Math.sin(a) * outer)
      );
    }
    const traceGeo = new THREE.BufferGeometry().setFromPoints(tracePts);
    group.add(new THREE.LineSegments(traceGeo, traceMat));

    // --- six discipline nodes radiating outward ---
    this.nodes = [];
    this.links = [];
    const heights = [0.7, -0.45, 0.85, -0.7, 0.5, -0.3];
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + 0.45;
      const r = 2.9;
      const pos = new THREE.Vector3(Math.cos(angle) * r, heights[i], Math.sin(angle) * r);

      const node = new THREE.Mesh(
        new THREE.SphereGeometry(0.13, 24, 24),
        new THREE.MeshStandardMaterial({
          color: 0x1a1a1a, emissive: ACCENT, emissiveIntensity: 0.25, roughness: 0.3,
        })
      );
      node.position.copy(pos);
      group.add(node);
      this.nodes.push(node);

      // curved connection from the die out to the node
      const start = new THREE.Vector3(Math.cos(angle) * 1.05, 0.1, Math.sin(angle) * 1.05);
      const control = start.clone().lerp(pos, 0.5).add(new THREE.Vector3(0, 0.6 * Math.sign(heights[i]), 0));
      const curve = new THREE.QuadraticBezierCurve3(start, control, pos);
      const linkGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(28));
      const link = new THREE.Line(
        linkGeo,
        new THREE.LineBasicMaterial({ color: ACCENT, transparent: true, opacity: 0.22 })
      );
      group.add(link);
      this.links.push(link);
    }

    // --- ambient particle field ---
    const count = 220;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 3.4 + Math.random() * 3.2;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi) * 0.7;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.particles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0xff6a40, size: 0.035, transparent: true, opacity: 0.5,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    group.add(this.particles);

    // --- expanding pulse ring (reveal section) ---
    this.ring = new THREE.Mesh(
      new THREE.RingGeometry(0.8, 0.87, 64),
      new THREE.MeshBasicMaterial({
        color: ACCENT, transparent: true, opacity: 0, side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending, depthWrite: false,
      })
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.position.y = 0.1;
    group.add(this.ring);

    // --- lights ---
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(4, 6, 6);
    this.scene.add(key);
    this.mouseLight = new THREE.PointLight(ACCENT, 1.1, 20);
    this.mouseLight.position.set(2, 2, 4);
    this.scene.add(this.mouseLight);
  }

  setMouse(nx, ny) {
    this.mouse.x = nx;
    this.mouse.y = ny;
  }

  /**
   * Chip center + approximate radius in screen pixels. Used to tint words
   * that the chip is currently passing over.
   */
  getScreenInfo() {
    const center = this.group.position.clone().project(this.camera);
    const x = (center.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-center.y * 0.5 + 0.5) * window.innerHeight;
    const edge = this.group.position
      .clone()
      .add(new THREE.Vector3(1.7 * this.state.scale, 0, 0))
      .project(this.camera);
    const ex = (edge.x * 0.5 + 0.5) * window.innerWidth;
    return { x, y, r: Math.abs(ex - x) };
  }

  pause() {
    this.renderer.setAnimationLoop(null);
  }

  resume() {
    this.renderer.setAnimationLoop(() => this.#tick());
  }

  #tick() {
    const t = this.clock.getElapsedTime();
    const s = this.state;

    // ease mouse influence
    this.smooth.x += (this.mouse.x - this.smooth.x) * 0.06;
    this.smooth.y += (this.mouse.y - this.smooth.y) * 0.06;

    // glide the rendered pose toward the scrubbed targets
    const k = 0.14;
    for (const p of ['x', 'y', 'rx', 'ry', 'scale']) {
      this.pose[p] += (s[p] - this.pose[p]) * k;
    }

    this.group.position.x = this.pose.x;
    this.group.position.y = this.pose.y + Math.sin(t * 1.2) * 0.07;
    this.group.scale.setScalar(this.pose.scale);
    this.group.rotation.x = this.pose.rx + this.smooth.y * 0.16;
    this.group.rotation.y = this.pose.ry + s.ryExtra + t * s.spin + this.smooth.x * 0.22;

    // cursor drives the accent light
    this.mouseLight.position.x = this.smooth.x * 4;
    this.mouseLight.position.y = this.smooth.y * 3 + 1.5;

    // discipline nodes light up progressively; the pulse flares everything
    for (let i = 0; i < this.nodes.length; i++) {
      const a = Math.max(clamp01(s.activation - i), s.pulse);
      this.nodes[i].material.emissiveIntensity = 0.25 + a * 2.3;
      this.nodes[i].scale.setScalar(1 + a * 0.5);
      this.links[i].material.opacity = 0.22 + a * 0.55;
    }

    // pulse ring expands and fades
    const ringScale = 1 + s.pulse * 6.5;
    this.ring.scale.setScalar(ringScale);
    this.ring.material.opacity = s.pulse > 0.01 ? (1 - s.pulse) * 0.7 : 0;

    // die breathes, flares on pulse
    this.die.material.emissiveIntensity = 1.25 + Math.sin(t * 2.4) * 0.22 + s.pulse * 1.6;

    this.particles.rotation.y = t * 0.03;

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.renderer.dispose();
    this.scene.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => m.dispose());
      }
    });
  }
}
