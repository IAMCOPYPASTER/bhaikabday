/* effect_custom.js
   Enhanced features: slideshow cinematic pans, caption typing, fireworks finale,
   heartbeat glow synced to music2 via WebAudio analyser.
   Safe to run AFTER the original effect.js (preserves original animations).
*/
(function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  const clamp = (v,a,b)=> Math.max(a,Math.min(b,v));

  document.addEventListener('DOMContentLoaded', ()=>{
    const typedEl = $('#typed');
    const wishBtn = $('#wishBtn');
    const musicBtn = $('#musicBtn');
    const slideshowBtn = $('#slideshowBtn');
    const downloadBtn = $('#downloadBtn');
    const bgMusic = $('#bgMusic');
    const music2 = $('#music2');
    const overlay = $('#slideshowOverlay');
    const slideImg = $('#slideImg');
    const slideCaption = $('#slideCaption');
    const prevBtn = $('#prevSlide');
    const nextBtn = $('#nextSlide');
    const endSlides = $('#endSlides');
    const fireworksCanvas = $('#fireworks');
    const heartbeatGlow = $('#heartbeatGlow');
    const finalText = $('#finalText');

    // Slides & captions
    const slides = [
      {file:'p1.jpg', msg:"Rishi bhai... tu na alag hi level ka insaan hai 🤌", pan:'left'},
      {file:'p2.jpg', msg:"bhot sari khushiya tere liye... hamesa", pan:'right'},
      {file:'p3.jpg', msg:"tu jesa dost milna mushkil hota h re", pan:'zoom'},
      {file:'p4.jpg', msg:"kabhi kabhi gussa bhi aata, pr phir bhi best tu hi h 😂💙", pan:'left'},
      {file:'p5.jpg', msg:"teri smile... bhai sach me dangerous cute h 😭🔥", pan:'right'},
      {file:'p6.jpg', msg:"teri life me sirf success success aur orr bhi success aaye", pan:'zoom'},
      {file:'p7.jpg', msg:"last me... bas itna ki... i m proud of u bro ❤️", pan:'center'},
      {file:'thankyou.jpg', msg:"Thanks for being you, Rishi. Much love ❤️", pan:'center'}
    ];

    const slideDuration = 2000; // 2s per pic
    let slideIndex = 0;
    let timer = null;
    let running = false;

    // ensure canvas
    function sizeCanvas(){
      if(!fireworksCanvas) return;
      fireworksCanvas.width = window.innerWidth;
      fireworksCanvas.height = window.innerHeight;
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    // typing intro
    (function typeIntro(){
      if(!typedEl) return;
      const lines = [
        "RISHI! Today your legend level rises.",
        "May you crush goals, beat odds and celebrate wins.",
        "Make a wish and blow the candles. 🎂"
      ];
      let li=0, ci=0;
      typedEl.textContent='';
      function step(){
        if(li>=lines.length) return;
        const s = lines[li];
        if(ci < s.length){
          typedEl.textContent += s[ci++];
          setTimeout(step, 36 + Math.random()*36);
        } else { li++; ci=0; typedEl.textContent += ' '; setTimeout(step, 600); }
      }
      setTimeout(step, 600);
    })();

    // confetti helper
    function confettiBurst(){
      if(typeof confetti === 'function'){
        confetti({particleCount:140, spread:90, origin:{y:0.6}});
        confetti({particleCount:60, spread:120, origin:{x:0.2,y:0.4}});
      }
    }
    if(wishBtn) wishBtn.addEventListener('click', ()=>{ confettiBurst(); });

    // fireworks renderer
    const fw = (function(){
      if(!fireworksCanvas) return null;
      const ctx = fireworksCanvas.getContext('2d');
      const parts = [];
      function spawn(x,y,cols=8){
        for(let i=0;i<cols*8;i++){
          parts.push({
            x,y,
            vx:(Math.random()-0.5)*6,
            vy:(Math.random()-0.9)*6,
            alpha:1,
            size:1+Math.random()*3,
            color: `hsl(${Math.random()*360},80%,60%)`
          });
        }
      }
      function loop(){
        ctx.clearRect(0,0,fireworksCanvas.width, fireworksCanvas.height);
        for(let i=parts.length-1;i>=0;i--){
          const p = parts[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.06;
          p.alpha -= 0.01 + Math.random()*0.01;
          if(p.alpha<=0){ parts.splice(i,1); continue; }
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(loop);
      }
      loop();
      return { spawn };
    })();

    // audio fade
    function fadeAudio(audio,target,duration=900){
      if(!audio) return Promise.resolve();
      target = clamp(target,0,1);
      const start = audio.volume || 0;
      const delta = target - start;
      if(Math.abs(delta) < 0.01){ audio.volume = target; return Promise.resolve(); }
      const t0 = performance.now();
      return new Promise(res=>{
        function tick(now){
          const t = clamp((now-t0)/duration,0,1);
          audio.volume = start + delta*t;
          if(t<1) requestAnimationFrame(tick);
          else res();
        }
        requestAnimationFrame(tick);
      });
    }

    // music play/pause button
    if(musicBtn && bgMusic){
      musicBtn.addEventListener('click', ()=>{
        if(bgMusic.paused){
          bgMusic.play().catch(()=>{});
          musicBtn.textContent='Pause Music ⏸️';
          musicBtn.setAttribute('aria-pressed','true');
        } else {
          bgMusic.pause();
          musicBtn.textContent='Play Music ▶️';
          musicBtn.setAttribute('aria-pressed','false');
        }
      });
    }

    // heartbeat glow via analyser
    let audioCtx, analyser, dataArray, sourceNode, heartbeatInterval;
    function setupAnalyser(){
      try{
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        dataArray = new Uint8Array(analyser.frequencyBinCount);
        sourceNode = audioCtx.createMediaElementSource(music2);
        sourceNode.connect(analyser);
        analyser.connect(audioCtx.destination);

        heartbeatInterval = setInterval(()=>{
          if(!analyser) return;
          analyser.getByteFrequencyData(dataArray);
          let sum=0;
          for(let i=0;i<8;i++) sum+=dataArray[i];
          const avg = sum/8/255;

          if(heartbeatGlow) heartbeatGlow.style.opacity = (0.06 + avg*0.4).toString();
          if(finalText) finalText.style.transform = `translateX(-50%) scale(${1 + avg*0.06})`;
        },120);

      }catch(e){ console.warn(e); }
    }

    // slideshow
    function showOverlay(on=true){
      overlay.classList.toggle('active', !!on);
      overlay.setAttribute('aria-hidden', on?'false':'true');
    }

    function applyPan(el, type){
      if(!el) return;
      el.style.transition = 'transform 1.8s cubic-bezier(.2,.8,.2,1), opacity 0.9s ease';
      if(type==='left') el.style.transform='scale(1.09) translateX(-6%)';
      else if(type==='right') el.style.transform='scale(1.09) translateX(6%)';
      else if(type==='zoom') el.style.transform='scale(1.12)';
      else el.style.transform='scale(1.06)';
    }

    function resetPan(el){ if(el) el.style.transform='scale(1)'; }

    function typeCaption(text, el){
      return new Promise(res=>{
        el.textContent='';
        let i=0;
        function step(){
          if(i < text.length){
            const ch = text[i++];
            el.textContent += ch;
            if(Math.random() < 0.03){
              const wrong = String.fromCharCode(97+Math.floor(Math.random()*26));
              el.textContent += wrong;
              setTimeout(()=>{ el.textContent = el.textContent.slice(0,-1); }, 160);
            }
            setTimeout(step, 30 + Math.random()*40);
          } else res();
        }
        step();
      });
    }

    function setSlide(i){
      const s = slides[i];
      slideImg.classList.remove('show');
      setTimeout(()=>{
        slideImg.src = s.file;
        slideCaption.textContent='';
        resetPan(slideImg);
        void slideImg.offsetWidth;
        slideImg.classList.add('show');
        setTimeout(()=>applyPan(slideImg, s.pan),80);
        typeCaption(s.msg, slideCaption);
      },80);
    }

    function startSlides(){
      if(running) return;
      running = true;
      slideIndex = 0;

      fadeAudio(bgMusic,0,900)
      .then(()=>{ try{ bgMusic.pause(); }catch(e){} })
      .then(()=>{
        music2.volume=0; music2.currentTime=0; music2.play().catch(()=>{});
        try{ if(!audioCtx) setupAnalyser(); }catch(e){}
        return fadeAudio(music2,1,1200);
      })
      .then(()=>{
        showOverlay(true);
        setSlide(slideIndex);
        timer = setInterval(()=>{
          slideIndex++;
          if(slideIndex >= slides.length){
            runFinale();
            return;
          }
          setSlide(slideIndex);
        }, slideDuration);
      });
    }

    function stopSlides(){
      running = false;
      clearInterval(timer);
      showOverlay(false);
      fadeAudio(music2,0,900).then(()=>{ try{ music2.pause(); }catch(e){} });
      if(audioCtx){ try{ audioCtx.close(); }catch(e){}; audioCtx=null; }
      if(heartbeatInterval) clearInterval(heartbeatInterval);
      if(finalText) finalText.classList.remove('show');
    }

    function runFinale(){
      clearInterval(timer);
      slideIndex = slides.length - 1;
      setSlide(slideIndex);

      setTimeout(()=>{
        if(fw){
          for(let i=0;i<6;i++){
            setTimeout(()=> fw.spawn(
              window.innerWidth*(0.2 + Math.random()*0.6),
              160 + Math.random()*200,
              12 + Math.floor(Math.random()*8)
            ), i*300);
          }
        }
        if(finalText) finalText.classList.add('show');
        fadeAudio(music2,0.4,900);

        setTimeout(()=>{ 
          if(typeof confetti==='function') confetti({particleCount:200,spread:160,origin:{y:0.6}});
        },1300);

        setTimeout(()=>{ stopSlides(); },7000);
      },800);
    }

    if(slideshowBtn) slideshowBtn.addEventListener('click', ()=>{ startSlides(); });
    if(endSlides) endSlides.addEventListener('click', ()=>{ stopSlides(); });
    if(prevBtn) prevBtn.addEventListener('click', ()=>{ if(running){ slideIndex=Math.max(0,slideIndex-1); setSlide(slideIndex);} });
    if(nextBtn) nextBtn.addEventListener('click', ()=>{ if(running){ slideIndex=Math.min(slides.length-1,slideIndex+1); setSlide(slideIndex);} });

    setTimeout(()=>{ 
      if(typeof confetti==='function') confetti({particleCount:60,spread:60,origin:{y:0.6}}); 
    },1100);

    window._birthdayCustom = { startSlides, stopSlides, confettiBurst };
  });
})();