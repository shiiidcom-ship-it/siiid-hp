// Floating particles — vertex shader
uniform float uTime;
uniform float uSize;

attribute float aOffset;
attribute float aSpeed;

varying float vAlpha;

// compact simplex noise
vec3 mod289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-vec3(.5);
  vec3 ii=mod289(i);
  vec4 p=permute(permute(permute(ii.z+vec4(0.,i1.z,i2.z,1.))+ii.y+vec4(0.,i1.y,i2.y,1.))+ii.x+vec4(0.,i1.x,i2.x,1.));
  vec4 m=max(.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m*m*m;
  vec3 p0=normalize(vec3(p.x*vec2(1.,0.)+p.y*vec2(0.,1.),p.z));
  return 42.*dot(m,vec4(dot(p0,x0)));
}

void main() {
  vec3 pos = position;

  // ノイズで各パーティクルをゆらゆら動かす
  float t = uTime * aSpeed + aOffset;
  pos.x += snoise(vec3(pos.x * 0.5, pos.y * 0.3, t)) * 0.4;
  pos.y += snoise(vec3(pos.y * 0.4, pos.z * 0.5, t * 0.8)) * 0.3;
  pos.z += snoise(vec3(pos.z * 0.3, pos.x * 0.4, t * 1.2)) * 0.2;

  vec4 mvPos = modelViewMatrix * vec4(pos, 1.0);

  // 距離に応じてサイズと透明度を変える
  float dist = -mvPos.z;
  gl_PointSize = uSize * (1.0 / dist);
  vAlpha = smoothstep(8.0, 2.0, dist) * 0.8;

  gl_Position = projectionMatrix * mvPos;
}
