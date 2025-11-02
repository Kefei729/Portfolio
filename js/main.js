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

    // ===============================================
// --- DYNAMIC PARTICLE SILHOUETTE SYSTEM ---
// ===============================================
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
            // Startposition
            this.x = Math.random() * particleCanvas.width;
            this.y = Math.random() * particleCanvas.height;

            // *** NEU: Permanente Speicher für die natürliche Schwebeposition ***
            // Dies ist das "Gedächtnis" des Partikels.
            this.naturalX = this.x;
            this.naturalY = this.y;
            
            // Zielposition für die Silhouette
            this.targetX = 0;
            this.targetY = 0;

            // Geschwindigkeit und Größe (Ihre Werte)
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
            // *** KERN-ÄNDERUNG: Die natürliche Schwebe-Animation läuft IMMER im Hintergrund ***
            this.naturalX += this.speedX;
            this.naturalY += this.speedY;
            this.angle += this.spin;

            // Wenn das Blatt unten aus dem Bild fällt, erscheint es oben wieder.
            if (this.naturalY > particleCanvas.height + this.size) {
                this.naturalY = 0 - this.size;
                this.naturalX = Math.random() * particleCanvas.width;
            }

            // Jetzt wird die TATSÄCHLICHE, gerenderte Position (this.x, this.y) berechnet.
            if (this.isSilhouetteParticle) {
                // Für "Silhouette-Blätter": Interpoliere zwischen der Schwebeposition und dem Ziel.
                this.x = gsap.utils.interpolate(this.naturalX, this.targetX, silhouetteProgress);
                this.y = gsap.utils.interpolate(this.naturalY, this.targetY, silhouetteProgress);
                
               this.size = (silhouetteProgress * (MAX_PARTICLE_SIZE - this.baseSize))*0.5;
            } else {
                // Für "Hintergrund-Blätter": Die Position ist IMMER die Schwebeposition.
                this.x = this.naturalX;
                this.y = this.naturalY;
                this.size = this.baseSize;
            }

            // Maus-Interaktion
            if (!this.isSilhouetteParticle || silhouetteProgress < 0.9) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    // Wichtig: Die Maus beeinflusst die natürliche Position, damit der Effekt permanent ist.
                    this.naturalX -= dx / 15;
                    this.naturalY -= dy / 15;
                }
            }
        }
        
        draw() {
            ctx.save();
            // Wir zeichnen an der finalen Position (this.x, this.y)
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

    // Ihre angepasste Funktion
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
        // Wichtig: Der dritte Parameter ist sx (source x), der vierte sy (source y)
        // tempCtx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        // Ihre Version `drawImage(image, 0, 160, imgWidth, imgHeight)` versucht, einen Bereich aus dem Originalbild zu verwenden, was vielleicht nicht das ist, was Sie wollen.
        // Die normale Version ist:
        tempCtx.drawImage(image, 0, 160, imgWidth, imgHeight);
        // Wenn Sie das Bild wirklich vertikal verschieben wollen, müssten Sie den Ziel-Y-Wert anpassen,
        // oder sicherstellen, dass die Quell-Dimensionen stimmen. Ich belasse es bei der Standard-Implementierung, da diese am stabilsten ist.
        
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
            // Fangen Sie den Fall ab, dass keine Punkte gefunden wurden
            console.warn("Keine Landepunkte für die Silhouette gefunden. Überprüfen Sie das Bild oder die `getLandingSpotsFromImage` Funktion.");
            // Initialisieren Sie trotzdem Partikel, damit der Hintergrund nicht leer ist.
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
    new GLTFLoader().register(p => new VRMLoaderPlugin(p)).load("Avatar_Kefei.vrm", (gltf) => {
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
    
    gsap.utils.toArray(".gallery-item").forEach(item => {
        imagesLoaded(item.querySelector('img'), () => {
            html2canvas(item, { backgroundColor: null, useCORS: true }).then(canvas => {
                const width = canvas.width, height = canvas.height, ctx = canvas.getContext("2d"), imageData = ctx.getImageData(0, 0, width, height), particleCanvases = [], dataList = [];
                gsap.set(item, { opacity: 0 });
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
                    gsap.set(pCanvas, { position: 'absolute', top: item.offsetTop, left: item.offsetLeft, width: item.clientWidth, height: item.clientHeight });
                    item.parentElement.appendChild(pCanvas);
                    particleCanvases.push(pCanvas);
                });
                const tl = gsap.timeline({ scrollTrigger: { trigger: item, scrub: 0.7, start: "top 80%", end: "bottom 50%" } });
                tl.from(particleCanvases, { x: () => gsap.utils.random(-350, 350), y: () => gsap.utils.random(-250, 250), rotation: () => gsap.utils.random(-90, 90), opacity: 0, stagger: { each: 0.02, from: "random" } });
            });
        });
    });

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
        // Main resize handler
        handleResizeAndScroll();

        // Particle system re-init (from particle code)
        if (particleCanvas && silhouetteImage) {
            particleCanvas.width = window.innerWidth;
            particleCanvas.height = window.innerHeight;
            // The particle's resize logic will be called internally when the main resize happens
        }
    }); 
    
    handleResizeAndScroll();
    animate();
});