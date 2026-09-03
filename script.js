/**
 * TECH BOX AI - Language Selection Interactive Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    initCyberCanvas();
    initParallaxEffect();
    initLanguageSelection();
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

    // Populate particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Resize handler
    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw faint connecting lines
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
    const card = document.getElementById('glassCard');

    window.addEventListener('mousemove', (e) => {
        const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

        // Subtle Card Tilt
        if (card) {
            const tiltX = mouseY * -6;
            const tiltY = mouseX * 6;
            card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
        }

        // Floating Phones Parallax Shift
        phones.forEach(phone => {
            const speed = parseFloat(phone.getAttribute('data-speed')) || 1;
            const moveX = mouseX * speed * 15;
            const moveY = mouseY * speed * 15;
            phone.style.marginTop = `${moveY}px`;
            phone.style.marginLeft = `${moveX}px`;
        });
    });
}

/* ==========================================================================
   3. Language Selection & Navigation Handler
   ========================================================================== */
function initLanguageSelection() {
    const buttons = document.querySelectorAll('.lang-btn');
    const toast = document.getElementById('toastNotification');
    const toastMsg = document.getElementById('toastMessage');
    const glassCard = document.getElementById('glassCard');

    buttons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();

            // Prevent double clicks
            if (button.classList.contains('selecting')) return;

            const langCode = button.getAttribute('data-lang');
            const langName = button.getAttribute('data-name');

            // 1. Mark button state
            buttons.forEach(btn => btn.classList.remove('selecting'));
            button.classList.add('selecting');

            // 2. Persist selection to localStorage
            localStorage.setItem('techbox_language', langCode);
            localStorage.setItem('techboxLang', langCode);
            localStorage.setItem('techbox_language_name', langName);
            localStorage.setItem('techbox_lang_timestamp', new Date().toISOString());

            // 3. Trigger Toast Notification
            if (toast && toastMsg) {
                toastMsg.textContent = `${langName} selected. Loading Home Page...`;
                toast.classList.add('show');
            }

            // 4. Smooth Card Transition Out
            setTimeout(() => {
                if (glassCard) {
                    glassCard.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    glassCard.style.opacity = '0';
                    glassCard.style.transform = 'scale(0.92) translateY(-20px)';
                    glassCard.style.filter = 'blur(10px)';
                }
            }, 300);

            // 5. Navigate to Home Page placeholder
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 850);
        });
    });
}
