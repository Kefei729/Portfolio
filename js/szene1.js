// FINAL szene1.js

import * as THREE from 'three';

// This is the only thing we export. It's a "factory" for our scene.
export function createBloomTextScene() {

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const textGroup = new THREE.Group();
    scene.add(textGroup);

    // --- KORREKTUR: Materialien mit 'opacity' und 'depthTest' für den weichen, transparenten Look ---
    const flowerTexture = new THREE.TextureLoader().load('./img/flower.png');
    const flowerMaterial = new THREE.MeshBasicMaterial({
        alphaMap: flowerTexture,
        transparent: true,
        opacity: 0.5, // Adjust for desired flower transparency
        depthTest: false,
    });
    const leafTexture = new THREE.TextureLoader().load('./img/leaf.png');
    const leafMaterial = new THREE.MeshBasicMaterial({
        alphaMap: leafTexture,
        transparent: true,
        opacity: 0.4, // Adjust for desired leaf transparency
        depthTest: false,
    });

    // --- Particle Classes ---
    class Particle {
        constructor([x, y]) {
            this.x = x; this.y = y; this.z = 0; this.isGrowing = true;
            this.toDelete = false; this.scale = 0; this.age = Math.PI * Math.random();
        }
    }

    class Flower extends Particle {
        constructor([x, y]) {
            super([x, y]);
            this.type = 0;
            // Increased randomness for a more organic look
            this.x += 0.6 * (Math.random() - 0.7); 
            this.y += 0.6 * (Math.random() - 0.7);
            this.color = 56 * Math.random(); // Hue range for flowers (red to yellow)
            this.maxScale = 0.9 * Math.pow(Math.random(), 20);
            this.deltaScale = 0.03 + 0.1 * Math.random();
            this.ageDelta = 0.01 + 0.02 * Math.random();
            this.rotationZ = 0.5 * Math.random() * Math.PI;
        }
        grow() {
            this.age += this.ageDelta;
            if (this.isGrowing) {
                this.deltaScale *= 0.99; this.scale += this.deltaScale;
                if (this.scale >= this.maxScale) this.isGrowing = false;
            } else if (this.toDelete) {
                this.deltaScale *= 1.1; this.scale -= this.deltaScale;
                if (this.scale <= 0) { this.scale = 0; this.deltaScale = 0; }
            } else {
                this.scale = this.maxScale + 0.2 * Math.sin(this.age);
                this.rotationZ += 0.001 * Math.cos(this.age);
            }
        }
    }

    class Leaf extends Particle {
        constructor([x, y]) {
            super([x, y]);
            this.type = 1;
            // Increased randomness for a more organic look
            this.x += 0.4 * (Math.random() - 0.5); 
            this.y += 0.4 * (Math.random() - 0.5);
            this.rotationZ = 0.4 * (Math.random() - 0.5) * Math.PI;
            // Original HSL hue range for leaves (shades of green)
            this.color = 100 + Math.random() * 20; 
            this.maxScale = 0.1 + 0.7 * Math.pow(Math.random(), 7);
            this.deltaScale = 0.03 + 0.03 * Math.random();
        }
        grow() {
            if (this.isGrowing) {
                this.deltaScale *= 0.99; this.scale += this.deltaScale;
                if (this.scale >= this.maxScale) this.isGrowing = false;
            }
            if (this.toDelete) {
                this.deltaScale *= 1.1; this.scale -= this.deltaScale;
                if (this.scale <= 0) this.scale = 0;
            }
        }
    }

    // --- Text and Particle Logic ---
    const fontName = 'Georgia, serif', textureFontSize = 100, fontScaleFactor = 0.0525;
    let particles = [], textureCoordinates = [], stringBox = { wTexture: 0, wScene: 0, hTexture: 0, hScene: 0 };
    let flowerInstancedMesh, leafInstancedMesh;
    const textCanvas = document.createElement('canvas'), textCtx = textCanvas.getContext('2d');
    const particleGeometry = new THREE.PlaneGeometry(1.2, 1.2);
    const dummy = new THREE.Object3D();

    function sampleCoordinates() {
        const lines = ["K e f e i 's", 'P o r t f o l i o'];
        textCtx.font = textureFontSize + "px " + fontName;
        const widths = lines.map(line => textCtx.measureText(line).width);
        const maxWidth = Math.max(...widths);
        const lineHeight = textureFontSize;
        const padding = textureFontSize * 0.1;
        stringBox.wTexture = maxWidth + padding;
        stringBox.hTexture = lines.length * lineHeight;
        stringBox.wScene = stringBox.wTexture * fontScaleFactor;
        stringBox.hScene = stringBox.hTexture * fontScaleFactor;
        textCanvas.width = stringBox.wTexture;
        textCanvas.height = stringBox.hTexture;
        textCtx.font = textureFontSize + "px " + fontName;
        textCtx.fillStyle = "#80A250";
        textCtx.clearRect(0, 0, textCanvas.width, textCanvas.height);
        textCtx.textAlign = "center";
        textCtx.textBaseline = "middle";
        const verticalCenter = stringBox.hTexture / 2;
        const totalLines = lines.length;
        lines.forEach((line, i) => {
            const yOffset = (i - (totalLines - 1) / 2) * lineHeight;
            const y = verticalCenter + yOffset;
            textCtx.fillText(line, stringBox.wTexture / 2, y);
        });
        const imageData = textCtx.getImageData(0, 0, textCanvas.width, textCanvas.height);
        textureCoordinates = [];
        for (let i = 0; i < textCanvas.height; i++) {
            for (let j = 0; j < textCanvas.width; j++) {
                if (imageData.data[4 * (j + i * textCanvas.width) + 3] > 0) {
                    textureCoordinates.push({ x: j, y: i });
                }
            }
        }
    }

    function recreateInstancedMesh() {
        if (flowerInstancedMesh) textGroup.remove(flowerInstancedMesh);
        if (leafInstancedMesh) textGroup.remove(leafInstancedMesh);
        const flowers = particles.filter(p => p.type === 0);
        const leaves = particles.filter(p => p.type === 1);
        if (flowers.length > 0) {
            flowerInstancedMesh = new THREE.InstancedMesh(particleGeometry, flowerMaterial, flowers.length);
            flowers.forEach((p, i) => {
                // Using HSL for flower colors
                flowerInstancedMesh.setColorAt(i, new THREE.Color("hsl(" + p.color + ", 70%, 50%)"));
            });
            flowerInstancedMesh.instanceColor.needsUpdate = true;
            flowerInstancedMesh.position.x = -stringBox.wScene / 2;
            flowerInstancedMesh.position.y = -stringBox.hScene / 2;
            textGroup.add(flowerInstancedMesh);
        }
        if (leaves.length > 0) {
            leafInstancedMesh = new THREE.InstancedMesh(particleGeometry, leafMaterial, leaves.length);
            leaves.forEach((p, i) => {
                // KORREKTUR: Using HSL for leaf colors, as in the original demo
                leafInstancedMesh.setColorAt(i, new THREE.Color("hsl(" + p.color + ", 70%, 20%)"));
            });
            leafInstancedMesh.instanceColor.needsUpdate = true;
            leafInstancedMesh.position.x = -stringBox.wScene / 2;
            leafInstancedMesh.position.y = -stringBox.hScene / 2;
            textGroup.add(leafInstancedMesh);
        }
    }

    function refreshText() {
        sampleCoordinates();
        particles = textureCoordinates.map(c => {
            const x = c.x * fontScaleFactor;
            const y = c.y * fontScaleFactor;
            return Math.random() > 0.2 ? new Flower([x, y]) : new Leaf([x, y]);
        });
        recreateInstancedMesh();
    }

    refreshText();

    function update() {
        if (!flowerInstancedMesh && !leafInstancedMesh) return;
        let flowerIdx = 0;
        let leafIdx = 0;
        particles.forEach(p => {
            p.grow();
            dummy.quaternion.setFromEuler(new THREE.Euler(0, 0, p.rotationZ));
            dummy.scale.set(p.scale, p.scale, p.scale);
            dummy.position.set(p.x, stringBox.hScene - p.y, p.z);
            dummy.updateMatrix();
            if (p.type === 0 && flowerInstancedMesh && flowerIdx < flowerInstancedMesh.count) {
                flowerInstancedMesh.setMatrixAt(flowerIdx++, dummy.matrix);
            } else if (p.type === 1 && leafInstancedMesh && leafIdx < leafInstancedMesh.count) {
                leafInstancedMesh.setMatrixAt(leafIdx++, dummy.matrix);
            }
        });
        if (flowerInstancedMesh) {
            flowerInstancedMesh.instanceMatrix.needsUpdate = true;
            flowerInstancedMesh.instanceColor.needsUpdate = true;
        }
        if (leafInstancedMesh) {
            leafInstancedMesh.instanceMatrix.needsUpdate = true;
            leafInstancedMesh.instanceColor.needsUpdate = true;
        }
    }

    function handleScroll() {
        const startZ = 10;
        const endZ = 35;
        const scrollPercent = Math.min(window.scrollY / (window.innerHeight * 0.5), 1.0);
        camera.position.z = startZ + (endZ - startZ) * scrollPercent;
        const scrollSpeedFactor = 0.005;
        textGroup.position.y = window.scrollY * scrollSpeedFactor;
    }

    handleScroll();

    return { scene, camera, update, handleScroll };
}