// ===== ACTIVE JS (pour les révélations au défilement) =====
document.documentElement.classList.add('js');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    initPreloader();
    initField();
    initEnvObserver();
    renderProjects();
    initReveal();
    initTyping();
    initNavbar();
    initProjectFilters();
    initSpotlight();
    initTilt();
    initMagnetic();
    initCursor();
    initBackToTop();
    initTooltips();
    initSmoothScroll();
    initScrollEngine();
    initStatsCounter();
});

// ===== RÉVÉLATION AU DÉFILEMENT (réutilise les attributs data-aos) =====
function initReveal() {
    const items = document.querySelectorAll('[data-aos], [data-reveal]');
    if (!items.length) return;
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = Number.parseInt(el.dataset.aosDelay, 10) || 0;
            el.style.transitionDelay = delay + 'ms';
            el.classList.add('aos-in');
            obs.unobserve(el);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(el => io.observe(el));
}

// ===== EFFET DE FRAPPE (sur mesure, sans dépendance) =====
function initTyping() {
    const el = document.querySelector('.typed-text');
    if (!el) return;
    const phrases = [
        'Axel Le Faucheur',
        'Développeur Fullstack',
        'Développeur Backend Java',
        'Passionné d\'IA & de LLM',
        'Ingénieur Data & Cloud'
    ];
    const caret = document.createElement('span');
    caret.className = 'typed-caret';
    el.after(caret);

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        el.textContent = phrases[0];
        return;
    }

    let p = 0, i = 0, deleting = false;
    function tick() {
        const word = phrases[p];
        el.textContent = word.slice(0, i);
        if (!deleting && i < word.length) { i++; setTimeout(tick, 70); }
        else if (!deleting && i === word.length) { deleting = true; setTimeout(tick, 1900); }
        else if (deleting && i > 0) { i--; setTimeout(tick, 38); }
        else { deleting = false; p = (p + 1) % phrases.length; setTimeout(tick, 320); }
    }
    tick();
}

// ===== NAVBAR (l'état actif est piloté par l'observateur d'environnement) =====
let navLinks = [];
function initNavbar() {
    navLinks = document.querySelectorAll('.nav-link');
}

// ===== SKILL BARS ANIMATION =====
function initSkillBars() {
    const skillBars = document.querySelectorAll('.progress-bar');
    
    const animateSkillBars = () => {
        skillBars.forEach(bar => {
            const progress = bar.getAttribute('data-progress');
            const barPosition = bar.getBoundingClientRect().top;
            const screenPosition = window.innerHeight;
            
            if (barPosition < screenPosition) {
                bar.style.width = progress + '%';
            }
        });
    };
    
    window.addEventListener('scroll', animateSkillBars);
    animateSkillBars(); // Initial check
}

// ===== PROJECT FILTERS =====
function applyProjectFilter(col, matches) {
    if (matches) {
        col.style.display = '';
        requestAnimationFrame(() => {
            col.style.opacity = '1';
            col.style.transform = 'scale(1)';
        });
    } else {
        col.style.opacity = '0';
        col.style.transform = 'scale(0.9)';
        setTimeout(() => { col.style.display = 'none'; }, 300);
    }
}

function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCols = document.querySelectorAll('.project-col');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const filter = this.dataset.filter;
            projectCols.forEach(col => {
                const matches = filter === 'all' || col.dataset.category === filter;
                applyProjectFilter(col, matches);
            });
        });
    });
}

// ===== CONTACT FORM =====
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            
            btn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>Message envoyé !';
            btn.disabled = true;
            
            // Reset form after 3 seconds
            setTimeout(() => {
                contactForm.reset();
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        });
    }
}

// ===== BACK TO TOP (visibilité pilotée par le moteur de scroll) =====
function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;

    backToTopBtn.addEventListener('click', function() {
        if (lenis) {
            lenis.scrollTo(0, { duration: 1.2 });
        } else {
            globalThis.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}

// ===== TOOLTIPS =====
function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// ===== SMOOTH SCROLL À INERTIE (Lenis, style site d'architecture) =====
let lenis = null;
function initSmoothScroll() {
    const reduce = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof Lenis !== 'undefined' && !reduce) {
        lenis = new Lenis({
            duration: 1.15,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.6
        });
        const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
        requestAnimationFrame(raf);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href.length <= 1) return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            if (lenis) {
                lenis.scrollTo(target, { offset: -80, duration: 1.3 });
            } else {
                globalThis.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
            }
        });
    });
}

// ===== RENDER PROJECTS =====
function renderProjects() {
    const projectsGrid = document.getElementById('projectsGrid');

    if (projectsGrid && typeof projectsData !== 'undefined') {
        projectsGrid.innerHTML = projectsData
            .map((project, index) => createProjectCard(project, index))
            .join('');

        // Re-initialize AOS for new elements
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    } else {
        console.error('Cannot render projects - missing projectsGrid or projectsData');
    }
}

// ===== CREATE PROJECT CARD =====
function createProjectCard(project, index) {
    const delay = (index % 3) * 100;
    const featuredClass = project.featured ? ' featured' : '';

    const links = [];
    if (project.demoUrl && project.demoUrl !== '#') {
        links.push(`<a href="${project.demoUrl}" target="_blank" rel="noopener" aria-label="Voir la démo" title="Voir le site"><i class="bi bi-box-arrow-up-right"></i></a>`);
    }
    if (project.githubUrl && project.githubUrl !== '#') {
        links.push(`<a href="${project.githubUrl}" target="_blank" rel="noopener" aria-label="Code source" title="Code source"><i class="bi bi-github"></i></a>`);
    }
    const overlay = links.length
        ? `<div class="project-overlay">${links.join('')}</div>`
        : '';
    const badge = project.featured
        ? '<span class="featured-badge">\u2605 Mis en avant</span>'
        : '';

    return `
        <div class="col-lg-4 col-md-6 project-col" data-category="${project.category}" data-aos="fade-up" data-aos-delay="${delay}">
            <div class="project-card${featuredClass}" data-category="${project.category}">
                <div class="project-image" data-reveal="clip">
                    <img src="${project.image}" alt="${project.title}" loading="lazy">
                    ${overlay}
                </div>
                ${badge}
                <div class="project-content">
                    <div class="project-category">${project.categoryName}</div>
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    <div class="project-tags">
                        ${project.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===== COUNTER ANIMATION =====
function animateCounter(element, target, duration = 2000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(start);
        }
    }, 16);
}

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// ===== CURSOR EFFECT (Optional) =====
function initCustomCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    document.body.appendChild(cursor);
    
    const cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursorFollower);
    
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;
    
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    function animate() {
        // Smooth cursor movement
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        
        followerX += (mouseX - followerX) * 0.1;
        followerY += (mouseY - followerY) * 0.1;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        cursorFollower.style.left = followerX + 'px';
        cursorFollower.style.top = followerY + 'px';
        
        requestAnimationFrame(animate);
    }
    
    animate();
    
    // Cursor effects on hover
    const hoverElements = document.querySelectorAll('a, button, .project-card, .skill-category');
    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
            cursorFollower.classList.add('hover');
        });
        
        element.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
            cursorFollower.classList.remove('hover');
        });
    });
}

// ===== PARALLAX EFFECT =====
function initParallax() {
    window.addEventListener('scroll', function() {
        const scrolled = window.scrollY;
        const parallaxElements = document.querySelectorAll('.parallax');
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// ===== BARRE DE PROGRESSION — gérée par le moteur de scroll unifié (voir initScrollEngine) =====

// ===== HERO STATS COUNTER =====
function runCounter(el) {
    const target = Number.parseInt(el.dataset.target, 10) || 0;
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            el.textContent = target;
        }
    };
    requestAnimationFrame(tick);
}

function initStatsCounter() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounter(entry.target);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

// ===== SKILL CARD MOUSE GLOW =====
function initSkillCardGlow() {
    const cards = document.querySelectorAll('.skill-card');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });
    });
}

// ===== LOAD EVERYTHING =====
window.addEventListener('load', function() {
    // Refresh AOS once all assets (images, fonts) are loaded
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
});

// =========================================================================
// =====            ADAPTIVE WORLDS 2026 — moteur d'animations         =====
// =========================================================================

// ===== PRÉCHARGEUR =====
function initPreloader() {
    const pre = document.getElementById('preloader');
    if (!pre) return;
    const fill = pre.querySelector('.preloader-fill');
    const count = pre.querySelector('.preloader-count');
    let n = 0;
    const timer = setInterval(() => {
        n += Math.floor(Math.random() * 8) + 3;
        if (n >= 100) { n = 100; clearInterval(timer); }
        if (fill) fill.style.width = n + '%';
        if (count) count.textContent = n + '%';
    }, 90);

    function finish() {
        clearInterval(timer);
        if (fill) fill.style.width = '100%';
        if (count) count.textContent = '100%';
        setTimeout(() => pre.classList.add('done'), 350);
    }
    window.addEventListener('load', finish);
    setTimeout(finish, 3500); // filet de sécurité
}

// ===== SURLIGNAGE DE LA SECTION ACTIVE (navigation uniquement) =====
function setActiveWorld(env) {
    document.querySelectorAll('.world-dot').forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('href') === '#' + env);
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + env);
    });
}

function initEnvObserver() {
    const sections = document.querySelectorAll('section[data-env]');
    if (!sections.length) return;

    let current = '';
    const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const env = entry.target.dataset.env;
            if (env && env !== current) {
                current = env;
                setActiveWorld(env);
            }
        });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(s => io.observe(s));
}

// ===== CANVAS CONSTELLATION (réactif à la souris — couleurs fixes) =====
function initField() {
    const canvas = document.getElementById('fieldCanvas');
    if (!canvas) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = canvas.getContext('2d');
    let w = 0, h = 0, dpr = 1, particles = [], raf = 0;
    const mouse = { x: -9999, y: -9999 };
    const COUNT = window.innerWidth < 768 ? 22 : 54;

    // Couleurs lues une seule fois (palette fixe, plus de changement d'environnement)
    const cs = getComputedStyle(document.documentElement);
    const colors = {
        a: cs.getPropertyValue('--env-a').trim() || '#6366f1',
        c: cs.getPropertyValue('--env-c').trim() || '#22d3ee'
    };

    function resize() {
        dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        w = canvas.width = Math.floor(window.innerWidth * dpr);
        h = canvas.height = Math.floor(window.innerHeight * dpr);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
    }
    function seed() {
        particles = Array.from({ length: COUNT }, () => ({
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.28 * dpr,
            vy: (Math.random() - 0.5) * 0.28 * dpr,
            r: (Math.random() * 1.6 + 0.6) * dpr
        }));
    }
    let last = 0, paused = false;
    function step(now) {
        raf = requestAnimationFrame(step);
        if (paused || now - last < 32) return;   // ~30 fps : divise par 2 le coût
        last = now;

        ctx.clearRect(0, 0, w, h);
        const md = 112 * dpr, md2 = md * md, mo2 = (150 * dpr) * (150 * dpr);

        for (let i = 0; i < particles.length; i++) {
            const p = particles[i];
            p.x += p.vx; p.y += p.vy;
            if (p.x < 0 || p.x > w) p.vx *= -1;
            if (p.y < 0 || p.y > h) p.vy *= -1;

            const mdx = mouse.x - p.x, mdy = mouse.y - p.y;
            if (mdx * mdx + mdy * mdy < mo2) { p.x += mdx * 0.006; p.y += mdy * 0.006; }

            ctx.globalAlpha = 0.7;
            ctx.fillStyle = colors.c;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();

            for (let j = i + 1; j < particles.length; j++) {
                const q = particles[j];
                const dx = p.x - q.x, dy = p.y - q.y;
                const d2 = dx * dx + dy * dy;
                if (d2 < md2) {
                    ctx.globalAlpha = (1 - Math.sqrt(d2) / md) * 0.3;
                    ctx.strokeStyle = colors.a;
                    ctx.lineWidth = dpr;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(q.x, q.y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
    }

    globalThis.addEventListener('mousemove', e => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    globalThis.addEventListener('mouseout', () => { mouse.x = -9999; mouse.y = -9999; });
    globalThis.addEventListener('resize', () => { resize(); seed(); }, { passive: true });
    document.addEventListener('visibilitychange', () => { paused = document.hidden; });

    resize(); seed();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(step);
}

// ===== CURSEUR PERSONNALISÉ (point + anneau avec traîne) =====
function initCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add('has-cursor');

    let mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = `translate(${mx}px, ${my}px)`;
    }, { passive: true });

    (function loop() {
        rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
        ring.style.transform = `translate(${rx}px, ${ry}px)`;
        requestAnimationFrame(loop);
    })();

    window.addEventListener('mousedown', () => root.classList.add('cursor-down'));
    window.addEventListener('mouseup', () => root.classList.remove('cursor-down'));

    const hoverSel = 'a, button, .btn, .filter-btn, .world-dot, .skill-badge, .project-card, .float-chip, input, textarea';
    document.querySelectorAll(hoverSel).forEach(el => {
        el.addEventListener('mouseenter', () => root.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => root.classList.remove('cursor-hover'));
    });
}

// ===== BOUTONS MAGNÉTIQUES =====
function initMagnetic() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
        const strength = 0.32;
        btn.addEventListener('mousemove', e => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left - r.width / 2;
            const y = e.clientY - r.top - r.height / 2;
            btn.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
}

// ===== TILT 3D (au pointeur) =====
function initTilt() {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
        el.addEventListener('mousemove', e => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            el.style.transform = `rotateY(${px * 10}deg) rotateX(${-py * 10}deg)`;
        });
        el.addEventListener('mouseleave', () => { el.style.transform = ''; });
    });
}

// ===== PROJECTEUR AU POINTEUR (cartes) =====
function initSpotlight() {
    const sel = '.project-card, .skill-card, .timeline-content, .contact-info-card';
    document.querySelectorAll(sel).forEach(card => {
        card.addEventListener('mousemove', e => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
            card.style.setProperty('--my', (e.clientY - r.top) + 'px');
        });
    });
}

// ===== MOTEUR DE SCROLL UNIFIÉ (une seule boucle, géométrie mise en cache) =====
function initScrollEngine() {
    const reduce = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const navbar = document.getElementById('mainNav');
    const progressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');
    const fixedLayers = Array.from(document.querySelectorAll('[data-scroll-fixed]'))
        .map(el => ({ el, amp: (Number.parseFloat(el.dataset.scrollFixed) || 0.1) * 260 }));
    const flowEls = Array.from(document.querySelectorAll('[data-parallax], .section-title'));
    const hero = document.getElementById('home');
    const heroCopy = document.querySelector('.hero-copy');
    const heroVisual = document.querySelector('.hero-visual');

    let flow = [];
    let docH = 1;

    // Lectures de layout coûteuses (offsetTop / offsetHeight) : UNIQUEMENT au
    // chargement et au resize — jamais pendant le défilement (évite les reflows).
    function measure() {
        docH = document.documentElement.scrollHeight - globalThis.innerHeight;
        flow = flowEls.map(el => {
            let top = 0, n = el;
            while (n) { top += n.offsetTop; n = n.offsetParent; }
            return { el, speed: Number.parseFloat(el.dataset.parallax) || 0.05, top, h: el.offsetHeight };
        });
    }

    let ticking = false;

    function update() {
        ticking = false;
        const y = globalThis.scrollY;
        const vh = globalThis.innerHeight;

        // États légers — aucune lecture de layout, uniquement des écritures
        if (navbar) navbar.classList.toggle('scrolled', y > 50);
        if (backToTopBtn) backToTopBtn.classList.toggle('show', y > 300);
        if (progressBar) progressBar.style.width = (docH > 0 ? (y / docH) * 100 : 0).toFixed(2) + '%';

        if (reduce) { return; }

        // 1) Couches de fond : dérive bornée selon la progression globale
        const progress = docH > 0 ? y / docH : 0;
        for (const l of fixedLayers) {
            l.el.style.translate = `0 ${((progress - 0.5) * l.amp).toFixed(1)}px`;
        }

        // 2) Contenu en flux : parallaxe centrée sur le viewport (géométrie en cache)
        const centre = y + vh / 2;
        for (const it of flow) {
            const mid = (it.top + it.h / 2) - centre;
            it.el.style.translate = `0 ${(-mid * it.speed).toFixed(1)}px`;
        }

        // 3) Hero : fondu + recul en profondeur au scroll
        if (hero) {
            const t = Math.min(Math.max(y / (vh * 0.9), 0), 1);
            if (t <= 0.001) {
                if (heroCopy) { heroCopy.style.opacity = ''; heroCopy.style.transform = ''; }
                if (heroVisual) heroVisual.style.opacity = '';
            } else {
                const fade = (1 - t * 0.92).toFixed(3);
                if (heroCopy) {
                    heroCopy.style.opacity = fade;
                    heroCopy.style.transform = `translateY(${(-70 * t).toFixed(1)}px) scale(${(1 - 0.06 * t).toFixed(3)})`;
                }
                if (heroVisual) heroVisual.style.opacity = fade;
            }
        }
    }

    function requestTick() {
        if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }

    globalThis.addEventListener('scroll', requestTick, { passive: true });
    globalThis.addEventListener('resize', () => { measure(); requestTick(); }, { passive: true });
    globalThis.addEventListener('load', measure);

    measure();
    update();
}


