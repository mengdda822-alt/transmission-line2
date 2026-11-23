import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const $ = (id) => document.getElementById(id);
const pages = ['tower','sag','knowledge','calculator','quiz'];
document.querySelectorAll('.nav-btn').forEach(btn => btn.addEventListener('click', () => {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b === btn));
  pages.forEach(p => $('page-'+p).classList.toggle('active', p === btn.dataset.page));
  $('mainNav').classList.remove('open');
  setTimeout(() => window.dispatchEvent(new Event('resize')), 60);
}));
$('menuToggle').addEventListener('click', () => $('mainNav').classList.toggle('open'));

function makeScene(containerId, cameraPos=[55,42,65]) {
  const container = $(containerId);
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#102035');
  scene.fog = new THREE.Fog('#102035', 130, 280);
  const camera = new THREE.PerspectiveCamera(42, container.clientWidth/container.clientHeight, 0.1, 1000);
  camera.position.set(...cameraPos);
  const renderer = new THREE.WebGLRenderer({antialias:true, alpha:false});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.innerHTML = '';
  container.appendChild(renderer.domElement);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true; controls.dampingFactor = .06; controls.minDistance = 12; controls.maxDistance = 180;
  scene.add(new THREE.HemisphereLight(0xbddcff, 0x283342, 2.0));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2); sun.position.set(40,70,35); sun.castShadow=true; scene.add(sun);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(500,500), new THREE.MeshStandardMaterial({color:'#182b3e',roughness:1}));
  ground.rotation.x=-Math.PI/2; ground.position.y=-.15; ground.receiveShadow=true; scene.add(ground);
  const grid = new THREE.GridHelper(160,32,'#34516a','#243a50'); grid.position.y=-.12; scene.add(grid);
  let alive=true;
  function resize(){ if(!alive)return; const w=container.clientWidth,h=container.clientHeight; camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h); }
  window.addEventListener('resize',resize);
  function animate(){if(!alive)return;requestAnimationFrame(animate);controls.update();renderer.render(scene,camera);}
  animate();
  return {scene,camera,renderer,controls,dispose(){alive=false;renderer.dispose();window.removeEventListener('resize',resize);}};
}

const steel = new THREE.MeshStandardMaterial({color:'#a9b9c6',metalness:.72,roughness:.34});
const darkSteel = new THREE.MeshStandardMaterial({color:'#607b91',metalness:.65,roughness:.4});
const insulatorMat = new THREE.MeshStandardMaterial({color:'#75c5c8',metalness:.25,roughness:.3});
const wireMat = new THREE.MeshStandardMaterial({color:'#d8c58f',metalness:.75,roughness:.25});
function beam(parent,a,b,r=.12,mat=steel){
  const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,delta.length(),8),mat);
  mesh.position.copy(start).add(end).multiplyScalar(.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function node(parent,x,y,z,r=.2,mat=darkSteel){const m=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),mat);m.position.set(x,y,z);parent.add(m);return m;}
function tubeBetween(parent, points, radius, material){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));
  const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,80,radius,8,false),material);mesh.castShadow=true;parent.add(mesh);return mesh;
}
function buildTower(scene){
  const group=new THREE.Group();scene.add(group);
  // Proportional teaching model: nominal overall height ~40 model units; not a specific tower type.
  const levels=[0,5,10,16,22,28,33,37,40];
  const half=[4.5,4.0,3.35,2.65,1.95,1.45,1.2,1.0,.85];
  for(let i=0;i<levels.length-1;i++){
    const y0=levels[i],y1=levels[i+1],w0=half[i],w1=half[i+1];
    const corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
    corners.forEach(([sx,sz])=>beam(group,[sx*w0,y0,sz*w0],[sx*w1,y1,sz*w1],.15));
    if(i%1===0){
      corners.forEach(([sx,sz],k)=>{const [tx,tz]=corners[(k+1)%4];beam(group,[sx*w0,y0,sz*w0],[tx*w0,y0,tz*w0],.105,darkSteel);});
      const mid=(y0+y1)/2,wm=(w0+w1)/2;
      corners.forEach(([sx,sz],k)=>{const [tx,tz]=corners[(k+1)%4];beam(group,[sx*w0,y0,sz*w0],[tx*w1,y1,tz*w1],.09,darkSteel);});
      corners.forEach(([sx,sz])=>beam(group,[sx*w0,y0,sz*w0],[sx*wm,mid,sz*wm],.075));
    }
  }
  // Cross braces on all four faces
  for(let i=0;i<levels.length-1;i++){
    const y0=levels[i],y1=levels[i+1],w0=half[i],w1=half[i+1];
    beam(group,[-w0,y0,-w0],[w1,y1,-w1],.085,darkSteel);
    beam(group,[w0,y0,-w0],[-w1,y1,-w1],.085,darkSteel);
    beam(group,[-w0,y0,w0],[w1,y1,w1],.085,darkSteel);
    beam(group,[w0,y0,w0],[-w1,y1,w1],.085,darkSteel);
  }
  // Waist platforms / horizontal diaphragms
  [5,10,16,22,28,33,37].forEach(y=>{
    const idx=levels.indexOf(y),w=half[idx];
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(([sx,sz],k,arr)=>{const [tx,tz]=arr[(k+1)%4];beam(group,[sx*w,y,sz*w],[tx*w,y,tz*w],.09,darkSteel);});
  });
  // Crossarms at three levels, two sides
  [25,30,35].forEach((y,j)=>{
    const length=[12,15,10][j];
    beam(group,[-length/2,y,0],[length/2,y,0],.22,steel);
    beam(group,[-length/2,y,0],[-length/2+1.5,y+1.4,0],.12,darkSteel);
    beam(group,[length/2,y,0],[length/2-1.5,y+1.4,0],.12,darkSteel);
    for(const x of [-length/2+.5,length/2-.5]){
      beam(group,[x,y,0],[x,y-2.2,0],.12,darkSteel);
      for(let k=0;k<7;k++){const yy=y-2.2+k*.32;const disc=new THREE.Mesh(new THREE.TorusGeometry(.28,.065,6,12),insulatorMat);disc.rotation.x=Math.PI/2;disc.position.set(x,yy,0);group.add(disc);}
    }
  });
  // Peak and ground wire peak supports
  beam(group,[-1,40,0],[0,44,0],.13);beam(group,[1,40,0],[0,44,0],.13);beam(group,[0,44,0],[0,47,0],.13);
  // Legs / foot plates
  for(const [x,z] of [[-4.5,-4.5],[4.5,-4.5],[4.5,4.5],[-4.5,4.5]]){
    const foot=new THREE.Mesh(new THREE.BoxGeometry(1.5,.35,1.5),darkSteel);foot.position.set(x,0,z);group.add(foot);
  }
  // Conductors and ground wire represented as adjacent spans
  const wireGroup=new THREE.Group();group.add(wireGroup);
  [-6,0,6].forEach((z,i)=>{
    tubeBetween(wireGroup,[[-20,26,z],[-10,24.5,z],[0,24,z],[10,24.5,z],[20,26,z]],.07,wireMat);
  });
  tubeBetween(wireGroup,[[-20,43,0],[-10,42.2,0],[0,42,0],[10,42.2,0],[20,43,0]],.055,insulatorMat);
  return {group,wireGroup};
}
let towerScene;
try{
  towerScene=makeScene('towerViewer',[58,42,66]);
  const tower=buildTower(towerScene.scene);
  $('resetTower').onclick=()=>{towerScene.camera.position.set(58,42,66);towerScene.controls.target.set(0,20,0);towerScene.controls.update();};
  towerScene.controls.target.set(0,21,0);
  let wiresVisible=true;
  $('wireToggle').onclick=()=>{wiresVisible=!wiresVisible;tower.wireGroup.visible=wiresVisible;$('wireToggle').textContent=wiresVisible?'隐藏导线':'显示导线';};
  const partInfo={
    tower:['塔身与塔腿','塔身由主材、斜材和横隔材等构件组成，将导线、地线及风荷载等作用传递至塔脚和基础。实际构造以具体塔型设计图为准。'],
    crossarm:['横担','横担是塔身向外伸出的支撑构件，用于布置绝缘子串及导线。其尺寸、挂点和受力条件由塔型设计确定。'],
    head:['塔头','塔头通常包括顶部及导线布置区域，承担地线支架、横担连接等结构功能。不同电压等级和塔型的塔头布置差异明显。'],
    insulator:['绝缘子串','绝缘子串连接杆塔与导线，提供电气绝缘并承担机械荷载。具体串型、片数和金具组合必须按设计文件核对。'],
    groundwire:['地线与避雷线位置','地线通常布置在导线上方，通过接地系统发挥雷电防护作用。具体保护角和布置方式以线路设计为准。']
  };
  document.querySelectorAll('.part-btn').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('.part-btn').forEach(x=>x.classList.toggle('selected',x===b));
    $('partTitle').textContent=partInfo[b.dataset.part][0];$('partText').textContent=partInfo[b.dataset.part][1];
  });
}catch(e){$('towerViewer').innerHTML='<div class="loading">三维模型加载失败，请检查网络连接后刷新页面。</div>';console.error(e);}

let sagScene, sagWire;
function makeSag(){
  if(sagScene)sagScene.dispose();
  sagScene=makeScene('sagViewer',[35,25,45]);
  sagScene.controls.target.set(0,8,0);
  const span=Number($('spanRange').value),sag=Number($('sagRange').value);
  const visualSpan=span/30, half=visualSpan/2;
  const supportMat=new THREE.MeshStandardMaterial({color:'#91a8b8',metalness:.55});
  [-half,half].forEach(x=>{
    const pole=new THREE.Mesh(new THREE.BoxGeometry(.5,25,.5),supportMat);pole.position.set(x,12.5,0);pole.castShadow=true;sagScene.scene.add(pole);
    const cap=new THREE.Mesh(new THREE.BoxGeometry(1.8,.35,1.2),darkSteel);cap.position.set(x,25,0);sagScene.scene.add(cap);
  });
  const pts=[];
  for(let i=0;i<=80;i++){const t=i/80;pts.push([-half+visualSpan*t,25-4*sag*t*(1-t),0]);}
  sagWire=tubeBetween(sagScene.scene,pts,.11,wireMat);
  // visual sag is represented by a parabola with lowest point at midspan
  const corrected=[];
  for(let i=0;i<=100;i++){const t=i/100;corrected.push([-half+visualSpan*t,25-4*sag*t*(1-t),0]);}
  sagWire.geometry.dispose();sagWire.geometry=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(corrected.map(p=>new THREE.Vector3(...p))),100,.11,8,false);
  const point=new THREE.Mesh(new THREE.SphereGeometry(.32,16,12),new THREE.MeshStandardMaterial({color:'#f2b66d'}));point.position.set(0,25-sag,0);sagScene.scene.add(point);
}
function updateSag(){
  const span=Number($('spanRange').value),sag=Number($('sagRange').value);
  $('spanValue').textContent=span;$('sagValue').textContent=sag.toFixed(1);
  $('spanMetric').textContent=span+' m';$('sagMetric').textContent=sag.toFixed(1)+' m';$('ratioMetric').textContent=(sag/span*100).toFixed(2)+'%';
  makeSag();
}
$('spanRange').addEventListener('input',updateSag);$('sagRange').addEventListener('input',updateSag);
$('resetSag').onclick=()=>{$('spanRange').value=300;$('sagRange').value=9;updateSag();};
try{updateSag();}catch(e){$('sagViewer').innerHTML='<div class="loading">三维模型加载失败，请检查网络连接后刷新页面。</div>';console.error(e);}

function calculate(){
  const q=Number($('loadInput').value),L=Number($('lengthInput').value),H=Number($('tensionInput').value);
  if(!Number.isFinite(q)||!Number.isFinite(L)||!Number.isFinite(H)||q<=0||L<=0||H<=0){$('calcResult').textContent='输入无效';$('calcExplain').textContent='请输入大于 0 的有效数值。';return;}
  const f=q*L*L/(8*H);
  $('calcResult').textContent=f.toFixed(3)+' m';
  $('calcExplain').textContent=`代入：${q} × ${L}² ÷ (8 × ${H}) = ${f.toFixed(3)} m。该数值仅用于理解简化公式。`;
}
$('calculateBtn').onclick=calculate;calculate();

const questions=[
 {q:'弧垂通常指什么？',a:['导线最低点到悬挂点连线的竖向距离','两基杆塔之间的水平距离','导线承受的拉力','铁塔总高度'],correct:0,why:'弧垂是导线最低点与两悬挂点连线之间的竖向距离；等高挂点时最容易理解。'},
 {q:'在简化公式 f ≈ qL²/(8H) 中，L 表示什么？',a:['导线温度','档距','水平张力','单位长度荷载'],correct:1,why:'L 表示档距，公式中档距以平方形式出现。'},
 {q:'下列哪项通常属于线路附件？',a:['基础垫层','防振锤','塔腿主材','接地沟'],correct:1,why:'防振锤属于线路附件，常用于抑制导线振动，安装要求以设计和施工文件为准。'},
 {q:'正式施工弧垂控制应主要依据什么？',a:['网页模拟器结果','经验估计','经批准的设计文件、弧垂表和施工方案','只看相邻档距'],correct:2,why:'现场施工必须按正式设计资料、批准的施工方案及适用规程执行，教学工具不能代替。'}
];
let qi=0,score=0,answered=false;
function renderQuestion(){
 const q=questions[qi];$('quizStep').textContent=`QUESTION ${qi+1} / ${questions.length}`;$('quizScore').textContent='得分：'+score;
 $('questionText').textContent=q.q;$('quizFeedback').textContent='选择一个答案后查看解析。';$('nextQuestion').disabled=true;$('nextQuestion').textContent=qi===questions.length-1?'查看结果':'下一题 →';answered=false;
 $('answerOptions').innerHTML='';
 q.a.forEach((answer,i)=>{const b=document.createElement('button');b.className='answer-option';b.textContent=String.fromCharCode(65+i)+'. '+answer;b.onclick=()=>selectAnswer(i);$('answerOptions').appendChild(b);});
}
function selectAnswer(index){
 if(answered)return;answered=true;const q=questions[qi];const buttons=[...document.querySelectorAll('.answer-option')];
 buttons.forEach((b,i)=>{b.disabled=true;if(i===q.correct)b.classList.add('correct');else if(i===index)b.classList.add('wrong');});
 if(index===q.correct){score++;$('quizFeedback').textContent='回答正确。'+q.why;}else{$('quizFeedback').textContent='再记一下：'+q.why;}
 $('quizScore').textContent='得分：'+score;$('nextQuestion').disabled=false;
}
$('nextQuestion').onclick=()=>{if(qi===questions.length-1){$('questionText').textContent=`测试完成：${score} / ${questions.length} 分`; $('answerOptions').innerHTML='';$('quizFeedback').textContent=score===questions.length?'全部答对，基础概念掌握得不错！':'建议回到知识课堂复习后再试一次。';$('nextQuestion').disabled=true;$('nextQuestion').textContent='已完成';return;}qi++;renderQuestion();};
$('restartQuiz').onclick=()=>{qi=0;score=0;renderQuestion();};renderQuestion();
