"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

/* ── Vertex Shader ────────────────────────────────────────── */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2  uMouse;
  uniform float uHover;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  //
  // Simplex 3D noise (compact)
  //
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

  void main() {
    // Organic noise displacement
    float speed = uTime * 0.3;
    float n1 = snoise(position * 1.5 + speed);
    float n2 = snoise(position * 3.0 - speed * 0.7) * 0.5;
    float noise = n1 + n2;

    // Mouse influence — bulge toward mouse
    vec3 mouseDir = normalize(vec3(uMouse.x, uMouse.y, 0.5));
    float mouseDot = max(dot(normalize(position), mouseDir), 0.0);
    float mouseInfluence = pow(mouseDot, 4.0) * uHover * 0.35;

    float displacement = noise * 0.18 + mouseInfluence;
    vDisplacement = displacement;

    vec3 newPosition = position + normal * displacement;
    vNormal = normalMatrix * normal;
    vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

/* ── Fragment Shader ──────────────────────────────────────── */
const fragmentShader = /* glsl */ `
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Brand colors: KoePass pink, SiiiD blue, Seebuy green
    vec3 pink  = vec3(0.91, 0.27, 0.55);  // #e8458c
    vec3 blue  = vec3(0.11, 0.31, 0.85);  // #1d4ed8
    vec3 green = vec3(0.09, 0.64, 0.29);  // #16a34a

    // Smooth cycling between 3 brand colors
    float t = uTime * 0.15;
    float cycle = mod(t, 3.0);
    vec3 color;
    if (cycle < 1.0) {
      color = mix(blue, pink, cycle);
    } else if (cycle < 2.0) {
      color = mix(pink, green, cycle - 1.0);
    } else {
      color = mix(green, blue, cycle - 2.0);
    }

    // Fresnel rim lighting
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 3.0);

    // Mix base color with bright rim
    vec3 rimColor = vec3(1.0);
    vec3 finalColor = mix(color, rimColor, fresnel * 0.6);

    // Subtle displacement-based highlight
    finalColor += vDisplacement * 0.3;

    // Soft alpha at edges
    float alpha = 0.85 - fresnel * 0.15;

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

/* ── Component ────────────────────────────────────────────── */
export default function GradientSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const hoverRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // ── Setup ──
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(dpr);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 4.2;

    // ── Sphere ──
    const geometry = new THREE.IcosahedronGeometry(1.3, 64);
    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0, 0) },
      uHover: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // ── Mouse tracking ──
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    const onMouseEnter = () => { hoverRef.current = 1; };
    const onMouseLeave = () => { hoverRef.current = 0; };
    window.addEventListener("mousemove", onMouseMove);
    container.addEventListener("mouseenter", onMouseEnter);
    container.addEventListener("mouseleave", onMouseLeave);

    // ── Animation loop (capped at 30fps) ──
    let animId: number;
    let lastTime = 0;
    const interval = 1000 / 30;

    const animate = (time: number) => {
      animId = requestAnimationFrame(animate);
      if (time - lastTime < interval) return;
      lastTime = time;

      uniforms.uTime.value = time * 0.001;

      // Smooth mouse lerp
      uniforms.uMouse.value.x += (mouseRef.current.x - uniforms.uMouse.value.x) * 0.05;
      uniforms.uMouse.value.y += (mouseRef.current.y - uniforms.uMouse.value.y) * 0.05;
      uniforms.uHover.value += (hoverRef.current - uniforms.uHover.value) * 0.05;

      // Gentle rotation
      mesh.rotation.y += 0.002;
      mesh.rotation.x += 0.001;

      renderer.render(scene, camera);
    };
    animId = requestAnimationFrame(animate);

    // ── Resize ──
    const onResize = () => {
      if (!container) return;
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
      geometry.dispose();
      material.dispose();
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
