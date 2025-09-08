// Advanced Physics and Visual Effects Engine
class AdvancedEffectsEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.liquidCanvas = null;
        this.liquidCtx = null;
        this.physicsCanvas = null;
        this.physicsCtx = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.particles = [];
        this.liquidParticles = [];
        this.physicsParticles = [];
        this.mouse = { x: 0, y: 0 };
        this.isDarkMode = !document.body.classList.contains('theme-light');
        this.animationId = null;
        
        this.init();
    }

    init() {
        this.setupCanvases();
        this.setupThreeJS();
        this.setupPhysics();
        this.setupLiquidSimulation();
        this.setupEventListeners();
        this.animate();
    }

    setupCanvases() {
        // Physics Canvas
        this.physicsCanvas = document.getElementById('physics-canvas');
        this.physicsCtx = this.physicsCanvas.getContext('2d');
        this.resizeCanvas(this.physicsCanvas);

        // Liquid Canvas
        this.liquidCanvas = document.getElementById('liquid-canvas');
        this.liquidCtx = this.liquidCanvas.getContext('2d');
        this.resizeCanvas(this.liquidCanvas);

        window.addEventListener('resize', () => {
            this.resizeCanvas(this.physicsCanvas);
            this.resizeCanvas(this.liquidCanvas);
            if (this.camera && this.renderer) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    }

    resizeCanvas(canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    setupThreeJS() {
        const container = document.getElementById('three-container');
        if (!container) return;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0b0f1a, 50, 200);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        container.appendChild(this.renderer.domElement);

        // Post-processing
        this.composer = new THREE.EffectComposer(this.renderer);
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        // Create advanced geometry
        this.createAdvancedGeometry();
    }

    createAdvancedGeometry() {
        // Morphing Icosahedron
        const geometry = new THREE.IcosahedronGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(0x6366f1) },
                color2: { value: new THREE.Color(0x8b5cf6) },
                color3: { value: new THREE.Color(0xf59e0b) }
            },
            vertexShader: `
                uniform float time;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vPosition = position;
                    vNormal = normal;
                    
                    vec3 pos = position;
                    pos += normal * sin(time * 2.0 + position.x * 3.0) * 0.1;
                    pos += normal * cos(time * 1.5 + position.y * 2.0) * 0.05;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                uniform vec3 color3;
                varying vec3 vPosition;
                varying vec3 vNormal;
                
                void main() {
                    vec3 color = mix(color1, color2, sin(time + vPosition.x) * 0.5 + 0.5);
                    color = mix(color, color3, cos(time * 0.7 + vPosition.y) * 0.5 + 0.5);
                    
                    float fresnel = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
                    color += fresnel * 0.3;
                    
                    gl_FragColor = vec4(color, 0.8);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide
        });

        this.morphingMesh = new THREE.Mesh(geometry, material);
        this.morphingMesh.position.set(0, 0, -10);
        this.scene.add(this.morphingMesh);

        // Particle System
        this.createParticleSystem();
    }

    createParticleSystem() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            
            // Positions
            positions[i3] = (Math.random() - 0.5) * 100;
            positions[i3 + 1] = (Math.random() - 0.5) * 100;
            positions[i3 + 2] = (Math.random() - 0.5) * 100;

            // Colors
            const color = new THREE.Color();
            color.setHSL(0.6 + Math.random() * 0.2, 0.8, 0.6);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            // Sizes
            sizes[i] = Math.random() * 3 + 1;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                pixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                attribute vec3 color;
                uniform float time;
                uniform float pixelRatio;
                varying vec3 vColor;
                
                void main() {
                    vColor = color;
                    
                    vec3 pos = position;
                    pos.x += sin(time * 0.5 + position.y * 0.01) * 2.0;
                    pos.y += cos(time * 0.3 + position.x * 0.01) * 1.5;
                    pos.z += sin(time * 0.7 + position.x * 0.005) * 1.0;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
                    float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
                    gl_FragColor = vec4(vColor, alpha);
                }
            `,
            transparent: true,
            vertexColors: true
        });

        this.particleSystem = new THREE.Points(geometry, material);
        this.scene.add(this.particleSystem);
    }

    setupPhysics() {
        // Create physics particles
        for (let i = 0; i < 150; i++) {
            this.physicsParticles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 4 + 2,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.005,
                color: this.getRandomColor()
            });
        }
    }

    setupLiquidSimulation() {
        // Create liquid particles
        for (let i = 0; i < 100; i++) {
            this.liquidParticles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: 0,
                vy: 0,
                size: Math.random() * 8 + 4,
                life: 1.0,
                decay: Math.random() * 0.01 + 0.003,
                color: this.getLiquidColor(),
                viscosity: Math.random() * 0.1 + 0.05
            });
        }
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        document.addEventListener('click', (e) => {
            this.createExplosion(e.clientX, e.clientY);
        });

        // Theme change listener
        const observer = new MutationObserver(() => {
            this.isDarkMode = !document.body.classList.contains('theme-light');
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    getRandomColor() {
        const colors = [
            [99, 102, 241],   // Indigo
            [124, 58, 237],   // Purple
            [245, 158, 11],   // Amber
            [16, 185, 129],   // Emerald
            [236, 72, 153]    // Pink
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.8)`;
    }

    getLiquidColor() {
        const colors = [
            [99, 102, 241, 0.6],   // Indigo
            [124, 58, 237, 0.5],   // Purple
            [245, 158, 11, 0.4],   // Amber
            [16, 185, 129, 0.5]    // Emerald
        ];
        const color = colors[Math.floor(Math.random() * colors.length)];
        return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
    }

    createExplosion(x, y) {
        for (let i = 0; i < 20; i++) {
            this.physicsParticles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 6 + 3,
                life: 1.0,
                decay: 0.02,
                color: this.getRandomColor()
            });
        }
    }

    updatePhysics() {
        this.physicsCtx.clearRect(0, 0, this.physicsCanvas.width, this.physicsCanvas.height);

        for (let i = this.physicsParticles.length - 1; i >= 0; i--) {
            const particle = this.physicsParticles[i];

            // Apply gravity and mouse attraction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 200) {
                const force = (200 - distance) / 200;
                particle.vx += (dx / distance) * force * 0.1;
                particle.vy += (dy / distance) * force * 0.1;
            }

            // Apply physics
            particle.vy += 0.05; // Gravity
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98; // Friction
            particle.vy *= 0.98;

            // Bounce off edges
            if (particle.x < 0 || particle.x > this.physicsCanvas.width) {
                particle.vx *= -0.8;
                particle.x = Math.max(0, Math.min(this.physicsCanvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.physicsCanvas.height) {
                particle.vy *= -0.8;
                particle.y = Math.max(0, Math.min(this.physicsCanvas.height, particle.y));
            }

            // Update life
            particle.life -= particle.decay;

            if (particle.life <= 0) {
                this.physicsParticles.splice(i, 1);
                continue;
            }

            // Draw particle
            this.physicsCtx.save();
            this.physicsCtx.globalAlpha = particle.life;
            this.physicsCtx.fillStyle = particle.color;
            this.physicsCtx.beginPath();
            this.physicsCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.physicsCtx.fill();
            this.physicsCtx.restore();
        }
    }

    updateLiquid() {
        this.liquidCtx.clearRect(0, 0, this.liquidCanvas.width, this.liquidCanvas.height);

        for (let i = this.liquidParticles.length - 1; i >= 0; i--) {
            const particle = this.liquidParticles[i];

            // Liquid physics
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.vx += (dx / distance) * force * 0.05;
                particle.vy += (dy / distance) * force * 0.05;
            }

            // Apply viscosity
            particle.vx *= (1 - particle.viscosity);
            particle.vy *= (1 - particle.viscosity);

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Soft boundaries
            if (particle.x < 0 || particle.x > this.liquidCanvas.width) {
                particle.vx *= -0.5;
                particle.x = Math.max(0, Math.min(this.liquidCanvas.width, particle.x));
            }
            if (particle.y < 0 || particle.y > this.liquidCanvas.height) {
                particle.vy *= -0.5;
                particle.y = Math.max(0, Math.min(this.liquidCanvas.height, particle.y));
            }

            // Update life
            particle.life -= particle.decay;

            if (particle.life <= 0) {
                this.liquidParticles.splice(i, 1);
                continue;
            }

            // Draw liquid particle with blur effect
            this.liquidCtx.save();
            this.liquidCtx.globalAlpha = particle.life * 0.6;
            this.liquidCtx.fillStyle = particle.color;
            this.liquidCtx.filter = 'blur(2px)';
            this.liquidCtx.beginPath();
            this.liquidCtx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.liquidCtx.fill();
            this.liquidCtx.restore();
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Update Three.js scene
        if (this.morphingMesh) {
            this.morphingMesh.rotation.x = time * 0.2;
            this.morphingMesh.rotation.y = time * 0.3;
            this.morphingMesh.material.uniforms.time.value = time;
        }

        if (this.particleSystem) {
            this.particleSystem.rotation.y = time * 0.1;
            this.particleSystem.material.uniforms.time.value = time;
        }

        // Update physics and liquid simulations
        this.updatePhysics();
        this.updateLiquid();

        // Render Three.js
        if (this.composer) {
            this.composer.render();
        } else if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }

        // Add new particles occasionally
        if (Math.random() < 0.1) {
            this.liquidParticles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                vx: 0,
                vy: 0,
                size: Math.random() * 8 + 4,
                life: 1.0,
                decay: Math.random() * 0.01 + 0.003,
                color: this.getLiquidColor(),
                viscosity: Math.random() * 0.1 + 0.05
            });
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.advancedEffects = new AdvancedEffectsEngine();
});