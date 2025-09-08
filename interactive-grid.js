// Interactive Distorted Grid System
class InteractiveGrid {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gridSize = 40;
        this.points = [];
        this.mouse = { x: 0, y: 0 };
        this.time = 0;
        this.isDarkMode = !document.body.classList.contains('theme-light');
        this.animationId = null;
        this.distortionStrength = 50;
        this.waveAmplitude = 20;
        this.gridOpacity = 0.3;
        
        this.init();
    }

    init() {
        this.setupCanvas();
        this.createGrid();
        this.setupEventListeners();
        this.animate();
    }

    setupCanvas() {
        this.canvas = document.getElementById('grid-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.createGrid();
        });
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createGrid() {
        this.points = [];
        const cols = Math.ceil(window.innerWidth / this.gridSize) + 2;
        const rows = Math.ceil(window.innerHeight / this.gridSize) + 2;

        for (let y = 0; y < rows; y++) {
            this.points[y] = [];
            for (let x = 0; x < cols; x++) {
                this.points[y][x] = {
                    x: x * this.gridSize,
                    y: y * this.gridSize,
                    originalX: x * this.gridSize,
                    originalY: y * this.gridSize,
                    vx: 0,
                    vy: 0,
                    targetX: x * this.gridSize,
                    targetY: y * this.gridSize,
                    phase: Math.random() * Math.PI * 2,
                    frequency: Math.random() * 0.02 + 0.01
                };
            }
        }
    }

    setupEventListeners() {
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Theme change listener
        const observer = new MutationObserver(() => {
            this.isDarkMode = !document.body.classList.contains('theme-light');
        });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    updateGrid() {
        this.time += 0.016; // ~60fps

        for (let y = 0; y < this.points.length; y++) {
            for (let x = 0; x < this.points[y].length; x++) {
                const point = this.points[y][x];
                
                // Calculate distance to mouse
                const dx = this.mouse.x - point.originalX;
                const dy = this.mouse.y - point.originalY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Mouse interaction
                let mouseInfluence = 0;
                if (distance < 200) {
                    mouseInfluence = (200 - distance) / 200;
                    const angle = Math.atan2(dy, dx);
                    const force = mouseInfluence * this.distortionStrength;
                    
                    point.targetX = point.originalX + Math.cos(angle) * force;
                    point.targetY = point.originalY + Math.sin(angle) * force;
                } else {
                    point.targetX = point.originalX;
                    point.targetY = point.originalY;
                }

                // Wave distortion
                const waveX = Math.sin(this.time * 2 + point.phase) * this.waveAmplitude;
                const waveY = Math.cos(this.time * 1.5 + point.phase * 1.3) * this.waveAmplitude * 0.5;
                
                point.targetX += waveX;
                point.targetY += waveY;

                // Smooth interpolation
                point.x += (point.targetX - point.x) * 0.1;
                point.y += (point.targetY - point.y) * 0.1;
            }
        }
    }

    drawGrid() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Set grid color based on theme
        const gridColor = this.isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)';
        const accentColor = this.isDarkMode ? 'rgba(124, 58, 237, 0.4)' : 'rgba(124, 58, 237, 0.3)';
        
        this.ctx.strokeStyle = gridColor;
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = this.gridOpacity;

        // Draw horizontal lines
        for (let y = 0; y < this.points.length - 1; y++) {
            this.ctx.beginPath();
            for (let x = 0; x < this.points[y].length; x++) {
                const point = this.points[y][x];
                if (x === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
        }

        // Draw vertical lines
        for (let x = 0; x < this.points[0].length; x++) {
            this.ctx.beginPath();
            for (let y = 0; y < this.points.length; y++) {
                const point = this.points[y][x];
                if (y === 0) {
                    this.ctx.moveTo(point.x, point.y);
                } else {
                    this.ctx.lineTo(point.x, point.y);
                }
            }
            this.ctx.stroke();
        }

        // Draw connection lines to mouse
        this.ctx.strokeStyle = accentColor;
        this.ctx.lineWidth = 0.5;
        this.ctx.globalAlpha = 0.2;

        for (let y = 0; y < this.points.length; y++) {
            for (let x = 0; x < this.points[y].length; x++) {
                const point = this.points[y][x];
                const dx = this.mouse.x - point.x;
                const dy = this.mouse.y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const opacity = (150 - distance) / 150;
                    this.ctx.globalAlpha = opacity * 0.3;
                    this.ctx.beginPath();
                    this.ctx.moveTo(point.x, point.y);
                    this.ctx.lineTo(this.mouse.x, this.mouse.y);
                    this.ctx.stroke();
                }
            }
        }

        // Draw grid points
        this.ctx.fillStyle = gridColor;
        this.ctx.globalAlpha = 0.6;
        
        for (let y = 0; y < this.points.length; y++) {
            for (let x = 0; x < this.points[y].length; x++) {
                const point = this.points[y][x];
                const dx = this.mouse.x - point.x;
                const dy = this.mouse.y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const size = (100 - distance) / 100 * 3 + 1;
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }

        this.ctx.globalAlpha = 1;
    }

    drawAdvancedEffects() {
        // Draw magnetic field around mouse
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.strokeStyle = this.isDarkMode ? '#6366f1' : '#8b5cf6';
        this.ctx.lineWidth = 2;
        
        for (let radius = 50; radius <= 200; radius += 25) {
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        this.ctx.restore();

        // Draw ripple effects
        this.ctx.save();
        this.ctx.globalAlpha = 0.05;
        this.ctx.strokeStyle = this.isDarkMode ? '#f59e0b' : '#10b981';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < 5; i++) {
            const rippleRadius = (this.time * 50 + i * 40) % 300;
            this.ctx.beginPath();
            this.ctx.arc(this.mouse.x, this.mouse.y, rippleRadius, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        this.ctx.restore();

        // Draw energy lines between nearby points
        this.ctx.save();
        this.ctx.globalAlpha = 0.15;
        this.ctx.strokeStyle = this.isDarkMode ? '#10b981' : '#f59e0b';
        this.ctx.lineWidth = 0.5;
        
        for (let y = 0; y < this.points.length - 1; y++) {
            for (let x = 0; x < this.points[y].length - 1; x++) {
                const point1 = this.points[y][x];
                const point2 = this.points[y + 1][x];
                const point3 = this.points[y][x + 1];
                
                const dist1 = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
                const dist2 = Math.sqrt((point1.x - point3.x) ** 2 + (point1.y - point3.y) ** 2);
                
                if (dist1 > this.gridSize * 1.5) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(point1.x, point1.y);
                    this.ctx.lineTo(point2.x, point2.y);
                    this.ctx.stroke();
                }
                
                if (dist2 > this.gridSize * 1.5) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(point1.x, point1.y);
                    this.ctx.lineTo(point3.x, point3.y);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.restore();

        // Draw pulsing energy orbs at grid intersections
        this.ctx.save();
        for (let y = 0; y < this.points.length; y += 2) {
            for (let x = 0; x < this.points[y].length; x += 2) {
                const point = this.points[y][x];
                const dx = this.mouse.x - point.x;
                const dy = this.mouse.y - point.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 300) {
                    const pulse = Math.sin(this.time * 3 + point.phase) * 0.5 + 0.5;
                    const size = pulse * 2 + 1;
                    const opacity = (300 - distance) / 300 * pulse * 0.3;
                    
                    this.ctx.globalAlpha = opacity;
                    this.ctx.fillStyle = this.isDarkMode ? '#ec4899' : '#8b5cf6';
                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }
        this.ctx.restore();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        this.updateGrid();
        this.drawGrid();
        this.drawAdvancedEffects();
    }

    // Public methods for external control
    setDistortionStrength(strength) {
        this.distortionStrength = Math.max(0, Math.min(100, strength));
    }

    setWaveAmplitude(amplitude) {
        this.waveAmplitude = Math.max(0, Math.min(50, amplitude));
    }

    setGridOpacity(opacity) {
        this.gridOpacity = Math.max(0, Math.min(1, opacity));
    }

    setGridSize(size) {
        this.gridSize = Math.max(10, Math.min(100, size));
        this.createGrid();
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.interactiveGrid = new InteractiveGrid();
    
    // Add keyboard controls for grid customization
    document.addEventListener('keydown', (e) => {
        if (!window.interactiveGrid) return;
        
        switch(e.key) {
            case '1':
                window.interactiveGrid.setDistortionStrength(25);
                break;
            case '2':
                window.interactiveGrid.setDistortionStrength(50);
                break;
            case '3':
                window.interactiveGrid.setDistortionStrength(75);
                break;
            case 'q':
                window.interactiveGrid.setWaveAmplitude(10);
                break;
            case 'w':
                window.interactiveGrid.setWaveAmplitude(20);
                break;
            case 'e':
                window.interactiveGrid.setWaveAmplitude(30);
                break;
            case 'a':
                window.interactiveGrid.setGridOpacity(0.1);
                break;
            case 's':
                window.interactiveGrid.setGridOpacity(0.3);
                break;
            case 'd':
                window.interactiveGrid.setGridOpacity(0.5);
                break;
            case 'z':
                window.interactiveGrid.setGridSize(20);
                break;
            case 'x':
                window.interactiveGrid.setGridSize(40);
                break;
            case 'c':
                window.interactiveGrid.setGridSize(60);
                break;
        }
    });
    
    console.log('🎯 Interactive Grid Controls:');
    console.log('1-3: Distortion strength (25-75)');
    console.log('Q-W-E: Wave amplitude (10-30)');
    console.log('A-S-D: Grid opacity (0.1-0.5)');
    console.log('Z-X-C: Grid size (20-60)');
});