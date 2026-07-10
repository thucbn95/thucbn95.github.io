document.addEventListener('DOMContentLoaded', () => {
const bgMusic=document.getElementById('bgMusic');
const musicToggle=document.getElementById('musicToggle');
let musicStarted=false;
async function startMusic(){
  if(!bgMusic.paused) return;
  try{bgMusic.volume=.65;await bgMusic.play();musicStarted=true;musicToggle.querySelector('span').textContent='🔊';}catch(e){musicToggle.querySelector('span').textContent='🔇';}
}
musicToggle.addEventListener('click',async()=>{
  if(bgMusic.paused){await startMusic();}else{bgMusic.pause();musicToggle.querySelector('span').textContent='🔇';}
});

const canvas=document.getElementById('confetti');
const ctx=canvas.getContext('2d');
let pieces=[];
function resize(){canvas.width=innerWidth;canvas.height=innerHeight}
addEventListener('resize',resize);resize();
function burst(){
  pieces=Array.from({length:180},()=>({x:innerWidth/2,y:innerHeight*.45,vx:(Math.random()-.5)*14,vy:Math.random()*-11-3,g:.22+Math.random()*.12,r:3+Math.random()*5,a:1,c:['#ff5f9e','#8d6cff','#ffd36f','#63d8ce','#ffffff'][Math.floor(Math.random()*5)]}));
  animate();
}
function animate(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  pieces.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=p.g;p.a-=.006;ctx.globalAlpha=Math.max(p.a,0);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.r,p.r*1.8)});
  pieces=pieces.filter(p=>p.a>0&&p.y<innerHeight+50);ctx.globalAlpha=1;if(pieces.length)requestAnimationFrame(animate);
}

const wait=ms=>new Promise(r=>setTimeout(r,ms));
const photos=Array.from({length:10},(_,i)=>`/images/${String(i+1).padStart(2,'0')}.jpg`);
let sequenceRunning=false;
let lockedScrollY=0;

function lockPageScroll(){
  if(document.body.classList.contains('story-open')) return;
  lockedScrollY=window.scrollY || window.pageYOffset || 0;
  document.body.style.top=`-${lockedScrollY}px`;
  document.body.classList.add('story-open');
}

function unlockPageScroll(){
  if(!document.body.classList.contains('story-open')) return;
  document.body.classList.remove('story-open');
  document.body.style.top='';
  window.scrollTo(0,lockedScrollY);
}

async function preloadPhotos(){
  await Promise.all(photos.map(src=>new Promise(resolve=>{const im=new Image();im.onload=im.onerror=resolve;im.src=src;})));
}
async function runBirthdaySequence(){
  if(sequenceRunning)return;
  sequenceRunning=true;

  const celebrate=document.getElementById('celebrate');
  const intro=document.getElementById('cinematicIntro');
  const overlay=document.getElementById('storyOverlay');
  const imageA=document.getElementById('storyImageA');
  const imageB=document.getElementById('storyImageB');
  const endCard=document.getElementById('storyEndCard');
  const progress=[...document.querySelectorAll('.story-progress span')];
  const messageBox=document.querySelector('.message');

  // Reset toàn bộ trạng thái cũ để slideshow có thể chạy lại nhiều lần.
  intro.classList.remove('show');
  overlay.classList.remove('show');
  endCard.classList.remove('show');
  imageA.classList.remove('active');
  imageB.classList.remove('active');
  imageA.removeAttribute('src');
  imageB.removeAttribute('src');
  progress.forEach(item=>item.classList.remove('playing','done'));
  messageBox.classList.add('reveal-message');
  messageBox.classList.remove('show');
  document.body.classList.remove('story-open');
  void overlay.offsetWidth;

  celebrate.classList.add('is-running');
  celebrate.textContent='Món quà đang mở... 💖';
  startMusic();
  burst();
  await wait(100);

  lockPageScroll();
  intro.classList.add('show');
  await wait(2300);

  await preloadPhotos();
  overlay.classList.add('show');
  lockPageScroll();
  intro.classList.remove('show');
  await wait(650);

  let current=imageA,next=imageB;
  for(let i=0;i<photos.length;i++){
    current.src=photos[i];
    await new Promise(resolve=>{if(current.complete)resolve();else{current.onload=current.onerror=resolve;}});
    current.classList.add('active');

    progress[i].classList.remove('playing','done');
    void progress[i].offsetWidth;
    progress[i].classList.add('playing');

    await wait(2500);
    progress[i].classList.remove('playing');
    progress[i].classList.add('done');

    if(i<photos.length-1){
      next.src=photos[i+1];
      await new Promise(resolve=>{if(next.complete)resolve();else{next.onload=next.onerror=resolve;}});
      next.classList.add('active');
      current.classList.remove('active');
      const t=current;current=next;next=t;
    }
  }

  endCard.classList.add('show');
  await wait(2400);

  const messageSection=document.getElementById('loi-chuc');
  const root=document.documentElement,body=document.body;
  const oldRoot=root.style.scrollBehavior,oldBody=body.style.scrollBehavior;
  root.style.scrollBehavior='auto';body.style.scrollBehavior='auto';
  const messageTop=messageSection.getBoundingClientRect().top+window.pageYOffset;
  window.scrollTo(0,messageTop);
  await new Promise(requestAnimationFrame);

  overlay.classList.remove('show');

  // Mở khóa cuộn sau khi slideshow kết thúc.
  document.body.classList.remove('story-open');
  document.body.style.top='';
  window.scrollTo(0,messageTop);
  await wait(700);

  root.style.scrollBehavior=oldRoot;
  body.style.scrollBehavior=oldBody;
  messageBox.classList.add('show');

  // Sau khi hiệu ứng hoàn tất, trả lời chúc về trạng thái hiển thị bình thường.
  setTimeout(() => {
    messageBox.classList.remove('reveal-message', 'show');
  }, 950);

  // Dọn trạng thái còn lại để lần bấm tiếp theo bắt đầu sạch từ đầu.
  endCard.classList.remove('show');
  imageA.classList.remove('active');
  imageB.classList.remove('active');
  progress.forEach(item=>item.classList.remove('playing','done'));

  celebrate.classList.remove('is-running');
  celebrate.textContent='Xem lại bất ngờ 🎉';
  sequenceRunning=false;
}

document.getElementById('celebrate').addEventListener('click',runBirthdaySequence);

const backToTop=document.getElementById('backToTop');
const toggleBackToTop=()=>backToTop.classList.toggle('show',window.scrollY>300);
window.addEventListener('scroll',toggleBackToTop,{passive:true});toggleBackToTop();
backToTop.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));

const message=document.querySelector('.message');


let lastHeart=0;
document.addEventListener('pointermove',e=>{
  const now=Date.now();if(now-lastHeart<90)return;lastHeart=now;
  const h=document.createElement('span');h.className='floating-heart';h.textContent=Math.random()>.5?'💖':'💕';h.style.left=e.clientX+'px';h.style.top=e.clientY+'px';document.body.appendChild(h);setTimeout(()=>h.remove(),1500);
});
});
