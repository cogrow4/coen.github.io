// Portfolio Website JavaScript
document.addEventListener('DOMContentLoaded', function() {
    
    // Loading Screen
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading';
    loadingScreen.innerHTML = '<div class="loader"></div>';
    document.body.appendChild(loadingScreen);
    
    // Hide loading screen after page loads
    window.addEventListener('load', function() {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 1000);
    });

    // Theme handling
    const body = document.body;
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('theme-light');
    }
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            body.classList.toggle('theme-light');
            const isLight = body.classList.contains('theme-light');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
        });
    }

    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Navbar scroll effect
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            if (body.classList.contains('theme-light')) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            } else {
                navbar.style.background = 'rgba(5, 7, 17, 0.85)';
            }
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.3)';
        } else {
            navbar.style.background = body.classList.contains('theme-light') ? 'rgba(255, 255, 255, 0.95)' : 'rgba(5, 7, 17, 0.6)';
            navbar.style.boxShadow = 'none';
        }

        // Hide/show navbar on scroll
        if (scrollTop > lastScrollTop && scrollTop > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        lastScrollTop = scrollTop;
    });

    // Parallax scrolling effects
    const heroShapes = document.querySelectorAll('.shape');
    const heroContent = document.querySelector('.hero-content');
    const profileCard = document.querySelector('.profile-card');

    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        // Parallax for floating shapes
        heroShapes.forEach((shape, index) => {
            const speed = 0.2 + (index * 0.08);
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.06}deg)`;
        });

        // Parallax for hero content
        if (heroContent) {
            heroContent.style.transform = `translateY(${scrolled * 0.18}px)`;
        }

        // 3D tilt effect for profile card
        if (profileCard) {
            const rect = profileCard.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const mouseX = (window.innerWidth / 2 - centerX) / 10;
            const mouseY = (window.innerHeight / 2 - centerY) / 10;
            
            profileCard.style.transform = `perspective(1000px) rotateY(${mouseX}deg) rotateX(${-mouseY}deg)`;
        }
    });

    // Mouse movement parallax
    document.addEventListener('mousemove', function(e) {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;

        // Move shapes based on mouse position
        heroShapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.35;
            const x = (mouseX - 0.5) * speed * 30;
            const y = (mouseY - 0.5) * speed * 30;
            shape.style.transform += ` translate(${x}px, ${y}px)`;
        });
    });

    // Scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Add fade-in class to elements
    const animateElements = document.querySelectorAll('.section-header, .about-text, .about-visual, .skill-category, .portfolio-item, .contact-info, .contact-form');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // Counter animation for stats
    const stats = document.querySelectorAll('.stat-number');
    const statsObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                const isPercentage = finalValue.includes('%');
                const isPlus = finalValue.includes('+');
                const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
                
                animateCounter(target, 0, numericValue, 2000, isPercentage, isPlus);
                statsObserver.unobserve(target);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
        statsObserver.observe(stat);
    });

    function animateCounter(element, start, end, duration, isPercentage, isPlus) {
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * (end - start) + start);
            
            let displayValue = current.toString();
            if (isPlus) displayValue += '+';
            if (isPercentage) displayValue += '%';
            
            element.textContent = displayValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    // Portfolio item hover effects
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    portfolioItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Skill tags hover effect
    const skillTags = document.querySelectorAll('.skill-tag');
    skillTags.forEach(tag => {
        tag.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotate(2deg)';
        });
        
        tag.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1) rotate(0deg)';
        });
    });

    // Contact form handling
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const subject = formData.get('subject');
            const message = formData.get('message');
            
            // Simple validation
            if (!name || !email || !subject || !message) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                showNotification('Message sent successfully!', 'success');
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : '#ef4444'};
            color: white;
            padding: 1rem 2rem;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Typing effect for hero title
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.innerHTML = '';
        
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }

    // Add some interactive particles
    // Starfield canvas background
    const canvas = document.getElementById('starfield');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let stars = [];
        const starCount = Math.min(250, Math.floor(width * height / 12000));
        const maxSpeed = 0.35;
        const mouse = { x: width / 2, y: height / 3 };

        function createStars() {
            stars = [];
            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    z: Math.random() * 0.8 + 0.2,
                    vx: (Math.random() - 0.5) * maxSpeed,
                    vy: (Math.random() - 0.5) * maxSpeed,
                    radius: Math.random() * 1.3 + 0.2
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = body.classList.contains('theme-light') ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.9)';
            for (let i = 0; i < stars.length; i++) {
                const s = stars[i];
                const parallax = 1 + (mouse.x - width / 2) * 0.00008 * s.z;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius * s.z, 0, Math.PI * 2);
                ctx.globalAlpha = 0.5 + s.z * 0.5;
                ctx.fill();
                ctx.globalAlpha = 1;

                // Move
                s.x += s.vx * parallax;
                s.y += s.vy * parallax;

                // Wrap
                if (s.x < 0) s.x = width; if (s.x > width) s.x = 0;
                if (s.y < 0) s.y = height; if (s.y > height) s.y = 0;
            }

            // Constellation lines
            ctx.strokeStyle = body.classList.contains('theme-light') ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.15)';
            for (let i = 0; i < stars.length; i++) {
                for (let j = i + 1; j < i + 12 && j < stars.length; j++) {
                    const a = stars[i], b = stars[j];
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 90) {
                        ctx.globalAlpha = 1 - dist / 90;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    }
                }
            }

            requestAnimationFrame(draw);
        }

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createStars();
        });
        document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        createStars();
        draw();
    }

    // Cursor blob
    const cursorBlob = document.querySelector('.cursor-blob');
    if (cursorBlob) {
        let targetX = window.innerWidth / 2;
        let targetY = window.innerHeight / 2;
        let currentX = targetX;
        let currentY = targetY;
        const ease = 0.12;

        document.addEventListener('mousemove', (e) => {
            targetX = e.clientX;
            targetY = e.clientY;
        });
        function animateBlob() {
            currentX += (targetX - currentX) * ease;
            currentY += (targetY - currentY) * ease;
            cursorBlob.style.left = currentX + 'px';
            cursorBlob.style.top = currentY + 'px';
            requestAnimationFrame(animateBlob);
        }
        animateBlob();
    }

    // Advanced Text scramble effect with physics
    class AdvancedTextScramble {
        constructor(el) { 
            this.el = el; 
            this.chars = '!<>-_\/[]{}—=+*^?#________ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
            this.queue = []; 
            this.frame = 0; 
            this.frameRequest = null; 
            this.update = this.update.bind(this);
            this.isAnimating = false;
        }
        
        setText(newText) {
            if (this.isAnimating) return Promise.resolve();
            this.isAnimating = true;
            
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || '';
                const to = newText[i] || '';
                const start = Math.floor(Math.random() * 30) + 10;
                const end = start + Math.floor(Math.random() * 30) + 20;
                this.queue.push({ from, to, start, end, char: '', velocity: Math.random() * 0.5 + 0.1 });
            }
            
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        
        update() {
            let output = '';
            let complete = 0;
            
            for (let i = 0; i < this.queue.length; i++) {
                let { from, to, start, end, char, velocity } = this.queue[i];
                
                if (this.frame >= end) { 
                    complete++; 
                    output += to; 
                } else if (this.frame >= start) {
                    if (!char || Math.random() < velocity) { 
                        char = this.randomChar(); 
                        this.queue[i].char = char; 
                    }
                    output += `<span class="dud" style="color: ${this.getRandomColor()};">${char}</span>`;
                } else { 
                    output += from; 
                }
            }
            
            this.el.innerHTML = output;
            
            if (complete === this.queue.length) { 
                this.isAnimating = false;
                this.resolve(); 
            } else { 
                this.frame++; 
                this.frameRequest = requestAnimationFrame(this.update); 
            }
        }
        
        randomChar() { 
            return this.chars[Math.floor(Math.random() * this.chars.length)]; 
        }
        
        getRandomColor() {
            const colors = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }

    // Enhanced text scramble with magnetic effects
    document.querySelectorAll('.nav-link, .section-title, .hero-title .title-line').forEach(el => {
        el.addEventListener('mouseenter', () => {
            const scramble = new AdvancedTextScramble(el);
            scramble.setText(el.textContent || '');
        });
    });

    // Advanced magnetic field interactions
    class MagneticField {
        constructor() {
            this.field = document.querySelector('.magnetic-field');
            this.particles = [];
            this.init();
        }

        init() {
            // Create magnetic particles
            for (let i = 0; i < 50; i++) {
                const particle = document.createElement('div');
                particle.className = 'magnetic-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 2px;
                    height: 2px;
                    background: rgba(99, 102, 241, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                `;
                this.particles.push(particle);
                document.body.appendChild(particle);
            }

            this.updatePositions();
        }

        updatePositions() {
            const mouseX = window.mouseX || window.innerWidth / 2;
            const mouseY = window.mouseY || window.innerHeight / 2;

            this.particles.forEach((particle, index) => {
                const angle = (index / this.particles.length) * Math.PI * 2;
                const radius = 100 + Math.sin(Date.now() * 0.001 + index) * 30;
                const x = mouseX + Math.cos(angle) * radius;
                const y = mouseY + Math.sin(angle) * radius;

                particle.style.left = x + 'px';
                particle.style.top = y + 'px';
                particle.style.opacity = 0.3 + Math.sin(Date.now() * 0.002 + index) * 0.3;
            });

            requestAnimationFrame(() => this.updatePositions());
        }
    }

    // Initialize magnetic field
    const magneticField = new MagneticField();

    // Advanced particle trails
    class ParticleTrails {
        constructor() {
            this.trails = [];
            this.maxTrails = 100;
            this.init();
        }

        init() {
            document.addEventListener('mousemove', (e) => {
                this.createTrail(e.clientX, e.clientY);
            });
        }

        createTrail(x, y) {
            if (this.trails.length >= this.maxTrails) {
                const oldTrail = this.trails.shift();
                if (oldTrail && oldTrail.parentNode) {
                    oldTrail.parentNode.removeChild(oldTrail);
                }
            }

            const trail = document.createElement('div');
            trail.className = 'particle-trail';
            trail.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: radial-gradient(circle, rgba(99,102,241,0.8), transparent);
                border-radius: 50%;
                pointer-events: none;
                left: ${x}px;
                top: ${y}px;
                z-index: 5;
                animation: trailFade 1s ease-out forwards;
            `;

            document.body.appendChild(trail);
            this.trails.push(trail);

            // Remove after animation
            setTimeout(() => {
                if (trail.parentNode) {
                    trail.parentNode.removeChild(trail);
                }
                const index = this.trails.indexOf(trail);
                if (index > -1) {
                    this.trails.splice(index, 1);
                }
            }, 1000);
        }
    }

    // Add trail animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes trailFade {
            0% { 
                opacity: 1; 
                transform: scale(1); 
            }
            100% { 
                opacity: 0; 
                transform: scale(0.1); 
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize particle trails
    const particleTrails = new ParticleTrails();

    // Advanced glass morphing effects
    class GlassMorphing {
        constructor() {
            this.elements = document.querySelectorAll('.portfolio-item, .skill-category, .contact-method');
            this.init();
        }

        init() {
            this.elements.forEach(el => {
                el.addEventListener('mouseenter', () => this.morphIn(el));
                el.addEventListener('mouseleave', () => this.morphOut(el));
            });
        }

        morphIn(el) {
            el.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            el.style.transform = 'perspective(1000px) rotateX(5deg) rotateY(5deg) translateZ(20px)';
            el.style.filter = 'blur(0px) brightness(1.1)';
            el.style.boxShadow = '0 25px 50px rgba(99, 102, 241, 0.3)';
        }

        morphOut(el) {
            el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
            el.style.filter = 'blur(0px) brightness(1)';
            el.style.boxShadow = 'var(--shadow-md)';
        }
    }

    // Initialize glass morphing
    const glassMorphing = new GlassMorphing();

    // Add scroll progress indicator
    function createScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        progressBar.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 0%;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            z-index: 10000;
            transition: width 0.1s ease;
        `;
        
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', function() {
            const scrollTop = window.pageYOffset;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollPercent = (scrollTop / docHeight) * 100;
            progressBar.style.width = scrollPercent + '%';
        });
    }

    createScrollProgress();

    // Add smooth reveal animations for sections
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.fade-in');
        
        reveals.forEach(reveal => {
            const windowHeight = window.innerHeight;
            const elementTop = reveal.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                reveal.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check

    // Add magnetic effect to buttons
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0)';
        });
    });

    // Add cursor trail effect
    function createCursorTrail() {
        const trail = [];
        const trailLength = 20;
        
        for (let i = 0; i < trailLength; i++) {
            const dot = document.createElement('div');
            dot.className = 'cursor-trail';
            dot.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: rgba(99, 102, 241, ${1 - i / trailLength});
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                transition: all 0.1s ease;
            `;
            document.body.appendChild(dot);
            trail.push(dot);
        }
        
        let mouseX = 0, mouseY = 0;
        
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        function animateTrail() {
            let x = mouseX;
            let y = mouseY;
            
            trail.forEach((dot, index) => {
                const nextDot = trail[index + 1] || trail[0];
                
                dot.style.left = x + 'px';
                dot.style.top = y + 'px';
                
                x += (nextDot.offsetLeft - x) * 0.3;
                y += (nextDot.offsetTop - y) * 0.3;
            });
            
            requestAnimationFrame(animateTrail);
        }
        
        animateTrail();
    }

    // Uncomment to enable cursor trail (can be performance intensive)
    // createCursorTrail();

    // Performance monitoring and optimization
    class PerformanceMonitor {
        constructor() {
            this.fps = 0;
            this.frameCount = 0;
            this.lastTime = performance.now();
            this.isLowPerformance = false;
            this.init();
        }

        init() {
            this.monitorPerformance();
            this.optimizeForDevice();
        }

        monitorPerformance() {
            const currentTime = performance.now();
            this.frameCount++;

            if (currentTime - this.lastTime >= 1000) {
                this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime));
                this.frameCount = 0;
                this.lastTime = currentTime;

                // Adjust quality based on performance
                if (this.fps < 30) {
                    this.isLowPerformance = true;
                    this.reduceQuality();
                } else if (this.fps > 50) {
                    this.isLowPerformance = false;
                    this.increaseQuality();
                }
            }

            requestAnimationFrame(() => this.monitorPerformance());
        }

        optimizeForDevice() {
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
            
            if (isMobile || isLowEnd) {
                this.isLowPerformance = true;
                this.reduceQuality();
            }
        }

        reduceQuality() {
            // Reduce particle counts
            if (window.advancedEffects) {
                window.advancedEffects.physicsParticles = window.advancedEffects.physicsParticles.slice(0, 50);
                window.advancedEffects.liquidParticles = window.advancedEffects.liquidParticles.slice(0, 30);
            }
            
            // Reduce grid complexity
            if (window.interactiveGrid) {
                window.interactiveGrid.setGridSize(60);
                window.interactiveGrid.setGridOpacity(0.2);
                window.interactiveGrid.setDistortionStrength(30);
                window.interactiveGrid.setWaveAmplitude(10);
            }
            
            // Disable some effects
            document.body.classList.add('low-performance');
        }

        increaseQuality() {
            document.body.classList.remove('low-performance');
            
            // Restore grid quality
            if (window.interactiveGrid) {
                window.interactiveGrid.setGridSize(40);
                window.interactiveGrid.setGridOpacity(0.3);
                window.interactiveGrid.setDistortionStrength(50);
                window.interactiveGrid.setWaveAmplitude(20);
            }
        }
    }

    // Initialize performance monitoring
    const performanceMonitor = new PerformanceMonitor();

    // Advanced intersection observer for performance
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Start animations only when visible
                if (entry.target.dataset.animate) {
                    entry.target.style.animationPlayState = 'running';
                }
            } else {
                // Pause animations when not visible
                if (entry.target.dataset.animate) {
                    entry.target.style.animationPlayState = 'paused';
                }
            }
        });
    }, { 
        threshold: 0.1,
        rootMargin: '50px'
    });

    // Observe all animated elements
    document.querySelectorAll('.fade-in, [data-animate]').forEach(el => {
        lazyObserver.observe(el);
    });

    // Advanced mouse tracking for all effects
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        window.mouseX = mouseX;
        window.mouseY = mouseY;
    });

    // Preload critical resources
    const preloadResources = () => {
        const criticalImages = [
            // Add any critical images here
        ];
        
        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    };

    // Initialize preloading
    preloadResources();

    // Advanced error handling
    window.addEventListener('error', (e) => {
        console.warn('Performance issue detected:', e.error);
        if (window.advancedEffects) {
            window.advancedEffects.destroy();
        }
    });

    // Memory cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (window.advancedEffects) {
            window.advancedEffects.destroy();
        }
        if (window.interactiveGrid) {
            window.interactiveGrid.destroy();
        }
        lazyObserver.disconnect();
    });

    console.log('🚀 Advanced Portfolio Website Loaded Successfully!');
    console.log('✨ Features: Physics Simulation, Liquid Effects, WebGL, Advanced Animations');
    console.log('🎯 Performance: Optimized for 60fps with adaptive quality');
});