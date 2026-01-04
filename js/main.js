import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { createBloomTextScene } from "./szene1.js";

document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // =======================================
    // --- BURGER NAVIGATION LOGIC ---
    // =======================================
    const burgerButton = document.getElementById('burger-button');
    const topNav = document.getElementById('top-navigation');
    if (burgerButton && topNav) {
        burgerButton.addEventListener('click', () => {
            topNav.classList.toggle('nav-open');
        });
    }

    // =======================================
    // --- TRANSLATIONS & LANGUAGE SWITCH ---
    // =======================================
   /* const translations = {
        de: {
            // About
            'about-title': 'Über Mich',
            'about-p1': 'Hallo! Ich bin Kefei, eine Entwicklerin mit einer Leidenschaft für die Verbindung von Code und Design. Von 3D-Modellierung in Blender bis hin zur Entwicklung interaktiver Web-Erlebnisse liebe ich es, digitale Welten zu erschaffen, die sowohl funktional als auch ästhetisch ansprechend sind.',
            'about-p2': 'Mein Studiengang an der Uni Bremen ist Digitale Medien. Diese Seite ist ein kleiner Einblick in meine Projekte und Lernprozess. Viel Spaß beim Entdecken!',
            
            // Podcast
            'podcast-title': 'Podcast: Lemon Season',
            'podcast-p': 'Zusammen mit einer Freundin produziere ich "Lemon Season", einen chinesischen Podcast, in dem wir offen und ehrlich über die Herausforderungen und Freuden des Erwachsenwerdens sprechen. Wir teilen persönliche Geschichten, geben Tipps und schaffen einen Raum für authentische Gespräche.',
            'podcast-button-text': 'Auf Apple Podcasts anhören',
            
            // Portfolio
            'portfolio-caption-1': 'Kaktus Modellierung',
            'portfolio-caption-2': 'Modellierung für Das Mädchen mit dem Perlenohrring',
            'portfolio-caption-3': 'Interaktion des Kaktus-Modells in Unreal Engine',
            'portfolio-caption-4': 'Tile-Based-Game: Blumen-Jäger',
            'portfolio-code-title': 'Code-Ausschnitt (1. Semester, Grundlage der Programmierung)',
            
            // Contact & Titles
            'contact-title': 'Kontakt',
            'contact-p': 'Sie können mich über die folgenden Plattformen erreichen:'
            // Note: Since you likely use a generic <h2> for section titles, 
            // ensure you have IDs on your "Gallery" and "Portfolio" headers in HTML if you want to translate them.
            // Example: <h2 id="gallery-title">Gallery</h2>
        },
        en: {
            // About
            'about-title': 'About Me',
            'about-p1': 'Hello! I\'m Kefei, a developer with a passion for connecting code and design. From 3D modeling in Blender to developing interactive web experiences, I love creating digital worlds that are both functional and aesthetically pleasing.',
            'about-p2': 'I am studying Digital Media at the University of Bremen. This site is a small glimpse into my projects and learning process. Have fun exploring!',
            
            // Podcast
            'podcast-title': 'Podcast: Lemon Season',
            'podcast-p': 'Together with a friend, I produce "Lemon Season," a Chinese podcast where we talk openly and honestly about the challenges and joys of growing up. We share personal stories, give tips, and create a space for authentic conversations.',
            'podcast-button-text': 'Listen on Apple Podcasts',
            
            // Portfolio
            'portfolio-caption-1': 'Cactus Modeling',
            'portfolio-caption-2': 'Modeling for The Girl with the Pearl Earring',
            'portfolio-caption-3': 'Interaction of the Cactus Model in Unreal Engine',
            'portfolio-caption-4': 'Tile-Based Game: Flower Hunter',
            'portfolio-code-title': 'Code Snippet (1st Semester, Fundamentals of Programming)',
            
            // Contact & Titles
            'contact-title': 'Contact',
            'contact-p': 'You can reach me via the following platforms:'
        }
    };

    const langSwitcher = document.getElementById('lang-switcher');
    
    // Select all elements that need translation
    // IMPORTANT: Make sure these IDs exist in your HTML!
    const elementsToTranslate = {
        'about-title': document.getElementById('about-title'),
        'about-p1': document.getElementById('about-p1'),
        'about-p2': document.getElementById('about-p2'),
        'podcast-title': document.getElementById('podcast-title'),
        'podcast-p': document.getElementById('podcast-p'),
        'podcast-button-text': document.getElementById('podcast-button-text'),
        'portfolio-caption-1': document.getElementById('portfolio-caption-1'),
        'portfolio-caption-2': document.getElementById('portfolio-caption-2'),
        'portfolio-caption-3': document.getElementById('portfolio-caption-3'),
        'portfolio-caption-4': document.getElementById('portfolio-caption-4'),
        'portfolio-code-title': document.getElementById('portfolio-code-title'),
        'contact-title': document.getElementById('contact-title'),
        'contact-p': document.getElementById('contact-p')
    };

    let currentLang = 'en';

    function switchLanguage() {
        const newLang = currentLang === 'de' ? 'en' : 'de';
        
        // Filter out any elements that might be missing from HTML (prevents errors)
        const activeElements = Object.values(elementsToTranslate).filter(el => el !== null);
        
        gsap.to(activeElements, {
            duration: 0.3,
            autoAlpha: 0,
            ease: 'power1.in',
            onComplete: () => {
                // 1. Update text content
                for (const key in elementsToTranslate) {
                    if (elementsToTranslate[key]) {
                        // Check if translation exists before applying
                        if (translations[newLang][key]) {
                            elementsToTranslate[key].textContent = translations[newLang][key];
                        }
                    }
                }
                
                // 2. Update button and state
                langSwitcher.textContent = newLang === 'de' ? 'EN' : 'DE';
                currentLang = newLang;

                // 3. !!! CRITICAL FIX !!! 
                // Refresh ScrollTrigger because text length changed page height
                ScrollTrigger.refresh();

                // 4. Fade back in
                gsap.to(activeElements, {
                    duration: 0.3,
                    autoAlpha: 1,
                    ease: 'power1.out',
                    delay: 0.1
                });
            }
        });
    }

    if (langSwitcher) {
        langSwitcher.addEventListener('click', switchLanguage);
    }
*/
    // ===============================================
    // --- DYNAMIC PARTICLE SILHOUETTE SYSTEM ---
    // ===============================================
    const particleCanvas = document.getElementById('particle-canvas');
    if (particleCanvas) {
        const ctx = particleCanvas.getContext('2d');
        const silhouetteImage = document.getElementById('silhouette-image');

        let particlesArray = [];
        const numberOfParticles = 1500;
        const landingSpots = [];
        let animationFrameId;

        const PIXEL_SCAN_STEP = 5;
        const MAX_PARTICLE_SIZE = 14; 
        
        let silhouetteProgress = 0;

        const mouse = { x: null, y: null, radius: 100 };
        window.addEventListener('mousemove', (event) => {
            mouse.x = event.x;
            mouse.y = event.y;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * particleCanvas.width;
                this.y = Math.random() * particleCanvas.height;
                this.naturalX = this.x;
                this.naturalY = this.y;
                this.targetX = 0;
                this.targetY = 0;
                this.speedX = Math.random() * 0.4 - 0.2;
                this.speedY = Math.random() * 0.5 + 0.1;
                this.baseSize = Math.random() * 4+ 1;
                this.size = this.baseSize;
                this.color = this.getRandomColor();
                this.angle = Math.random() * Math.PI * 2;
                this.spin = Math.random() * 0.04 - 0.02;
                this.isSilhouetteParticle = false; 
            }

            setTarget(target) { 
                this.targetX = target.x; 
                this.targetY = target.y; 
                this.isSilhouetteParticle = true;
            }

            getRandomColor() { const colors = ['#0378129b', '#a6d76a', '#a0c134', '#c0e7a6']; return colors[Math.floor(Math.random() * colors.length)]; }
            
            update() {
                this.naturalX += this.speedX;
                this.naturalY += this.speedY;
                this.angle += this.spin;

                if (this.naturalY > particleCanvas.height + this.size) {
                    this.naturalY = 0 - this.size;
                    this.naturalX = Math.random() * particleCanvas.width;
                }

                if (this.isSilhouetteParticle) {
                    this.x = gsap.utils.interpolate(this.naturalX, this.targetX, silhouetteProgress);
                    this.y = gsap.utils.interpolate(this.naturalY, this.targetY, silhouetteProgress);
                    this.size = (silhouetteProgress * (MAX_PARTICLE_SIZE - this.baseSize))*0.5;
                } else {
                    this.x = this.naturalX;
                    this.y = this.naturalY;
                    this.size = this.baseSize;
                }

                if (!this.isSilhouetteParticle || silhouetteProgress < 0.9) {
                    let dx = mouse.x - this.x;
                    let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        this.naturalX -= dx / 15;
                        this.naturalY -= dy / 15;
                    }
                }
            }
            
            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.angle);
                ctx.fillStyle = this.color;
                const leafWidth = this.size;
                const leafHeight = this.size * 2.5;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(leafWidth, -leafHeight / 2, leafWidth / 2, -leafHeight * 0.8, 0, -leafHeight);
                ctx.bezierCurveTo(-leafWidth / 2, -leafHeight * 0.8, -leafWidth, -leafHeight / 2, 0, 0);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, -leafHeight);
                ctx.strokeStyle = '#ddeab6';
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(0, 0);
                const stemLength = this.size * 0.7;
                ctx.lineTo(0, stemLength);
                ctx.strokeStyle = '#3e6534';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
            }
        }

        function getLandingSpotsFromImage(image) {
            landingSpots.length = 0;
            const scale = 0.72;
            const imgWidth = particleCanvas.width * scale;
            const imgHeight = imgWidth * (image.height / image.width);
            const startX = (particleCanvas.width - imgWidth) / 2;
            const startY = particleCanvas.height - imgHeight - 20;

            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = imgWidth;
            tempCanvas.height = imgHeight;
            tempCtx.drawImage(image, 0, 160, imgWidth, imgHeight);
            
            const imageData = tempCtx.getImageData(0, 0, imgWidth, imgHeight);
            for (let y = 0; y < imageData.height; y += PIXEL_SCAN_STEP) {
                for (let x = 0; x < imageData.width; x += PIXEL_SCAN_STEP) {
                    if (imageData.data[(y * imageData.width + x) * 4 + 3] > 128) {
                        landingSpots.push({ x: startX + x, y: startY + y });
                    }
                }
            }
        }

        function initParticles() {
            particlesArray = [];
            landingSpots.sort(() => Math.random() - 0.5);
            const silhouetteParticleCount = landingSpots.length;

            for (let i = 0; i < numberOfParticles; i++) {
                const particle = new Particle();
                if (i < silhouetteParticleCount) {
                    const target = landingSpots[i];
                    if(target) particle.setTarget(target);
                }
                particlesArray.push(particle);
            }
        }

        function animateParticles() {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            particlesArray.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animateParticles);
        }
        
        function reinitializeParticleSystem() {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;
            getLandingSpotsFromImage(silhouetteImage);
            if (landingSpots.length > 0) {
                initParticles();
                animateParticles();
            } else {
                initParticles(); 
                animateParticles();
            }
        }

        function debounce(func, delay) {
            let timeout;
            return function(...args) {
                const context = this;
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(context, args), delay);
            };
        }

        ScrollTrigger.create({
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: 1.5,
            onUpdate: (self) => {
                const globalProgress = self.progress;
                const formationStartThreshold = 0.8;
                silhouetteProgress = gsap.utils.mapRange(formationStartThreshold, 1, 0, 1, globalProgress);
            }
        });

        silhouetteImage.onload = () => {
            reinitializeParticleSystem();
            window.addEventListener('resize', debounce(reinitializeParticleSystem, 250));
        };

        if (silhouetteImage.complete && silhouetteImage.naturalWidth !== 0) {
            silhouetteImage.onload();
        }
    }

    // ==================================================
    // --- ORIGINAL Three.js & GSAP LOGIC ---
    // ==================================================
    const videoButton = document.getElementById("replay-button"), gameVideo = document.getElementById("game-video");
    if (videoButton && gameVideo) {
        const togglePlayPause = () => gameVideo.paused || gameVideo.ended ? gameVideo.play() : gameVideo.pause();
        videoButton.addEventListener("click", togglePlayPause);
        gameVideo.addEventListener("play", () => videoButton.classList.remove("paused"));
        gameVideo.addEventListener("pause", () => videoButton.classList.add("paused"));
        gameVideo.addEventListener("ended", () => videoButton.classList.add("paused"));
        videoButton.classList.add("paused");
    }
    const bloomTextCanvas = document.getElementById("bloom-text-canvas");
    const bloomTextRenderer = new THREE.WebGLRenderer({ canvas: bloomTextCanvas, alpha: true, antialias: true });
    const bloomTextScene = createBloomTextScene();
    const vrmCanvas = document.getElementById("vrm-canvas");
    const vrmPlaceholder = document.getElementById("vrm-placeholder");
    const vrmRenderer = new THREE.WebGLRenderer({ canvas: vrmCanvas, alpha: true, antialias: true });
    const vrmScene = new THREE.Scene();
    const vrmCamera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
    vrmCamera.position.set(0.0, 0.8, 3.5);
    const controls = new OrbitControls(vrmCamera, vrmPlaceholder);
    controls.target.set(0.0, 0.8, 0.0);
    vrmScene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const light = new THREE.DirectionalLight(0xffffff, Math.PI);
    light.position.set(1.0, 1.0, 1.0).normalize();
    vrmScene.add(light);
    let currentVrm;
    new GLTFLoader().register(p => new VRMLoaderPlugin(p)).load("./Avatar_Kefei.vrm", (gltf) => {
        currentVrm = gltf.userData.vrm;
        currentVrm.scene.rotation.y = Math.PI;
        vrmScene.add(currentVrm.scene);
    });

    const animatedScrollElements = document.querySelectorAll(".anim-reveal");
    function handleScrollAnimations() {
        const viewportHeight = window.innerHeight;
        animatedScrollElements.forEach(elem => {
            const rect = elem.getBoundingClientRect();
            const start = viewportHeight * 0.8;
            const end = viewportHeight * 0.2;
            const activeZoneHeight = start - end;
            const progress = Math.max(0, Math.min(1, (start - rect.top) / activeZoneHeight));
            const easedProgress = progress * progress * (3 - 2 * progress);
            const maxInset = 25;
            const insetAmount = maxInset * (1 - easedProgress);
            elem.style.setProperty('--inset-y', `${insetAmount}%`);
            elem.style.setProperty('--inset-x', `${insetAmount}%`);
        });
    }
    
    // ==========================================
    // --- HTML2CANVAS PARTICLE EXPLOSION ---
    // ==========================================
    gsap.utils.toArray(".gallery-item").forEach(item => {
        imagesLoaded(item.querySelector('img'), () => {
            html2canvas(item, { backgroundColor: null, useCORS: true }).then(canvas => {
                const width = canvas.width, height = canvas.height, ctx = canvas.getContext("2d"), imageData = ctx.getImageData(0, 0, width, height), particleCanvases = [], dataList = [];
                gsap.set(item.querySelector('img'), { opacity: 0 }); 
                gsap.set(item, { background: 'transparent', boxShadow: 'none', border: 'none' });
                for (let i = 0; i < 60; i++) dataList.push(ctx.createImageData(width, height));
                for (let x = 0; x < width; x++) {
                    for (let y = 0; y < height; y++) {
                        for (let l = 0; l < 2; l++) {
                            const index = (x + y * width) * 4;
                            const dataIndex = Math.floor((60 * (Math.random() + (2 * x) / width)) / 3);
                            if (dataIndex < dataList.length) {
                                for (let p = 0; p < 4; p++) dataList[dataIndex].data[index + p] = imageData.data[index + p];
                            }
                        }
                    }
                }
                dataList.forEach((data) => {
                    let pCanvas = canvas.cloneNode();
                    pCanvas.getContext("2d").putImageData(data, 0, 0);
                    pCanvas.className = "capture-canvas";
                    
                    // NOTE: Position is relative to parentElement. 
                    // Make sure .gallery-item or .gallery-container has position: relative in CSS!
                    gsap.set(pCanvas, { 
                        position: 'absolute', 
                        top: item.offsetTop, 
                        left: item.offsetLeft, 
                        width: item.clientWidth, 
                        height: item.clientHeight 
                    });
                    item.parentElement.appendChild(pCanvas);
                    particleCanvases.push(pCanvas);
                });
                
                // The particle explosion animation
                const tl = gsap.timeline({ scrollTrigger: { trigger: item, scrub: 0.7, start: "top 80%", end: "bottom 50%" } });
                tl.from(particleCanvases, { x: () => gsap.utils.random(-350, 350), y: () => gsap.utils.random(-250, 250), rotation: () => gsap.utils.random(-90, 90), opacity: 0, stagger: { each: 0.02, from: "random" } });
            });
        });
    });

   // ==========================================
    // --- HTML2CANVAS PARTICLE EXPLOSION (FIXED) ---
    // ==========================================
    
    const galleryItems = gsap.utils.toArray(".gallery-item");

    // 1. Desktop: Execute particle explosion effect
    if (window.innerWidth > 768) {
        
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            
            // Ensure images are loaded before processing particles
            imagesLoaded(img, () => {
                html2canvas(item, { backgroundColor: null, useCORS: true }).then(canvas => {
                    const width = canvas.width, height = canvas.height;
                    const ctx = canvas.getContext("2d");
                    const imageData = ctx.getImageData(0, 0, width, height);
                    const particleCanvases = [];
                    const dataList = [];

                    // Hide original image (only on desktop)
                    gsap.set(img, { opacity: 0 }); 
                    gsap.set(item, { background: 'transparent', boxShadow: 'none', border: 'none' });

                    // Create particle layers (maintain original logic)
                    for (let i = 0; i < 60; i++) dataList.push(ctx.createImageData(width, height));
                    for (let x = 0; x < width; x++) {
                        for (let y = 0; y < height; y++) {
                            for (let l = 0; l < 2; l++) {
                                const index = (x + y * width) * 4;
                                const dataIndex = Math.floor((60 * (Math.random() + (2 * x) / width)) / 3);
                                if (dataIndex < dataList.length) {
                                    for (let p = 0; p < 4; p++) dataList[dataIndex].data[index + p] = imageData.data[index + p];
                                }
                            }
                        }
                    }

                    // Add canvases to DOM
                    dataList.forEach((data) => {
                        let pCanvas = canvas.cloneNode();
                        pCanvas.getContext("2d").putImageData(data, 0, 0);
                        pCanvas.className = "capture-canvas";
                        gsap.set(pCanvas, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' });
                        item.appendChild(pCanvas);
                        particleCanvases.push(pCanvas);
                    });

                    // Explosion/Assembly animation
                    const tl = gsap.timeline({ scrollTrigger: { trigger: item, scrub: 0.7, start: "top 80%", end: "bottom 50%" } });
                    tl.from(particleCanvases, { 
                        x: () => gsap.utils.random(-350, 350), 
                        y: () => gsap.utils.random(-250, 250), 
                        rotation: () => gsap.utils.random(-90, 90), 
                        opacity: 0, 
                        stagger: { each: 0.02, from: "random" } 
                    });
                });
            });
        });

    } else {
        // 2. Mobile: Disable particles, use simple fade-in
        // Key: No need to hide original image here, just a simple ScrollTrigger animation
        
        galleryItems.forEach(item => {
            const img = item.querySelector('img');
            
            // Ensure CSS hasn't hidden the image, force visibility via JS (just in case)
            gsap.set(img, { opacity: 1 });
            
            // Simple float-up and fade-in animation
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 90%", // Trigger when top of image hits 90% of viewport height
                    toggleActions: "play none none reverse"
                },
                y: 50,          // Slight upward float
                opacity: 0,     // Fade from transparent to opaque
                duration: 0.6,
                ease: "power2.out"
            });
        });
    }
    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      bloomTextScene.update();
      bloomTextRenderer.render(bloomTextScene.scene, bloomTextScene.camera);
      if (currentVrm) currentVrm.update(delta);
      controls.update();
      vrmRenderer.render(vrmScene, vrmCamera);
    }

    function handleResizeAndScroll() {
        const width = window.innerWidth, height = window.innerHeight;
        bloomTextRenderer.setSize(width, height);
        bloomTextRenderer.setPixelRatio(window.devicePixelRatio);
        bloomTextScene.camera.aspect = width / height;
        bloomTextScene.camera.updateProjectionMatrix();
        if (bloomTextScene.handleScroll) bloomTextScene.handleScroll();
        const rect = vrmPlaceholder.getBoundingClientRect();
        vrmRenderer.setSize(width, height);
        vrmRenderer.setPixelRatio(window.devicePixelRatio);
        vrmRenderer.setViewport(rect.left, height - rect.bottom, rect.width, rect.height);
        vrmCamera.aspect = rect.width / rect.height;
        vrmCamera.updateProjectionMatrix();
        handleScrollAnimations();
    }
    
    // Combined Event Listeners
    window.addEventListener("scroll", handleResizeAndScroll);
    window.addEventListener("resize", () => {
        handleResizeAndScroll();
        // Recalculate ScrollTrigger on resize too!
        ScrollTrigger.refresh();

        if (particleCanvas && silhouetteImage) {
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;
        }
    }); 
    
    handleResizeAndScroll();
    animate();
});