/**
 * TECH BOX AI - Home Page Controller
 * Navigation Bar & Hero Section Interactive Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initCyberCanvas();
    initThemeToggle();
    initMobileNav();
    initNavbarScroll();
    init3DParallax();
    initSearchUI();
});

/* ==========================================================================
   1. Cyber Canvas Particle Background Animation
   ========================================================================== */
function initCyberCanvas() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 16000), 75);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 1.8 + 0.6;
            this.alpha = Math.random() * 0.45 + 0.25;
            this.color = Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#a855f7' : '#06b6d4');
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.globalAlpha = this.alpha;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);

        const isLightMode = document.body.classList.contains('light-mode');
        const lineColor = isLightMode ? '#0284c7' : '#38bdf8';

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 125) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = lineColor;
                    ctx.globalAlpha = (1 - dist / 125) * (isLightMode ? 0.12 : 0.16);
                    ctx.lineWidth = 0.8;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    animate();
}

/* ==========================================================================
   2. Dark / Light Mode Toggle
   ========================================================================== */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const mobileThemeBtn = document.getElementById('mobileThemeBtn');

    // Read stored theme preference or default to dark
    const savedTheme = localStorage.getItem('techbox_theme') || 'dark';

    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
    } else {
        document.body.classList.remove('light-mode');
    }

    function toggleTheme() {
        const isLight = document.body.classList.toggle('light-mode');
        localStorage.setItem('techbox_theme', isLight ? 'light' : 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    if (mobileThemeBtn) {
        mobileThemeBtn.addEventListener('click', toggleTheme);
    }
}

/* ==========================================================================
   3. Mobile Navigation Drawer Handler
   ========================================================================== */
function initMobileNav() {
    const hamburgerBtn = document.getElementById('hamburgerBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileCloseBtn = document.getElementById('mobileCloseBtn');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    if (!hamburgerBtn || !mobileDrawer) return;

    function openMobileNav() {
        hamburgerBtn.classList.add('is-active');
        mobileDrawer.classList.add('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeMobileNav() {
        hamburgerBtn.classList.remove('is-active');
        mobileDrawer.classList.remove('is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    hamburgerBtn.addEventListener('click', () => {
        if (mobileDrawer.classList.contains('is-open')) {
            closeMobileNav();
        } else {
            openMobileNav();
        }
    });

    if (mobileCloseBtn) {
        mobileCloseBtn.addEventListener('click', closeMobileNav);
    }

    mobileLinks.forEach(link => {
        link.addEventListener('click', closeMobileNav);
    });
}

/* ==========================================================================
   4. Navbar Scroll Glass Effect
   ========================================================================== */
function initNavbarScroll() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 30) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/* ==========================================================================
   5. Interactive 3D Parallax Tilt Effect for Smartphone Visual
   ========================================================================== */
function init3DParallax() {
    const stage = document.getElementById('phoneStage');
    const card = document.getElementById('phoneCard');
    const badges = document.querySelectorAll('.stage-holo-badge');

    if (!stage || !card) return;

    stage.addEventListener('mousemove', (e) => {
        const rect = stage.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const rotateX = ((e.clientY - centerY) / (rect.height / 2)) * -16;
        const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * 16;

        card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

        badges.forEach(badge => {
            const speed = parseFloat(badge.getAttribute('data-speed')) || 1;
            const moveX = ((e.clientX - centerX) / (rect.width / 2)) * speed * 15;
            const moveY = ((e.clientY - centerY) / (rect.height / 2)) * speed * 15;
            badge.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
    });

    stage.addEventListener('mouseleave', () => {
        card.style.transform = `rotateX(0deg) rotateY(0deg)`;
        badges.forEach(badge => {
            badge.style.transform = `translate(0px, 0px)`;
        });
/* ==========================================================================
   6. Search Component UI Interaction (Pure UI Component)
   ========================================================================== */
function initSearchUI() {
    const heroInput = document.getElementById('heroSearchInput');
    const heroTags = document.querySelectorAll('.hero-tag');

    // Popular tag fill helper for UI feedback (no search execution)
    heroTags.forEach(tag => {
        tag.addEventListener('click', () => {
            if (heroInput) {
                heroInput.value = tag.textContent.trim();
                heroInput.focus();
            }
        });
    });
}
