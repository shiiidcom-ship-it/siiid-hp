"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

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

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying float vDisplacement;
  varying vec3 vOrigNormal;

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

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vViewPos;
  varying float vDisplacement;
  varying vec3 vOrigNormal;

  ${noiseGLSL}

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(-vViewPos);
    vec3 L = normalize(uLightPos - vWorldPos);
    vec3 H = normalize(L + V);

    // ── Brand color palette ──
    vec3 pink   = vec3(0.91, 0.27, 0.55);
    vec3 blue   = vec3(0.18, 0.38, 0.92);
    vec3 green  = vec3(0.13, 0.68, 0.38);
    vec3 purple = vec3(0.55, 0.25, 0.85);

    // Smooth 4-color cycling via position + time
    float t = uTime * 0.12;
    float n = snoise(vOrigNormal * 2.0 + t) * 0.5 + 0.5;
    float cycle = mod(t + n * 2.0, 4.0);

    vec3 baseColor;
    if (cycle < 1.0)      baseColor = mix(blue, pink, cycle);
    else if (cycle < 2.0) baseColor = mix(pink, purple, cycle - 1.0);
    else if (cycle < 3.0) baseColor = mix(purple, green, cycle - 2.0);
    else                   baseColor = mix(green, blue, cycle - 3.0);

    // Displacement adds local hue variation
    baseColor = mix(baseColor, baseColor * 1.3, vDisplacement * 1.5);

    // ── Lighting ──
    // Diffuse (warm)
    float diff = max(dot(N, L), 0.0);
    float wrap = max(dot(N, L) * 0.5 + 0.5, 0.0); // wrap lighting
    vec3 diffuse = baseColor * wrap * 0.85;

    // Specular (Blinn-Phong, tight highlight)
    float spec = pow(max(dot(N, H), 0.0), 64.0);
    vec3 specular = vec3(1.0) * spec * 0.6;

    // Fresnel rim
    float fresnel = pow(1.0 - max(dot(V, N), 0.0), 3.5);
    vec3 rim = mix(baseColor * 1.5, vec3(1.0), 0.5) * fresnel * 0.55;

    // Ambient
    vec3 ambient = baseColor * 0.15;

    // Subsurface scattering approximation
    float sss = pow(max(dot(V, -L), 0.0), 2.0) * 0.15;
    vec3 subsurface = baseColor * sss;

    // Compose
    vec3 color = ambient + diffuse + specular + rim + subsurface;

    // Soft alpha falloff at silhouette
    float alpha = 0.92 - fresnel * 0.12;

    gl_FragColor = vec4(color, alpha);
  }
`;

/* ════════════════════════════════════════════════════════════
   Particle ring shaders
   ════════════════════════════════════════════════════════════ */
const particleVert = /* glsl */ `
  uniform float uTime;
  attribute float aAngle;
  attribute float aRadius;
  attribute float aSpeed;
  attribute float aSize;

  varying float vAlpha;

  void main() {
    float angle = aAngle + uTime * aSpeed;
    vec3 pos = vec3(
      cos(angle) * aRadius,
      sin(angle * 0.3) * 0.3,
      sin(angle) * aRadius
    );

    vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPos;
    gl_PointSize = aSize * (200.0 / -mvPos.z);

    // Fade based on distance from camera
    vAlpha = smoothstep(8.0, 3.0, -mvPos.z) * 0.6;
  }
`;

const particleFrag = /* glsl */ `
  varying float vAlpha;

  void main() {
    // Soft circle
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float circle = 1.0 - smoothstep(0.5, 1.0, d);

    gl_FragColor = vec4(vec3(0.6, 0.7, 1.0), circle * vAlpha);
  }
`;

/* ════════════════════════════════════════════════════════════
   Component
   ════════════════════════════════════════════════════════════ */
export default function GradientSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const dpr = Math.min(window.devicePixelRatio, 1.5);

    // ── Renderer ──
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "default",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // ── Scene & Camera ──
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 5;

    // ── Main sphere ──
    const sphereGeo = new THREE.IcosahedronGeometry(1.4, 128);
    const sphereUniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
      uLightPos: { value: new THREE.Vector3(3, 4, 5) },
    };
    const sphereMat = new THREE.ShaderMaterial({
      vertexShader: sphereVert,
      fragmentShader: sphereFrag,
      uniforms: sphereUniforms,
      transparent: true,
      depthWrite: false,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);

    // ── Glow layer (slightly larger, additive) ──
    const glowGeo = new THREE.IcosahedronGeometry(1.6, 32);
    const glowMat = new THREE.ShaderMaterial({
      vertexShader: /* glsl */ `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vNormal = normalMatrix * normal;
          vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform float uTime;
        varying vec3 vNormal;
        varying vec3 vViewPos;
        void main() {
          vec3 V = normalize(-vViewPos);
          float fresnel = pow(1.0 - max(dot(V, normalize(vNormal)), 0.0), 4.0);

          // Cycling glow color
          float t = uTime * 0.12;
          vec3 pink = vec3(0.91, 0.27, 0.55);
          vec3 blue = vec3(0.18, 0.38, 0.92);
          vec3 green = vec3(0.13, 0.68, 0.38);
          float cycle = mod(t, 3.0);
          vec3 color;
          if (cycle < 1.0) color = mix(blue, pink, cycle);
          else if (cycle < 2.0) color = mix(pink, green, cycle - 1.0);
          else color = mix(green, blue, cycle - 2.0);

          gl_FragColor = vec4(color, fresnel * 0.25);
        }
      `,
      uniforms: { uTime: sphereUniforms.uTime },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    scene.add(glow);

    // ── Orbital particles ──
    const particleCount = 200;
    const angles = new Float32Array(particleCount);
    const radii = new Float32Array(particleCount);
    const speeds = new Float32Array(particleCount);
    const sizes = new Float32Array(particleCount);

    for (let i = 0; i < particleCount; i++) {
      angles[i] = Math.random() * Math.PI * 2;
      radii[i] = 2.0 + Math.random() * 1.5;
      speeds[i] = 0.05 + Math.random() * 0.15;
      sizes[i] = 1.0 + Math.random() * 3.0;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(particleCount * 3), 3));
    particleGeo.setAttribute("aAngle", new THREE.Float32BufferAttribute(angles, 1));
    particleGeo.setAttribute("aRadius", new THREE.Float32BufferAttribute(radii, 1));
    particleGeo.setAttribute("aSpeed", new THREE.Float32BufferAttribute(speeds, 1));
    particleGeo.setAttribute("aSize", new THREE.Float32BufferAttribute(sizes, 1));

    const particleMat = new THREE.ShaderMaterial({
      vertexShader: particleVert,
      fragmentShader: particleFrag,
      uniforms: { uTime: sphereUniforms.uTime },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Mouse tracking ──
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onMouseEnter = () => { hoverRef.current = 1; };
    const onMouseLeave = () => { hoverRef.current = 0; };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

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

      // Gentle rotation
      sphere.rotation.y += 0.0015;
      sphere.rotation.x += 0.0008;
      glow.rotation.y = sphere.rotation.y;
      glow.rotation.x = sphere.rotation.x;
      particles.rotation.y += 0.001;

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
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mouseenter", onMouseEnter);
      container.removeEventListener("mouseleave", onMouseLeave);
      renderer.dispose();
      sphereGeo.dispose();
      sphereMat.dispose();
      glowGeo.dispose();
      glowMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
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
      }}
    />
  );
}
