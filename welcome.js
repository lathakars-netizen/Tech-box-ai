/**
 * TECH BOX AI - Welcome Screen Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initCyberCanvas();
    initParallaxEffect();
    initWelcomeScreen();
});

/* ==========================================================================
   1. Interactive Cyber Canvas Background
   ========================================================================== */
function initCyberCanvas() {
    const canvas = document.getElementById('cyberCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 18000), 65);

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.6;
            this.vy = (Math.random() - 0.5) * 0.6;
            this.radius = Math.random() * 1.8 + 0.8;
            this.alpha = Math.random() * 0.5 + 0.2;
            this.color = Math.random() > 0.4 ? '#38bdf8' : (Math.random() > 0.5 ? '#818cf8' : '#06b6d4');
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

        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();

            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 130) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = '#38bdf8';
                    ctx.globalAlpha = (1 - dist / 130) * 0.15;
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
   2. Parallax Motion on Mouse Movement
   ========================================================================== */
function initParallaxEffect() {
    const phones = document.querySelectorAll('.floating-phone');
    const card = document.getElementById('welcomeGlassCard');

    window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        if (card) {
            const tiltX = mouseY * -5;
            const tiltY = mouseX * 5;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }

        phones.forEach(phone => {
            const speed = parseFloat(phone.getAttribute('data-speed')) || 1;
            const moveX = mouseX * speed * 12;
            const moveY = mouseY * speed * 12;
            phone.style.marginTop = `${moveY}px`;
            phone.style.marginLeft = `${moveX}px`;
        });
    });
}

/* ==========================================================================
   3. Multilingual Welcome Handler & 2-Second Auto-Redirect
   ========================================================================== */
function initWelcomeScreen() {
    const welcomeHeading = document.getElementById('welcomeHeading');
    const statusText = document.getElementById('statusText');
    const glassCard = document.getElementById('welcomeGlassCard');

    // Read selected language from localStorage (techbox_language)
    const selectedLang = localStorage.getItem('techbox_language') || 'en';

    // Map language code to exact required welcome message
    let welcomeText = '';
    let statusMessage = '';

    switch (selectedLang) {
        case 'hi':
            // TECH BOX AI में आपका स्वागत है
            welcomeText = '<span class="brand-highlight">TECH BOX AI</span> में आपका स्वागत है';
            statusMessage = 'गृह पृष्ठ पर पुनर्निर्देशित किया जा रहा है...';
            if (welcomeHeading) welcomeHeading.classList.add('lang-hi-font');
            break;

        case 'te':
            // TECH BOX AI కు స్వాగతం
            welcomeText = '<span class="brand-highlight">TECH BOX AI</span> కు స్వాగతం';
            statusMessage = 'హోమ్ పేజీకి రీడైరెక్ట్ చేయబడుతోంది...';
            if (welcomeHeading) welcomeHeading.classList.add('lang-te-font');
            break;

        case 'en':
        default:
            // Welcome to TECH BOX AI
            welcomeText = 'Welcome to <span class="brand-highlight">TECH BOX AI</span>';
            statusMessage = 'Redirecting to Home...';
            break;
    }

    // Set Welcome Heading HTML
    if (welcomeHeading) {
        welcomeHeading.innerHTML = welcomeText;
    }

    // Set status message text
    if (statusText) {
        statusText.textContent = statusMessage;
    }

    // Smooth exit transition at 1.7 seconds, redirect at exactly 2.0 seconds (2000 ms)
    setTimeout(() => {
        if (glassCard) {
            glassCard.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            glassCard.style.opacity = '0';
            glassCard.style.transform = 'scale(0.95) translateY(-15px)';
            glassCard.style.filter = 'blur(8px)';
        }
    }, 1700);

    // Exact 2-second automatic redirect to home.html
    setTimeout(() => {
        window.location.href = 'home.html';
    }, 2000);
}
