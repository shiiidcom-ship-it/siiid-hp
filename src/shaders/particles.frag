// Floating particles — fragment shader
varying float vAlpha;

void main() {
  // 円形のソフトパーティクル
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  float alpha = smoothstep(0.5, 0.1, dist) * vAlpha;

  gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
}
