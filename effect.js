/* effect_custom.js
   Modernized logic for Slideshow, Audio, and Visual Effects.
   Works alongside legacy effect.js.
*/
(function(){
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));
  
  document.addEventListener('DOMContentLoaded', ()=>{
    // Elements
    const typedEl = $('#typed');
    const wishBtn = $('#wishBtn');
    const musicBtn = $('#musicBtn');
    const slideshowBtn = $('#slideshowBtn');
    const bgMusic = $('#bgMusic');
    const music2 = $('#music2');
    const overlay = $('#slideshowOverlay');
    const slideImg = $('#slideImg');
    const slideCaption = $('#slideCaption');
    const fireworksCanvas = $('#fireworks');

    // --- 1. Canvas Resizing (Responsive) ---
    function sizeCanvas(){
      if(!fireworksCanvas) return;
      fireworksCanvas.width = window.innerWidth;
      fireworksCanvas.height = window.innerHeight;
    }
    sizeCanvas();
    window.addEventListener('resize', sizeCanvas);

    // --- 2. Typing Effect (Intro) ---
    if(typedEl) {
      const lines = [
        "Initiating Surprise Sequence...",
        "Analyzing Friendship Levels... 100% 🔥",
        "Status: LEGENDARY",
        "Welcome, RISHI!"
      ];
      let lineIndex = 0;
      let charIndex = 0;
      
      function typeLine() {
        if (lineIndex >= lines.length) {
           // End state
           typedEl.innerHTML = "Make a wish and start the party! 👇";
           return; 
        }
        const currentLine = lines[lineIndex];
        if (charIndex < currentLine.length) {
          typedEl.textContent += currentLine.charAt(charIndex);
          charIndex++;
          setTimeout(typeLine, 50);
        } else {
          // Line finished, wait then clear
          setTimeout(() => {
            if(lineIndex < lines.length - 1) typedEl.textContent = '';
            lineIndex++;
            charIndex = 0;
            typeLine();
          }, 1500);
        }
      }
      // Start typing after a short delay
      setTimeout(typeLine, 1000);
    }

    // --- 3. Confetti Burst ---
    function burstConfetti() {
      if (typeof confetti === 'function') {
        // Canon 1
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999
        });
        // Canon 2
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            zIndex: 9999
          });
        }, 200);
        // Canon 3
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            zIndex: 9999
          });
        }, 400);
      }
    }

    if(wishBtn) {
      wishBtn.addEventListener('click', () => {
        burstConfetti();
        // Simple button reaction
        wishBtn.textContent = "Wish Granted! 🧞‍♂️";
        setTimeout(() => wishBtn.textContent = "Make another Wish ✨", 3000);
      });
    }

    // --- 4. Music Toggle ---
    if(musicBtn && bgMusic) {
      musicBtn.addEventListener('click', () => {
        if(bgMusic.paused) {
          bgMusic.play().catch(e => console.log("Audio blocked:", e));
          musicBtn.textContent = "Pause Music ⏸️";
          musicBtn.classList.add('active');
        } else {
          bgMusic.pause();
          musicBtn.textContent = "Play Music 🎵";
          musicBtn.classList.remove('active');
        }
      });
    }

    // --- 5. Slideshow Logic (The Core Feature) ---
    const slides = [
      { file: 'p1.jpg', msg: "Rishi bhai... tu na alag hi level ka insaan hai 🤌" },
      { file: 'p2.jpg', msg: "bhot sari khushiya tere liye... hamesa" },
      { file: 'p3.jpg', msg: "tu jesa dost milna mushkil hota h re" },
      { file: 'p4.jpg', msg: "kabhi kabhi gussa bhi aata, pr phir bhi best tu hi h 😂💙" },
      { file: 'thankyou.jpg', msg: "Thanks for being you, Rishi. Much love ❤️" }
    ];

    let currentSlide = 0;
    let slideTimer;

    function showSlide(index) {
      if(!slideImg) return;
      // Reset animation
      slideImg.style.opacity = 0;
      
      setTimeout(() => {
        slideImg.src = slides[index].file;
        slideCaption.textContent = slides[index].msg;
        slideImg.style.opacity = 1;
        // Simple pan effect via CSS class
        slideImg.className = (index % 2 === 0) ? 'pan-left' : 'pan-right';
      }, 300);
    }

    function nextSlide() {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    }

    function prevSlide() {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    }

    function startSlideshow() {
      if(overlay) {
        overlay.classList.add('active');
        // Stop background music, start emotional music
        if(bgMusic) bgMusic.pause();
        if(music2) {
          music2.currentTime = 0;
          music2.play().catch(e=>console.log(e));
        }
        currentSlide = 0;
        showSlide(0);
        // Auto advance
        slideTimer = setInterval(nextSlide, 4000);
      }
    }

    function stopSlideshow() {
      if(overlay) overlay.classList.remove('active');
      clearInterval(slideTimer);
      if(music2) music2.pause();
      if(bgMusic && musicBtn.textContent.includes("Pause")) bgMusic.play(); 
    }

    if(slideshowBtn) slideshowBtn.addEventListener('click', startSlideshow);
    const closeSlideBtn = $('#endSlides');
    if(closeSlideBtn) closeSlideBtn.addEventListener('click', stopSlideshow);
    
    const nextBtn = $('#nextSlide');
    const prevBtn = $('#prevSlide');
    if(nextBtn) nextBtn.addEventListener('click', () => {
      clearInterval(slideTimer); // Stop auto on interaction
      nextSlide();
    });
    if(prevBtn) prevBtn.addEventListener('click', () => {
      clearInterval(slideTimer);
      prevSlide();
    });

  });
})();
		
