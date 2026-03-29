"use client";

import { useEffect, useRef } from "react";
import {
  WebGLRenderer, Scene, PerspectiveCamera,
  IcosahedronGeometry, ShaderMaterial, Mesh,
  InstancedMesh, InstancedBufferAttribute,
  Matrix4, Vector2, Vector3, Quaternion, Color,
  Raycaster, Plane,
  AdditiveBlending,
  ACESFilmicToneMapping, DynamicDrawUsage,
} from "three";

/* ════════════════════════════════════════════════════════════
   Shared GLSL: Simplex 3D noise + FBM
   ════════════════════════════════════════════════════════════ */
const noiseGLSL = /* glsl */ `
  vec4 permute(vec4 x){ return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r){ return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v){
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g  = step(x0.yzx, x0.xyz);
    vec3 l  = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x  = x_ * ns.x + ns.yyyy;
    vec4 y  = y_ * ns.x + ns.yyyy;
    vec4 h  = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  // FBM — 4 octaves for organic detail
  float fbm(vec3 p) {
    float value = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for (int i = 0; i < 4; i++) {
      value += amp * snoise(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return value;
  }
`;

/* ════════════════════════════════════════════════════════════
   Sphere Vertex Shader
   ════════════════════════════════════════════════════════════ */
const sphereVert = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uHover;
  uniform vec3  uDragDir;
  uniform float uDragStrength;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying float vDisplacement;
  varying vec3 vOrigNormal;
  varying float vStretch;

  ${noiseGLSL}

  float getDisplacement(vec3 pos) {
    float speed = uTime * 0.25;
    float n = fbm(pos * 1.2 + speed);

    // Mouse influence — local bulge
    vec3 mouseDir = normalize(vec3(uMouse * 1.5, 0.6));
    float mouseDot = max(dot(normalize(pos), mouseDir), 0.0);
    float mouseInf = pow(mouseDot, 5.0) * uHover * 0.4;

    return n * 0.22 + mouseInf;
  }

  void main() {
    // Displacement via FBM
    float disp = getDisplacement(position);
    vDisplacement = disp;
    vOrigNormal = normal;

    vec3 newPos = position + normal * disp;

    // ── Drag stretching (smooth, elegant) ──
    float dragDot = dot(normalize(position), uDragDir);
    float pullMask = smoothstep(-0.2, 1.0, dragDot);
    float stretch = pullMask * uDragStrength;
    vStretch = stretch;

    // Smooth pull along drag direction
    newPos += uDragDir * stretch;

    // Gentle taper (not a harsh neck pinch)
    float taper = smoothstep(0.3, 0.6, dragDot) * smoothstep(0.95, 0.7, dragDot);
    float squeeze = taper * uDragStrength * 0.12;
    vec3 radialDir = normalize(position - uDragDir * dot(position, uDragDir));
    newPos -= radialDir * squeeze;

    // Compute displaced normal via finite differences
    float eps = 0.001;
    vec3 tangent1 = normalize(cross(normal, vec3(0.0, 1.0, 0.0)));
    if (length(cross(normal, vec3(0.0, 1.0, 0.0))) < 0.01)
      tangent1 = normalize(cross(normal, vec3(1.0, 0.0, 0.0)));
    vec3 tangent2 = normalize(cross(normal, tangent1));

    vec3 neighbour1 = position + tangent1 * eps;
    vec3 neighbour2 = position + tangent2 * eps;
    float d1 = getDisplacement(neighbour1);
    float d2 = getDisplacement(neighbour2);
    vec3 displacedNeighbour1 = neighbour1 + normal * d1;
    vec3 displacedNeighbour2 = neighbour2 + normal * d2;

    vec3 displacedNormal = normalize(cross(
      displacedNeighbour1 - newPos,
      displacedNeighbour2 - newPos
    ));

    vNormal = normalMatrix * displacedNormal;
    vWorldPos = (modelMatrix * vec4(newPos, 1.0)).xyz;
    vViewPos = (modelViewMatrix * vec4(newPos, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
  }
`;

/* ════════════════════════════════════════════════════════════
   Sphere Fragment Shader
   ════════════════════════════════════════════════════════════ */
const sphereFrag = /* glsl */ `
  uniform float uTime;
  uniform vec3  uLightPos;
  uniform float uDragStrength;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying float vDisplacement;
  varying vec3 vOrigNormal;
  varying float vStretch;

  ${noiseGLSL}

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vViewPos);
    vec3 L = normalize(uLightPos - vWorldPos);
    vec3 H = normalize(L + V);

    // ── Cute pastel palette ──
    vec3 sakura  = vec3(1.0, 0.62, 0.75);   // cherry blossom pink
    vec3 lavender = vec3(0.72, 0.56, 0.95);  // soft lavender
    vec3 sky     = vec3(0.55, 0.78, 1.0);    // baby blue
    vec3 mint    = vec3(0.55, 0.94, 0.82);   // mint green
    vec3 peach   = vec3(1.0, 0.75, 0.62);    // soft peach

    // Smooth 5-color cycling via position + time
    float t = uTime * 0.10;
    float n = snoise(vOrigNormal * 2.0 + t) * 0.5 + 0.5;
    float cycle = mod(t + n * 2.5, 5.0);

    vec3 baseColor;
    if (cycle < 1.0)      baseColor = mix(sakura, lavender, cycle);
    else if (cycle < 2.0) baseColor = mix(lavender, sky, cycle - 1.0);
    else if (cycle < 3.0) baseColor = mix(sky, mint, cycle - 2.0);
    else if (cycle < 4.0) baseColor = mix(mint, peach, cycle - 3.0);
    else                   baseColor = mix(peach, sakura, cycle - 4.0);

    // Displacement adds soft luminance variation
    baseColor = mix(baseColor, baseColor * 1.15 + vec3(0.08), vDisplacement * 1.2);

    // ── Stretch effects (crystalline glow) ──
    float stretchNorm = smoothstep(0.0, 0.8, vStretch);
    // Shift toward warm iridescent white at stretch
    vec3 shimmer = vec3(1.0, 0.92, 0.95); // warm pearl
    baseColor = mix(baseColor, shimmer, stretchNorm * 0.5);

    // ── Lighting ──
    float wrap = max(dot(N, L) * 0.5 + 0.5, 0.0);
    vec3 diffuse = baseColor * wrap * 0.85;

    float spec = pow(max(dot(N, H), 0.0), 64.0);
    vec3 specular = vec3(1.0) * spec * 0.6;

    float fresnel = pow(1.0 - max(dot(V, N), 0.0), 3.5);
    vec3 rim = mix(baseColor * 1.5, vec3(1.0), 0.5) * fresnel * 0.55;

    vec3 ambient = baseColor * 0.15;

    float sss = pow(max(dot(V, -L), 0.0), 2.0) * 0.15;
    vec3 subsurface = baseColor * sss;

    vec3 color = ambient + diffuse + specular + rim + subsurface;

    // Soft glow at stretched edges
    color += shimmer * stretchNorm * 0.35;

    // ── Alpha: elegant dissolve at extreme stretch ──
    float baseAlpha = 0.92 - fresnel * 0.12;
    // Smooth dissolve — sparkle edge, not harsh tear
    float dissolveNoise = snoise(vOrigNormal * 6.0 + uTime * 0.5) * 0.5 + 0.5;
    float dissolveEdge = smoothstep(0.25, 0.8, vStretch);
    // Sparkle at the dissolve boundary
    float sparkle = smoothstep(0.4, 0.5, dissolveNoise) * dissolveEdge;
    color += vec3(1.0) * sparkle * 0.8;
    float dissolveAlpha = 1.0 - smoothstep(0.0, 0.6, dissolveEdge - dissolveNoise * 0.5);
    float alpha = baseAlpha * mix(1.0, dissolveAlpha, step(0.01, uDragStrength));

    gl_FragColor = vec4(color, alpha);
  }
`;


/* ════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════ */
export default function GradientSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(0);
  const dragRef = useRef({
    active: false,
    dir: new Vector3(0, 0, 1),   // drag direction (world)
    strength: 0,                         // current spring value
    velocity: 0,                         // spring velocity
    target: 0,                           // target strength (0 when released)
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio, 1.5);

    // ── Renderer ──
    const renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "default",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Scene & Camera ──
    const scene = new Scene();
    const camera = new PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    // ── Main sphere ──
    const sphereGeo = new IcosahedronGeometry(1.4, 64);
    const sphereUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new Vector2(0, 0) },
      uHover: { value: 0 },
      uLightPos: { value: new Vector3(3, 4, 5) },
      uDragDir: { value: new Vector3(0, 0, 1) },
      uDragStrength: { value: 0 },
    };
    const sphereMat = new ShaderMaterial({
      vertexShader: sphereVert,
      fragmentShader: sphereFrag,
      uniforms: sphereUniforms,
      transparent: true,
      depthWrite: false,
    });
    const sphere = new Mesh(sphereGeo, sphereMat);
    scene.add(sphere);


    // ── Tear sparkles (InstancedMesh — glass bubble spheres) ──
    const MAX_CHUNKS = 60;
    const chunkGeo = new IcosahedronGeometry(0.05, 2);
    const chunkMat = new ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec3 vNorm;
        varying vec3 vViewPos;
        void main() {
          vNorm = normalMatrix * normal;
          vec4 mv = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
          vViewPos = mv.xyz;
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vNorm;
        varying vec3 vViewPos;
        void main() {
          vec3 N = normalize(vNorm);
          vec3 V = normalize(-vViewPos);
          // Fresnel rim for glass/bubble look
          float fresnel = pow(1.0 - max(dot(V, N), 0.0), 2.5);
          // Iridescent shift
          float iri = dot(N, vec3(0.0, 1.0, 0.0)) * 0.5 + 0.5;
          vec3 col1 = vec3(1.0, 0.65, 0.82);  // sakura
          vec3 col2 = vec3(0.7, 0.6, 1.0);    // lavender
          vec3 col3 = vec3(0.6, 0.9, 1.0);    // sky
          vec3 iriColor = mix(mix(col1, col2, iri), col3, fresnel);
          // Core glow + rim highlight
          vec3 color = iriColor * 0.6 + vec3(1.0) * fresnel * 0.9;
          float alpha = 0.35 + fresnel * 0.65;
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    });
    const chunks = new InstancedMesh(chunkGeo, chunkMat, MAX_CHUNKS);
    chunks.instanceMatrix.setUsage(DynamicDrawUsage);
    const emptyMatrix = new Matrix4().makeScale(0, 0, 0);
    for (let i = 0; i < MAX_CHUNKS; i++) chunks.setMatrixAt(i, emptyMatrix);
    chunks.instanceMatrix.needsUpdate = true;
    const chunkColors = new Float32Array(MAX_CHUNKS * 3);
    chunks.instanceColor = new InstancedBufferAttribute(chunkColors, 3);
    scene.add(chunks);

    // Chunk state
    interface ChunkState {
      alive: boolean;
      pos: Vector3;
      vel: Vector3;
      rotAxis: Vector3;
      rotSpeed: number;
      rot: number;
      scale: number;
      life: number;       // 0→1, dies at 1
      maxLife: number;
      color: Color;
    }
    const chunkPool: ChunkState[] = Array.from({ length: MAX_CHUNKS }, () => ({
      alive: false,
      pos: new Vector3(),
      vel: new Vector3(),
      rotAxis: new Vector3(1, 0, 0),
      rotSpeed: 0,
      rot: 0,
      scale: 1,
      life: 1,
      maxLife: 1,
      color: new Color(),
    }));
    let nextChunk = 0;
    let lastEmitTime = 0;

    const brandColors = [
      new Color(0xffa0bf),  // sakura pink
      new Color(0xb89ff5),  // lavender
      new Color(0x8dc8ff),  // baby blue
      new Color(0x8df0d2),  // mint
      new Color(0xffc09f),  // peach
      new Color(0xf5a0e6),  // orchid
    ];

    function emitChunks(dir: Vector3, strength: number, count: number) {
      for (let i = 0; i < count; i++) {
        const c = chunkPool[nextChunk % MAX_CHUNKS];
        nextChunk++;
        c.alive = true;
        c.life = 0;
        c.maxLife = 1.2 + Math.random() * 1.5; // longer float
        c.scale = 1.0 + Math.random() * 2.5;
        c.rot = 0;
        c.rotSpeed = (Math.random() - 0.5) * 8;
        c.rotAxis.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize();

        // Spawn at the stretched tip
        const spread = 0.3;
        c.pos.copy(dir).multiplyScalar(1.4 + strength * 0.4);
        c.pos.x += (Math.random() - 0.5) * spread;
        c.pos.y += (Math.random() - 0.5) * spread;
        c.pos.z += (Math.random() - 0.5) * spread;

        // Soft, bubbly velocity — drift outward gently
        const speed = 1.5 + Math.random() * 3;
        c.vel.copy(dir).multiplyScalar(speed * 0.4);
        c.vel.x += (Math.random() - 0.5) * 2;
        c.vel.y += 0.5 + Math.random() * 2.5; // float upward like bubbles
        c.vel.z += (Math.random() - 0.5) * 1.5;

        // Bright, saturated brand colors
        c.color.copy(brandColors[Math.floor(Math.random() * brandColors.length)]);
        // Softer glow for pastel feel
        c.color.multiplyScalar(1.2);
      }
    }

    function updateChunks(dt: number) {
      const gravity = -0.4; // very light gravity — dreamy float
      const dummy = new Matrix4();
      const quat = new Quaternion();
      const scaleVec = new Vector3();

      for (let i = 0; i < MAX_CHUNKS; i++) {
        const c = chunkPool[i];
        if (!c.alive) {
          chunks.setMatrixAt(i, emptyMatrix);
          continue;
        }

        c.life += dt;
        if (c.life >= c.maxLife) {
          c.alive = false;
          chunks.setMatrixAt(i, emptyMatrix);
          continue;
        }

        // Light physics — floaty
        c.vel.y += gravity * dt;
        c.vel.multiplyScalar(0.98); // moderate air drag
        c.pos.addScaledVector(c.vel, dt);
        c.rot += c.rotSpeed * dt;

        // Smooth ease-out fade: start big, shrink gracefully
        const lifeRatio = c.life / c.maxLife;
        const easeOut = 1.0 - lifeRatio * lifeRatio; // quadratic ease-out
        const s = Math.max(c.scale * easeOut, 0.01);

        quat.setFromAxisAngle(c.rotAxis, c.rot);
        scaleVec.set(s, s, s);
        dummy.compose(c.pos, quat, scaleVec);
        chunks.setMatrixAt(i, dummy);

        // Brightness fades with easeOut (additive, so brightness = alpha)
        chunkColors[i * 3] = c.color.r * easeOut;
        chunkColors[i * 3 + 1] = c.color.g * easeOut;
        chunkColors[i * 3 + 2] = c.color.b * easeOut;
      }
      chunks.instanceMatrix.needsUpdate = true;
      (chunks.instanceColor as InstancedBufferAttribute).needsUpdate = true;
    }

    // ── Raycaster for drag detection ──
    const raycaster = new Raycaster();
    const mouseNDC = new Vector2();

    // ── Mouse tracking + drag ──
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;

      if (dragRef.current.active) {
        // Update drag direction based on current mouse vs sphere center
        mouseNDC.set(mouseRef.current.x, mouseRef.current.y);
        raycaster.setFromCamera(mouseNDC, camera);
        // Project mouse to a plane at z=0 to get world-space drag target
        const plane = new Plane(new Vector3(0, 0, 1), 0);
        const target = new Vector3();
        raycaster.ray.intersectPlane(plane, target);
        if (target) {
          const dir = target.clone().sub(sphere.position).normalize();
          dragRef.current.dir.copy(dir);
          // Strength based on distance from sphere center
          const dist = target.distanceTo(sphere.position);
          dragRef.current.target = Math.min(dist * 0.8, 3.0);
        }
      }
    };
    const onMouseEnter = () => { hoverRef.current = 1; };
    const onMouseLeave = () => {
      hoverRef.current = 0;
      dragRef.current.active = false;
      dragRef.current.target = 0;
    };

    const onMouseDown = (e: MouseEvent) => {
      mouseNDC.set(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      );
      raycaster.setFromCamera(mouseNDC, camera);
      const hits = raycaster.intersectObject(sphere);
      if (hits.length > 0) {
        dragRef.current.active = true;
        // Initial drag direction from hit point
        const hitDir = hits[0].point.clone().sub(sphere.position).normalize();
        dragRef.current.dir.copy(hitDir);
        dragRef.current.target = 0.1;
        e.preventDefault();
      }
    };
    const onMouseUp = () => {
      dragRef.current.active = false;
      dragRef.current.target = 0; // spring back
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);
    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mouseup", onMouseUp);

    // ── Render loop (30fps cap) ──
    let animId: number;
    let lastTime = 0;
    const interval = 1000 / 30;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      if (time - lastTime < interval) return;
      lastTime = time;

      const t = time * 0.001;
      sphereUniforms.uTime.value = t;

      // Smooth mouse lerp
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      sphereUniforms.uMouse.value.x += (mx - sphereUniforms.uMouse.value.x) * 0.04;
      sphereUniforms.uMouse.value.y += (my - sphereUniforms.uMouse.value.y) * 0.04;
      sphereUniforms.uHover.value += (hoverRef.current - sphereUniforms.uHover.value) * 0.04;

      // Light follows mouse gently
      sphereUniforms.uLightPos.value.x = 3 + mx * 2;
      sphereUniforms.uLightPos.value.y = 4 + my * 2;

      // ── Spring physics for drag ──
      const drag = dragRef.current;
      const springK = 12;    // stiffness
      const damping = 4;     // damping ratio
      const dt = 1 / 30;
      const force = (drag.target - drag.strength) * springK;
      drag.velocity += (force - drag.velocity * damping) * dt;
      drag.strength += drag.velocity * dt;
      // Clamp tiny values to zero
      if (Math.abs(drag.strength) < 0.001 && Math.abs(drag.velocity) < 0.001) {
        drag.strength = 0;
        drag.velocity = 0;
      }
      sphereUniforms.uDragDir.value.copy(drag.dir);
      sphereUniforms.uDragStrength.value = drag.strength;

      // ── Emit chunks when stretched enough ──
      if (drag.active && drag.strength > 0.3 && t - lastEmitTime > 0.06) {
        const count = Math.floor(2 + drag.strength * 3);
        emitChunks(drag.dir, drag.strength, Math.min(count, 8));
        lastEmitTime = t;
      }
      // Burst on release if was stretched
      if (!drag.active && drag.strength > 0.3 && drag.velocity < -1) {
        emitChunks(drag.dir, drag.strength, 12);
      }

      updateChunks(dt);

      // Gentle rotation (slow down during drag)
      const rotSpeed = drag.strength > 0.1 ? 0.0003 : 0.0015;
      sphere.rotation.y += rotSpeed;
      sphere.rotation.x += rotSpeed * 0.5;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // ── Resize ──
    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    // ── Cleanup ──
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      container.removeEventListener("mousedown", onMouseDown);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      chunkGeo.dispose();
      chunkMat.dispose();
      chunks.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "auto",
        cursor: "grab",
      }}
    />
  );
}
