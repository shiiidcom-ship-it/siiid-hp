// Gradient mesh — fragment shader
// Organic noise-driven gradient (KoePass pink × Seebuy green × deep void)
uniform float uTime;
uniform vec2  uResolution;
uniform vec3  uColor0;   // deep background  #080810
uniform vec3  uColor1;   // KoePass pink     #e8458c
uniform vec3  uColor2;   // Seebuy green     #22c55e
uniform vec3  uColor3;   // accent white     #f0f0f8

varying vec2 vUv;

// Simplex noise (inline compact version)
vec3 mod289v3(vec3 x){return x-floor(x*(1./289.))*289.;}
vec4 mod289v4(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289v4(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1./6.,1./3.);
  const vec4 D=vec4(0.,.5,1.,2.);
  vec3 i=floor(v+dot(v,C.yyy));
  vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);
  vec3 l=1.-g;
  vec3 i1=min(g.xyz,l.zxy);
  vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;
  vec3 x2=x0-i2+C.yyy;
  vec3 x3=x0-D.yyy;
  i=mod289v3(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.,i1.z,i2.z,1.))+i.y+vec4(0.,i1.y,i2.y,1.))+i.x+vec4(0.,i1.x,i2.x,1.));
  float n_=0.142857142857;
  vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.*floor(p*ns.z*ns.z);
  vec4 x_=floor(j*ns.z);
  vec4 y_=floor(j-7.*x_);
  vec4 x=x_*ns.x+ns.yyyy;
  vec4 y=y_*ns.x+ns.yyyy;
  vec4 h=1.-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);
  vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.+1.;
  vec4 s1=floor(b1)*2.+1.;
  vec4 sh=-step(h,vec4(0.));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
  vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);
  vec3 p1=vec3(a0.zw,h.y);
  vec3 p2=vec3(a1.xy,h.z);
  vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
  m=m*m;
  return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}

void main() {
  vec2 uv = vUv;
  float t = uTime * 0.15;

  // ノイズで座標を歪める
  float n1 = snoise(vec3(uv * 1.8, t));
  float n2 = snoise(vec3(uv * 2.4 + 1.3, t * 0.7));
  float n3 = snoise(vec3(uv * 1.2 + vec2(n1, n2) * 0.3, t * 0.5));

  // ピンクとグリーンのブロブ
  float pinkBlob  = smoothstep(0.0, 1.0, n1 * 0.5 + 0.5);
  float greenBlob = smoothstep(0.0, 1.0, n2 * 0.5 + 0.5);
  float voidBlend = smoothstep(0.0, 1.0, n3 * 0.5 + 0.5);

  // カラーミックス
  vec3 col = uColor0;
  col = mix(col, uColor1, pinkBlob  * 0.35);
  col = mix(col, uColor2, greenBlob * 0.25);
  col = mix(col, uColor3, voidBlend * 0.04);

  // 中央に向かってビネット
  vec2 centered = uv - 0.5;
  float vignette = 1.0 - dot(centered, centered) * 1.6;
  col *= clamp(vignette, 0.0, 1.0);

  gl_FragColor = vec4(col, 1.0);
}
