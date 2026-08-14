document.documentElement.classList.add('js');

let navLinks = [];
let lenis = null;
let contactShadowTexture = null;

const zoneLabels = {
    home: "QUAI D'ARRIVEE",
    about: 'BAIE BACKEND // JAVA',
    skills: 'LABORATOIRE DATA',
    projects: 'LABORATOIRE IA',
    experience: 'BAIE CLOUD // OPS',
    contact: 'DOME LUNAIRE'
};

document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    renderProjects();
    initNavbar();
    initStationScene();
    initEnvironmentObserver();
    initReveal();
    initTyping();
    initProjectFilters();
    initSpotlight();
    initMagneticButtons();
    initCustomCursor();
    initBackToTop();
    initTooltips();
    initSmoothScroll();
    initScrollEngine();
    initStatsCounter();
    setActiveWorld('home');
});

function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const fill = preloader.querySelector('.preloader-fill');
    const count = preloader.querySelector('.preloader-count');
    let progress = 0;
    const timer = setInterval(() => {
        progress = Math.min(100, progress + 10);
        if (fill) fill.style.width = `${progress}%`;
        if (count) count.textContent = `${progress}%`;
        if (progress === 100) clearInterval(timer);
    }, 70);

    const finish = () => {
        clearInterval(timer);
        if (fill) fill.style.width = '100%';
        if (count) count.textContent = '100%';
        setTimeout(() => preloader.classList.add('done'), 260);
    };

    globalThis.addEventListener('load', finish, { once: true });
    setTimeout(finish, 2600);
}

function initReveal() {
    const items = document.querySelectorAll('[data-aos], [data-reveal]');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const delay = Number.parseInt(entry.target.dataset.aosDelay, 10) || 0;
            entry.target.style.transitionDelay = `${delay}ms`;
            entry.target.classList.add('aos-in');
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(item => observer.observe(item));
}

function initTyping() {
    const target = document.querySelector('.typed-text');
    if (!target) return;
    target.textContent = 'Développeur Fullstack';
}

function initNavbar() {
    navLinks = Array.from(document.querySelectorAll('.nav-link'));
}

function setActiveWorld(environment) {
    document.documentElement.dataset.stationZone = environment;
    const label = document.getElementById('stationZone');
    if (label) label.textContent = zoneLabels[environment] || zoneLabels.home;

    document.querySelectorAll('.world-dot').forEach(dot => {
        dot.classList.toggle('active', dot.getAttribute('href') === `#${environment}`);
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${environment}`);
    });
}

function initEnvironmentObserver() {
    const sections = document.querySelectorAll('section[data-env]');
    if (!sections.length) return;

    let active = 'home';
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const environment = entry.target.dataset.env;
            if (!environment || environment === active) return;
            active = environment;
            setActiveWorld(environment);
        });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    sections.forEach(section => observer.observe(section));
}

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid || typeof projectsData === 'undefined') return;
    grid.innerHTML = projectsData.map((project, index) => createProjectCard(project, index)).join('');
}

function createProjectCard(project, index) {
    const delay = (index % 3) * 100;
    const featuredClass = project.featured ? ' featured' : '';
    const featuredBadge = project.featured ? '<span class="featured-badge">Mission cle</span>' : '';
    const links = [];

    if (project.demoUrl && project.demoUrl !== '#') {
        links.push(`<a href="${project.demoUrl}" target="_blank" rel="noopener" aria-label="Voir la demonstration"><i class="bi bi-box-arrow-up-right"></i></a>`);
    }
    if (project.githubUrl && project.githubUrl !== '#') {
        links.push(`<a href="${project.githubUrl}" target="_blank" rel="noopener" aria-label="Voir le code source"><i class="bi bi-github"></i></a>`);
    }

    const overlay = links.length ? `<div class="project-overlay">${links.join('')}</div>` : '';
    return `
        <div class="col-lg-4 col-md-6 project-col" data-category="${project.category}" data-aos="fade-up" data-aos-delay="${delay}">
            <article class="project-card${featuredClass}">
                <div class="project-image" data-reveal="clip">
                    <img src="${project.image}" alt="${project.title}" width="1200" height="800" loading="lazy">
                    ${overlay}
                </div>
                ${featuredBadge}
                <div class="project-content">
                    <div class="project-category">${project.categoryName}</div>
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    <div class="project-tags">${project.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}</div>
                </div>
            </article>
        </div>
    `;
}

function initProjectFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.project-col');

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            buttons.forEach(item => item.classList.toggle('active', item === button));
            cards.forEach(card => {
                const visible = filter === 'all' || card.dataset.category === filter;
                card.style.opacity = visible ? '1' : '0';
                card.style.transform = visible ? 'scale(1)' : 'scale(0.96)';
                setTimeout(() => { card.style.display = visible ? '' : 'none'; }, visible ? 0 : 240);
            });
        });
    });
}

function initSpotlight() {
    document.querySelectorAll('.project-card, .skill-card, .timeline-content, .contact-info-card').forEach(card => {
        card.addEventListener('mousemove', event => {
            const bounds = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${event.clientX - bounds.left}px`);
            card.style.setProperty('--my', `${event.clientY - bounds.top}px`);
        });
    });
}

function initMagneticButtons() {
    if (!globalThis.matchMedia('(pointer: fine)').matches) return;
    document.querySelectorAll('.btn-magnetic').forEach(button => {
        button.addEventListener('mousemove', event => {
            const bounds = button.getBoundingClientRect();
            const x = event.clientX - bounds.left - bounds.width / 2;
            const y = event.clientY - bounds.top - bounds.height / 2;
            button.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
        });
        button.addEventListener('mouseleave', () => { button.style.transform = ''; });
    });
}

function initCustomCursor() {
    if (!globalThis.matchMedia('(pointer: fine)').matches) return;
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add('has-cursor');
    let mouseX = globalThis.innerWidth / 2;
    let mouseY = globalThis.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    globalThis.addEventListener('mousemove', event => {
        mouseX = event.clientX;
        mouseY = event.clientY;
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    }, { passive: true });

    function animate() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;
        ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
        requestAnimationFrame(animate);
    }
    animate();

    globalThis.addEventListener('mousedown', () => root.classList.add('cursor-down'));
    globalThis.addEventListener('mouseup', () => root.classList.remove('cursor-down'));
    document.querySelectorAll('a, button, .btn, .filter-btn, .world-dot, .project-card, .skill-badge').forEach(element => {
        element.addEventListener('mouseenter', () => root.classList.add('cursor-hover'));
        element.addEventListener('mouseleave', () => root.classList.remove('cursor-hover'));
    });
}

function initBackToTop() {
    const button = document.getElementById('backToTop');
    if (!button) return;
    button.addEventListener('click', () => {
        if (lenis) {
            lenis.scrollTo(0, { duration: 1.1 });
            return;
        }
        globalThis.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

function initTooltips() {
    if (!globalThis.bootstrap?.Tooltip) return;
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(element => {
        new globalThis.bootstrap.Tooltip(element);
    });
}

function initSmoothScroll() {
    const reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (globalThis.Lenis && !reducedMotion) {
        lenis = new globalThis.Lenis({
            duration: 1.08,
            easing: value => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 1.4
        });
        const raf = time => {
            lenis.raf(time);
            requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', event => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (!target) return;
            event.preventDefault();
            if (lenis) {
                lenis.scrollTo(target, { offset: -72, duration: 1.12 });
                return;
            }
            globalThis.scrollTo({ top: target.offsetTop - 72, behavior: 'smooth' });
        });
    });
}

function initScrollEngine() {
    const navbar = document.getElementById('mainNav');
    const progressBar = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    const heroCopy = document.querySelector('.hero-copy');
    const reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let documentHeight = 1;
    let scheduled = false;

    function measure() {
        documentHeight = Math.max(document.documentElement.scrollHeight - globalThis.innerHeight, 1);
    }

    function update() {
        scheduled = false;
        const scrollY = globalThis.scrollY;
        const progress = scrollY / documentHeight;
        if (navbar) navbar.classList.toggle('scrolled', scrollY > 48);
        if (backToTop) backToTop.classList.toggle('show', scrollY > 300);
        if (progressBar) progressBar.style.width = `${(progress * 100).toFixed(2)}%`;

        if (!reducedMotion && heroCopy) {
            const amount = Math.min(Math.max(scrollY / (globalThis.innerHeight * 0.85), 0), 1);
            heroCopy.style.opacity = `${1 - amount * 0.85}`;
            heroCopy.style.transform = `translateY(${-46 * amount}px)`;
        }
    }

    function requestUpdate() {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(update);
    }

    globalThis.addEventListener('scroll', requestUpdate, { passive: true });
    globalThis.addEventListener('resize', () => {
        measure();
        requestUpdate();
    }, { passive: true });
    measure();
    update();
}

function initStatsCounter() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const target = Number.parseInt(entry.target.dataset.target, 10) || 0;
            const start = performance.now();
            const duration = 1400;
            const animate = time => {
                const progress = Math.min((time - start) / duration, 1);
                entry.target.textContent = `${Math.floor(target * (1 - Math.pow(1 - progress, 3)))}`;
                if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
}

function initStationScene() {
    const canvas = document.getElementById('stationCanvas');
    if (!canvas || !globalThis.THREE) {
        document.documentElement.classList.add('station-fallback');
        return;
    }

    const three = globalThis.THREE;
    const compactViewport = globalThis.matchMedia('(max-width: 767px)').matches;
    const reducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const renderer = new three.WebGLRenderer({ canvas, antialias: !compactViewport, powerPreference: 'high-performance' });
    const scene = new three.Scene();
    const camera = new three.PerspectiveCamera(compactViewport ? 62 : 50, 1, 0.1, 160);
    const station = new three.Group();
    const animatedOperators = [];
    const animatedDisplays = [];
    const route = createCameraRoute(three);
    const pointer = new three.Vector2();
    const cameraPosition = new three.Vector3();
    const cameraLookAt = new three.Vector3();
    const routePosition = new three.Vector3();
    const routeLookAt = new three.Vector3();
    const smoothedLookAt = new three.Vector3(2.5, 2.75, 0.7);
    let targetProgress = 0.05;
    let currentProgress = 0.05;
    let sectionMap = [];
    let pageHidden = false;
    let lastFrameTime = performance.now();

    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, compactViewport ? 1.2 : 1.55));
    renderer.setClearColor(0x02070a, 1);
    renderer.outputColorSpace = three.SRGBColorSpace;
    renderer.toneMapping = three.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.16;

    scene.background = new three.Color(0x02070a);
    scene.environment = createStationEnvironment(three, renderer);
    scene.fog = new three.FogExp2(0x040c11, compactViewport ? 0.02 : 0.0135);
    scene.add(station);
    camera.position.set(0, 2.8, 10);
    scene.add(camera);
    const cameraLight = new three.PointLight(0xeef2f7, 2.0, 16, 2);
    cameraLight.position.set(0, 0.1, 0.5);
    camera.add(cameraLight);

    const materials = createStationMaterials(three);
    createCentralHub(three, station, materials);

    const backendRoom = createRoom(three, station, materials, { x: -13.5, z: 0, rotation: Math.PI / 2, type: 'backend', title: 'BACKEND BAY', accent: '#6de0ff', earthVariant: 0 });
    const dataRoom = createRoom(three, station, materials, { x: 13.5, z: 0, rotation: -Math.PI / 2, type: 'data', title: 'DATA LAB', accent: '#f4bd72', earthVariant: 1 });
    const aiRoom = createRoom(three, station, materials, { x: 0, z: -13.5, rotation: 0, type: 'ai', title: 'AI LAB', accent: '#b7ff79', earthVariant: 2 });
    const cloudRoom = createRoom(three, station, materials, { x: 0, z: 13.5, rotation: Math.PI, type: 'cloud', title: 'CLOUD OPS', accent: '#9fb7ff', earthVariant: 3 });

    createConnector(three, station, materials, { x: -6.45, z: 0, rotation: Math.PI / 2, accent: '#6de0ff' });
    createConnector(three, station, materials, { x: 6.45, z: 0, rotation: -Math.PI / 2, accent: '#f4bd72' });
    createConnector(three, station, materials, { x: 0, z: -6.45, rotation: 0, accent: '#b7ff79' });
    createConnector(three, station, materials, { x: 0, z: 6.45, rotation: Math.PI, accent: '#9fb7ff' });

    createWorkstation(three, backendRoom, materials, { title: 'JAVA // SPRING', lines: ['var result = service.compare(request);', 'repository.save(result);', 'return ResponseEntity.ok(result);', '@Transactional'], accent: '#6de0ff', suit: 0x35506e, style: { hairColor: 0x4a3626, hairStyle: 'short', garment: 'collar', skinColor: 0xecb892, eyes: 0x5b3a29, beard: 0 }, phase: 0.2, action: 'typing', rank: 'NIVEAU 01 // JUNIOR' }, animatedOperators, animatedDisplays);
    createWorkstation(three, dataRoom, materials, { title: 'SPARK // ORACLE', lines: ['val source = spark.read.parquet(path)', 'val clean = source.filter($"is_valid")', 'clean.join(dictionary, Seq("key"))', 'clean.write.mode("append").save(out)'], accent: '#f4bd72', suit: 0x7a4635, style: { hairColor: 0xcaa96b, hairStyle: 'quiff', garment: 'plain', skinColor: 0xe0a074, eyes: 0x6f7d45, lips: 0xba7d70, beard: 0.35 }, phase: 1.4, action: 'analysis', rank: 'NIVEAU 02 // ANALYSTE' }, animatedOperators, animatedDisplays);
    createWorkstation(three, aiRoom, materials, { title: 'RAG // AGENT', lines: ['const context = await retriever.invoke(q);', 'const answer = await agent.stream({ q });', 'await citations.verify(answer);', 'return answer.final;'], accent: '#b7ff79', suit: 0x35634f, style: { hairColor: 0x2b2420, hairStyle: 'ponytail', garment: 'hoodie', skinColor: 0xc6875f, eyes: 0x2f2420, lips: 0xb07868, beard: 0, cap: 0x2f5f43 }, phase: 2.7, action: 'inference', rank: 'NIVEAU 03 // ARCHITECTE IA' }, animatedOperators, animatedDisplays);
    createWorkstation(three, cloudRoom, materials, { title: 'K8S // ARGO CD', lines: ['argocd app sync comparison-api', 'kubectl rollout status deploy/api', 'health: Healthy / Synced', 'release: complete'], accent: '#9fb7ff', suit: 0x554a78, style: { hairColor: 0x3a2216, hairStyle: 'curly', garment: 'zip', skinColor: 0xd8a07c, eyes: 0x466f86, beard: 0.5 }, phase: 3.9, action: 'deploy', rank: 'NIVEAU 04 // ORBITAL OPS' }, animatedOperators, animatedDisplays);
    createObservationDome(three, station, materials);
    createStars(three, scene, compactViewport);
    const atmosphere = createAtmosphere(three, scene, compactViewport);

    scene.add(new three.HemisphereLight(0xe6ecf2, 0x1b1d22, 1.55));
    const hubLight = new three.PointLight(0xd2e6f0, 2.7, 24, 2);
    hubLight.position.set(0, 4.4, 0);
    scene.add(hubLight);
    const keySun = new three.DirectionalLight(0xfff4e8, 0.6);
    keySun.position.set(6, 12, 8);
    scene.add(keySun);

    function resize() {
        camera.aspect = globalThis.innerWidth / globalThis.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(globalThis.innerWidth, globalThis.innerHeight, false);
    }

    function measureJourney() {
        const markers = [
            { id: 'home', point: 0.05 },
            { id: 'about', point: 0.21 },
            { id: 'skills', point: 0.45 },
            { id: 'projects', point: 0.64 },
            { id: 'experience', point: 0.86 },
            { id: 'contact', point: 1 }
        ];
        sectionMap = markers.map(marker => {
            const section = document.getElementById(marker.id);
            return section ? { location: section.offsetTop, point: marker.point } : null;
        }).filter(Boolean);
        updateJourneyTarget();
    }

    function updateJourneyTarget() {
        if (!sectionMap.length) return;
        const readingPosition = globalThis.scrollY + globalThis.innerHeight * 0.48;
        if (readingPosition <= sectionMap[0].location) {
            targetProgress = sectionMap[0].point;
            return;
        }
        for (let index = 0; index < sectionMap.length - 1; index += 1) {
            const current = sectionMap[index];
            const next = sectionMap[index + 1];
            if (readingPosition <= next.location) {
                const local = Math.min(Math.max((readingPosition - current.location) / Math.max(next.location - current.location, 1), 0), 1);
                // On reste cale sur la piece du developpeur pendant la lecture de la section,
                // puis on transite vers la piece suivante a l'approche de la section suivante.
                const dwell = 0.6;
                const t = local <= dwell ? 0 : (local - dwell) / (1 - dwell);
                targetProgress = current.point + (next.point - current.point) * (t * t * (3 - 2 * t));
                return;
            }
        }
        targetProgress = sectionMap.at(-1).point;
    }

    function render(time) {
        if (!pageHidden) {
            const delta = Math.min((time - lastFrameTime) / 1000, 0.05);
            lastFrameTime = time;
            const rhythm = time * 0.001;
            const progressDamping = 1 - Math.exp(-1.5 * delta);
            const positionDamping = 1 - Math.exp(-3.0 * delta);
            const lookDamping = 1 - Math.exp(-2.6 * delta);
            currentProgress += (targetProgress - currentProgress) * progressDamping;
            resolveRoute(route, currentProgress, routePosition, routeLookAt);

            cameraPosition.copy(routePosition);
            cameraPosition.x += pointer.x * (compactViewport ? 0.045 : 0.09);
            cameraPosition.y -= pointer.y * (compactViewport ? 0.025 : 0.05);
            cameraPosition.y += Math.sin(rhythm * 0.6) * 0.035;
            cameraLookAt.copy(routeLookAt);
            cameraLookAt.x += pointer.x * 0.045;
            smoothedLookAt.lerp(cameraLookAt, lookDamping);
            camera.position.lerp(cameraPosition, positionDamping);
            camera.lookAt(smoothedLookAt);

            animatedOperators.forEach(operator => {
                operator.leftArm.rotation.x = operator.motion.leftBase + Math.sin(rhythm * operator.motion.leftSpeed + operator.phase) * operator.motion.leftRange;
                operator.rightArm.rotation.x = operator.motion.rightBase + Math.cos(rhythm * operator.motion.rightSpeed + operator.phase) * operator.motion.rightRange;
                operator.leftArm.rotation.z = operator.motion.leftTilt;
                operator.rightArm.rotation.z = operator.motion.rightTilt;
            });
            animatedDisplays.forEach(display => {
                display.material.opacity = 0.94 + Math.sin(rhythm * 2.4 + display.phase) * 0.04;
            });
            atmosphere.forEach((layer, index) => {
                layer.points.rotation.y = rhythm * 0.02 * layer.drift * (index % 2 ? -1 : 1);
                layer.points.position.y = Math.sin(rhythm * 0.35 * layer.drift + index) * 0.4;
            });
            renderer.render(scene, camera);
        }
        if (!reducedMotion) requestAnimationFrame(render);
    }

    resize();
    measureJourney();
    globalThis.addEventListener('scroll', updateJourneyTarget, { passive: true });
    globalThis.addEventListener('resize', () => {
        resize();
        measureJourney();
    }, { passive: true });
    globalThis.addEventListener('pointermove', event => {
        pointer.x = (event.clientX / globalThis.innerWidth - 0.5) * 2;
        pointer.y = (event.clientY / globalThis.innerHeight - 0.5) * 2;
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { pageHidden = document.hidden; });
    document.documentElement.dataset.stationScene = 'ready';
    document.documentElement.dataset.stationOperators = 'seated';
    render(0);
}

function createStationMaterials(three) {
    const floor = new three.MeshPhysicalMaterial({
        color: 0x1c333b, metalness: 0.55, roughness: 0.32,
        clearcoat: 0.7, clearcoatRoughness: 0.26, envMapIntensity: 1.2,
        emissive: 0x040d10, emissiveIntensity: 0.18
    });
    return {
        structure: new three.MeshStandardMaterial({ color: 0x51707a, metalness: 0.64, roughness: 0.42, envMapIntensity: 1.05, emissive: 0x06121a, emissiveIntensity: 0.16 }),
        wall: new three.MeshStandardMaterial({ color: 0x60808a, metalness: 0.26, roughness: 0.66, envMapIntensity: 0.85, emissive: 0x0a171b, emissiveIntensity: 0.18 }),
        panel: new three.MeshStandardMaterial({ color: 0x3d5a63, metalness: 0.52, roughness: 0.5, envMapIntensity: 1 }),
        floor,
        furniture: new three.MeshStandardMaterial({ color: 0x27414a, metalness: 0.48, roughness: 0.48, envMapIntensity: 0.95 }),
        dark: new three.MeshStandardMaterial({ color: 0x060f14, metalness: 0.8, roughness: 0.28, envMapIntensity: 1.15 }),
        joint: new three.MeshStandardMaterial({ color: 0x142530, metalness: 0.85, roughness: 0.24, envMapIntensity: 1.15 })
    };
}

function createStationEnvironment(three, renderer) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const sky = context.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, '#0a1016');
    sky.addColorStop(0.46, '#1b2c33');
    sky.addColorStop(0.54, '#26383f');
    sky.addColorStop(0.64, '#121c21');
    sky.addColorStop(1, '#05080c');
    context.fillStyle = sky;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const glows = [
        { x: 0.12, color: 'rgba(130, 200, 230, 0.42)' },
        { x: 0.38, color: 'rgba(225, 190, 145, 0.4)' },
        { x: 0.62, color: 'rgba(185, 215, 155, 0.4)' },
        { x: 0.86, color: 'rgba(175, 192, 222, 0.4)' }
    ];
    glows.forEach(glow => {
        const gx = glow.x * canvas.width;
        const gy = canvas.height * 0.5;
        const pool = context.createRadialGradient(gx, gy, 0, gx, gy, canvas.height * 0.52);
        pool.addColorStop(0, glow.color);
        pool.addColorStop(1, 'rgba(0, 0, 0, 0)');
        context.fillStyle = pool;
        context.fillRect(0, 0, canvas.width, canvas.height);
    });

    const equirect = new three.CanvasTexture(canvas);
    equirect.mapping = three.EquirectangularReflectionMapping;
    equirect.colorSpace = three.SRGBColorSpace;
    const pmrem = new three.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const envMap = pmrem.fromEquirectangular(equirect).texture;
    equirect.dispose();
    pmrem.dispose();
    return envMap;
}

function createAtmosphere(three, scene, compactViewport) {
    const configs = compactViewport
        ? [{ count: 90, size: 0.05, opacity: 0.5, drift: 0.6, color: 0xbfe9ff }]
        : [
            { count: 220, size: 0.05, opacity: 0.55, drift: 0.5, color: 0xbfe9ff },
            { count: 120, size: 0.11, opacity: 0.26, drift: 0.95, color: 0x9fd0ff }
        ];
    return configs.map((config, layerIndex) => {
        const positions = new Float32Array(config.count * 3);
        for (let index = 0; index < config.count; index += 1) {
            const offset = index * 3;
            positions[offset] = (Math.sin(index * 12.9 + layerIndex * 5.1) * 0.5 + Math.sin(index * 3.3)) * 26;
            positions[offset + 1] = Math.abs(Math.sin(index * 7.1 + layerIndex)) * 6.4 + 0.35;
            positions[offset + 2] = (Math.cos(index * 5.7 + layerIndex * 2.3) * 0.5 + Math.sin(index * 2.1)) * 26 - 6;
        }
        const geometry = new three.BufferGeometry();
        geometry.setAttribute('position', new three.BufferAttribute(positions, 3));
        const material = new three.PointsMaterial({
            color: config.color, size: config.size, transparent: true, opacity: config.opacity,
            depthWrite: false, blending: three.AdditiveBlending, sizeAttenuation: true
        });
        const points = new three.Points(geometry, material);
        scene.add(points);
        return { points, drift: config.drift };
    });
}

function getContactShadowTexture(three) {
    if (contactShadowTexture) return contactShadowTexture;
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(64, 64, 4, 64, 64, 62);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    gradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.26)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    contactShadowTexture = new three.CanvasTexture(canvas);
    contactShadowTexture.colorSpace = three.SRGBColorSpace;
    return contactShadowTexture;
}

function addContactShadow(three, parent, position, scale) {
    const material = new three.MeshBasicMaterial({ map: getContactShadowTexture(three), transparent: true, depthWrite: false, opacity: 0.85 });
    const plane = new three.Mesh(new three.PlaneGeometry(1, 1), material);
    plane.rotation.x = -Math.PI / 2;
    plane.position.set(position.x, position.y, position.z);
    plane.scale.set(scale.x, scale.y, 1);
    parent.add(plane);
    return plane;
}

function addBox(three, parent, dimensions, position, material, rotationY = 0) {
    const mesh = new three.Mesh(new three.BoxGeometry(dimensions.x, dimensions.y, dimensions.z), material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.rotation.y = rotationY;
    parent.add(mesh);
    return mesh;
}

function addCylinder(three, parent, radiusTop, radiusBottom, height, position, material) {
    const mesh = new three.Mesh(new three.CylinderGeometry(radiusTop, radiusBottom, height, 16), material);
    mesh.position.set(position.x, position.y, position.z);
    parent.add(mesh);
    return mesh;
}

function createScreenTexture(three, title, lines, accent) {
    const display = document.createElement('canvas');
    display.width = 1024;
    display.height = 576;
    const context = display.getContext('2d');
    const background = context.createLinearGradient(0, 0, 0, display.height);
    background.addColorStop(0, '#0a1c22');
    background.addColorStop(1, '#040f14');
    context.fillStyle = background;
    context.fillRect(0, 0, display.width, display.height);

    context.strokeStyle = accent;
    context.globalAlpha = 0.4;
    context.lineWidth = 2;
    context.strokeRect(24, 24, display.width - 48, display.height - 48);
    context.globalAlpha = 1;

    context.fillStyle = 'rgba(255, 255, 255, 0.05)';
    context.fillRect(24, 24, display.width - 48, 70);
    ['#ff5f56', '#ffbd2e', '#27c93f'].forEach((dotColor, index) => {
        context.fillStyle = dotColor;
        context.beginPath();
        context.arc(60 + index * 32, 60, 8, 0, Math.PI * 2);
        context.fill();
    });
    context.fillStyle = accent;
    context.textBaseline = 'middle';
    context.font = '600 30px monospace';
    context.fillText(title, 168, 60);

    context.font = '25px monospace';
    lines.forEach((line, index) => {
        const y = 150 + index * 50;
        context.fillStyle = 'rgba(140, 168, 176, 0.55)';
        context.fillText(String(index + 1).padStart(2, '0'), 48, y);
        context.fillStyle = index % 3 === 0 ? accent : '#d4e7ea';
        context.fillText(line, 108, y);
    });

    const cursorY = 150 + lines.length * 50;
    context.fillStyle = accent;
    context.globalAlpha = 0.85;
    context.fillRect(108, cursorY - 15, 14, 26);
    context.globalAlpha = 1;

    const texture = new three.CanvasTexture(display);
    texture.colorSpace = three.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
}

// Visage peint procéduralement : yeux (iris/pupille/reflet), sourcils, nez ombré,
// lèvres, pommettes et grain de peau. Appliqué en texture sur la tête sphérique.
function createFaceTexture(three, options) {
    const opts = options || {};
    const skinHex = opts.skinColor ?? 0xe8b492;
    const browHex = opts.brow ?? 0x2a1d15;
    const eyeHex = opts.eyes ?? 0x5b3a29;
    const lipHex = opts.lips ?? 0xc08476;
    const beard = Math.max(0, Math.min(1, opts.beard ?? 0));

    const toRGB = (hex) => ({ r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 });
    const mix = (c, t, a) => ({ r: c.r + (t.r - c.r) * a, g: c.g + (t.g - c.g) * a, b: c.b + (t.b - c.b) * a });
    const css = (c, a) => `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${a === undefined ? 1 : a})`;
    const BLACK = { r: 26, g: 16, b: 14 };
    const WHITE = { r: 255, g: 249, b: 242 };

    const skin = toRGB(skinHex);
    const skinLight = mix(skin, WHITE, 0.32);
    const skinShadow = mix(skin, BLACK, 0.30);
    const skinDeep = mix(skin, BLACK, 0.48);
    const brow = toRGB(browHex);
    const iris = toRGB(eyeHex);
    const irisLight = mix(iris, WHITE, 0.4);
    const irisDark = mix(iris, BLACK, 0.5);
    const lip = toRGB(lipHex);
    const lipDark = mix(lip, BLACK, 0.4);
    const lipLight = mix(lip, WHITE, 0.35);

    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const cx = size * 0.5;
    const eyeY = size * 0.44;
    const eyeDX = size * 0.08;
    const eyeRX = size * 0.05;
    const eyeRY = size * 0.028;
    const browY = size * 0.386;
    const noseTipY = size * 0.527;
    const mouthY = size * 0.601;
    const mw = size * 0.072;

    const soft = (x, y, rx, ry, color, alpha, blur, rot) => {
        ctx.save();
        if (blur) ctx.filter = `blur(${blur}px)`;
        ctx.globalAlpha = alpha === undefined ? 1 : alpha;
        ctx.fillStyle = css(color);
        ctx.beginPath();
        ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    };

    // Base peau
    ctx.fillStyle = css(skin);
    ctx.fillRect(0, 0, size, size);

    // Modelé doux du visage
    const form = ctx.createRadialGradient(cx, size * 0.47, size * 0.04, cx, size * 0.5, size * 0.4);
    form.addColorStop(0, css(skinLight, 0.5));
    form.addColorStop(0.55, css(skin, 0));
    form.addColorStop(1, css(skin, 0));
    ctx.fillStyle = form;
    ctx.fillRect(0, 0, size, size);

    // Ombres périphériques (tempes, mâchoire, menton)
    soft(cx - size * 0.20, size * 0.35, size * 0.10, size * 0.14, skinShadow, 0.22, 26);
    soft(cx + size * 0.20, size * 0.35, size * 0.10, size * 0.14, skinShadow, 0.22, 26);
    soft(cx - size * 0.175, size * 0.65, size * 0.075, size * 0.10, skinShadow, 0.24, 24);
    soft(cx + size * 0.175, size * 0.65, size * 0.075, size * 0.10, skinShadow, 0.24, 24);
    soft(cx, size * 0.74, size * 0.13, size * 0.045, skinDeep, 0.28, 20);
    // Lumière sur le front / les pommettes
    soft(cx, size * 0.34, size * 0.12, size * 0.06, skinLight, 0.18, 22);
    soft(cx - size * 0.105, size * 0.55, size * 0.07, size * 0.055, skinLight, 0.18, 20);
    soft(cx + size * 0.105, size * 0.55, size * 0.07, size * 0.055, skinLight, 0.18, 20);
    // Rougeur discrète des joues
    const blush = mix(skin, { r: 200, g: 92, b: 82 }, 0.4);
    soft(cx - size * 0.135, size * 0.555, size * 0.06, size * 0.04, blush, 0.12, 22);
    soft(cx + size * 0.135, size * 0.555, size * 0.06, size * 0.04, blush, 0.12, 22);

    // Sourcils
    const drawBrow = (dir) => {
        const bx = cx + dir * eyeDX;
        const hl = size * 0.062;
        const th = size * 0.017;
        ctx.save();
        ctx.filter = 'blur(1.6px)';
        ctx.fillStyle = css(brow, 0.92);
        ctx.beginPath();
        ctx.moveTo(bx - hl, browY + th * 0.25);
        ctx.quadraticCurveTo(bx, browY - th, bx + hl, browY + th * 0.05);
        ctx.quadraticCurveTo(bx, browY + th * 0.95, bx - hl, browY + th * 0.25);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    };
    drawBrow(-1);
    drawBrow(1);

    // Yeux
    const drawEye = (dir) => {
        const ex = cx + dir * eyeDX;
        const ey = eyeY;
        soft(ex, ey + size * 0.006, eyeRX * 1.45, eyeRY * 1.9, skinShadow, 0.26, 12);
        soft(ex, ey + size * 0.05, eyeRX * 0.95, size * 0.016, skinShadow, 0.14, 9);

        ctx.save();
        ctx.beginPath();
        ctx.ellipse(ex, ey, eyeRX, eyeRY, 0, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = css({ r: 243, g: 238, b: 232 });
        ctx.fillRect(ex - eyeRX, ey - eyeRY, eyeRX * 2, eyeRY * 2);
        ctx.filter = 'blur(5px)';
        ctx.fillStyle = css(mix(skin, BLACK, 0.25), 0.5);
        ctx.beginPath();
        ctx.ellipse(ex - dir * eyeRX * 0.85, ey, eyeRX * 0.55, eyeRY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.filter = 'none';

        const irisX = ex - dir * eyeRX * 0.05;
        const irisY = ey + eyeRY * 0.12;
        const ir = eyeRY * 1.0;
        const g = ctx.createRadialGradient(irisX - ir * 0.3, irisY - ir * 0.3, ir * 0.1, irisX, irisY, ir);
        g.addColorStop(0, css(irisLight));
        g.addColorStop(0.55, css(iris));
        g.addColorStop(1, css(irisDark));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(irisX, irisY, ir, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = css(irisDark, 0.75);
        ctx.lineWidth = size * 0.0028;
        ctx.beginPath();
        ctx.arc(irisX, irisY, ir, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = css(BLACK);
        ctx.beginPath();
        ctx.arc(irisX, irisY, ir * 0.44, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.beginPath();
        ctx.arc(irisX - ir * 0.34, irisY - ir * 0.4, ir * 0.17, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.arc(irisX + ir * 0.25, irisY + ir * 0.28, ir * 0.09, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Ligne de cils supérieure
        ctx.save();
        ctx.filter = 'blur(0.6px)';
        ctx.strokeStyle = css({ r: 32, g: 22, b: 20 }, 0.95);
        ctx.lineWidth = size * 0.0085;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ex - eyeRX * 1.06, ey - eyeRY * 0.05);
        ctx.quadraticCurveTo(ex, ey - eyeRY * 1.3, ex + eyeRX * 1.06, ey - eyeRY * 0.05);
        ctx.stroke();
        ctx.restore();

        // Pli de paupière + paupière inférieure
        soft(ex, ey - eyeRY * 1.55, eyeRX * 1.1, eyeRY * 0.4, skinShadow, 0.28, 5);
        ctx.save();
        ctx.filter = 'blur(0.8px)';
        ctx.strokeStyle = css(skinShadow, 0.5);
        ctx.lineWidth = size * 0.0035;
        ctx.beginPath();
        ctx.moveTo(ex - eyeRX * 0.85, ey + eyeRY * 0.95);
        ctx.quadraticCurveTo(ex, ey + eyeRY * 1.4, ex + eyeRX * 0.85, ey + eyeRY * 0.95);
        ctx.stroke();
        ctx.restore();
    };
    drawEye(-1);
    drawEye(1);

    // Nez
    soft(cx, (eyeY + noseTipY) / 2, size * 0.014, (noseTipY - eyeY) * 0.62, skinLight, 0.22, 7);
    soft(cx - size * 0.03, (eyeY + noseTipY) / 2 + size * 0.02, size * 0.017, (noseTipY - eyeY) * 0.5, skinShadow, 0.26, 8);
    soft(cx + size * 0.028, noseTipY - size * 0.03, size * 0.013, size * 0.05, skinShadow, 0.14, 8);
    soft(cx, noseTipY, size * 0.022, size * 0.017, skinLight, 0.26, 5);
    soft(cx, noseTipY + size * 0.02, size * 0.032, size * 0.011, skinShadow, 0.2, 6);
    soft(cx - size * 0.026, noseTipY + size * 0.011, size * 0.011, size * 0.008, skinDeep, 0.5, 3, -0.3);
    soft(cx + size * 0.026, noseTipY + size * 0.011, size * 0.011, size * 0.008, skinDeep, 0.5, 3, 0.3);

    // Lèvres
    soft(cx, mouthY - size * 0.028, size * 0.012, size * 0.012, skinShadow, 0.12, 5); // philtrum
    ctx.save();
    ctx.filter = 'blur(0.8px)';
    ctx.fillStyle = css(mix(lip, WHITE, 0.12));
    ctx.beginPath();
    ctx.moveTo(cx - mw * 0.92, mouthY);
    ctx.quadraticCurveTo(cx, mouthY + size * 0.034, cx + mw * 0.92, mouthY);
    ctx.quadraticCurveTo(cx, mouthY + size * 0.006, cx - mw * 0.92, mouthY);
    ctx.fill();
    ctx.fillStyle = css(lipDark);
    ctx.beginPath();
    ctx.moveTo(cx - mw, mouthY);
    ctx.quadraticCurveTo(cx - mw * 0.5, mouthY - size * 0.017, cx - size * 0.009, mouthY - size * 0.003);
    ctx.quadraticCurveTo(cx, mouthY - size * 0.013, cx + size * 0.009, mouthY - size * 0.003);
    ctx.quadraticCurveTo(cx + mw * 0.5, mouthY - size * 0.017, cx + mw, mouthY);
    ctx.quadraticCurveTo(cx, mouthY + size * 0.004, cx - mw, mouthY);
    ctx.fill();
    ctx.restore();
    ctx.save();
    ctx.strokeStyle = css(lipDark, 0.85);
    ctx.lineWidth = size * 0.0038;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - mw, mouthY);
    ctx.quadraticCurveTo(cx, mouthY + size * 0.006, cx + mw, mouthY);
    ctx.stroke();
    ctx.restore();
    soft(cx, mouthY + size * 0.016, mw * 0.55, size * 0.006, lipLight, 0.4, 4);
    soft(cx, mouthY + size * 0.03, mw * 0.8, size * 0.01, skinShadow, 0.18, 8);

    // Barbe / pilosité
    if (beard > 0) {
        ctx.save();
        ctx.fillStyle = css(mix(skin, brow, 0.72));
        const count = Math.floor(2600 * beard);
        for (let i = 0; i < count; i += 1) {
            const bx = cx + (Math.random() - 0.5) * size * 0.34;
            const by = size * 0.55 + Math.random() * size * 0.18;
            const dxn = (bx - cx) / (size * 0.185);
            const dyn = (by - size * 0.645) / (size * 0.115);
            if (dxn * dxn + dyn * dyn > 1) continue;
            if (Math.abs(bx - cx) < mw * 0.95 && by < mouthY + size * 0.02 && by > mouthY - size * 0.02) continue;
            ctx.globalAlpha = 0.3 + Math.random() * 0.4;
            ctx.beginPath();
            ctx.arc(bx, by, size * 0.0015 + Math.random() * size * 0.0016, 0, Math.PI * 2);
            ctx.fill();
        }
        const mcount = Math.floor(520 * beard);
        for (let i = 0; i < mcount; i += 1) {
            const bx = cx + (Math.random() - 0.5) * size * 0.095;
            const by = mouthY - size * 0.028 - Math.random() * size * 0.02;
            ctx.globalAlpha = 0.28 + Math.random() * 0.4;
            ctx.beginPath();
            ctx.arc(bx, by, size * 0.0015, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    // Grain de peau discret
    ctx.save();
    for (let i = 0; i < 1500; i += 1) {
        const nx = cx + (Math.random() - 0.5) * size * 0.4;
        const ny = size * 0.32 + Math.random() * size * 0.44;
        ctx.globalAlpha = 0.05;
        ctx.fillStyle = Math.random() > 0.5 ? css(skinLight) : css(skinShadow);
        ctx.fillRect(nx, ny, 1.6, 1.6);
    }
    ctx.restore();

    const texture = new three.CanvasTexture(canvas);
    texture.colorSpace = three.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
}

// Texture de cheveux : mèches fines qui coulent, utilisée en couleur + relief (bump).
function createHairTexture(three, colorHex) {
    const toRGB = (hex) => ({ r: (hex >> 16) & 255, g: (hex >> 8) & 255, b: hex & 255 });
    const mix = (c, t, a) => ({ r: c.r + (t.r - c.r) * a, g: c.g + (t.g - c.g) * a, b: c.b + (t.b - c.b) * a });
    const css = (c, a) => `rgba(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)}, ${a === undefined ? 1 : a})`;
    const base = toRGB(colorHex);
    const light = mix(base, { r: 255, g: 246, b: 232 }, 0.45);
    const midTone = mix(base, { r: 255, g: 240, b: 220 }, 0.18);
    const dark = mix(base, { r: 12, g: 8, b: 6 }, 0.55);

    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = css(base);
    ctx.fillRect(0, 0, size, size);

    // Touffes d'ombre douces pour la profondeur
    for (let i = 0; i < 60; i += 1) {
        ctx.save();
        ctx.filter = 'blur(6px)';
        ctx.globalAlpha = 0.22;
        ctx.fillStyle = Math.random() > 0.5 ? css(dark) : css(midTone);
        ctx.beginPath();
        ctx.ellipse(Math.random() * size, Math.random() * size, 12 + Math.random() * 40, 28 + Math.random() * 60, Math.random() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    // Mèches fines
    ctx.lineCap = 'round';
    for (let i = 0; i < 900; i += 1) {
        const x = Math.random() * size;
        const topY = Math.random() * size - size * 0.15;
        const len = size * (0.25 + Math.random() * 0.5);
        const sway = (Math.random() - 0.5) * 60;
        const shade = Math.random();
        ctx.strokeStyle = shade > 0.62 ? css(light, 0.22 + Math.random() * 0.35)
            : (shade < 0.32 ? css(dark, 0.22 + Math.random() * 0.4) : css(midTone, 0.18 + Math.random() * 0.25));
        ctx.lineWidth = 0.5 + Math.random() * 1.7;
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.bezierCurveTo(x + sway * 0.3, topY + len * 0.35, x + sway, topY + len * 0.7, x + sway * 0.55, topY + len);
        ctx.stroke();
    }

    const texture = new three.CanvasTexture(canvas);
    texture.wrapS = three.RepeatWrapping;
    texture.wrapT = three.RepeatWrapping;
    texture.repeat.set(2, 2);
    texture.colorSpace = three.SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
}

// Construit une chevelure : calotte de base + mèches (touffes) orientées selon le style.
// Masque alpha de mèches (cartes de cheveux) : vert clair = opaque, noir = transparent.
// Racine pleine en bas, pointes effilées et séparées en haut — évite l'aspect "cactus".
let __hairAlphaTexture = null;
function getHairAlphaTexture(three) {
    if (__hairAlphaTexture) return __hairAlphaTexture;
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, size, size);
    // Nappe de cheveux qui s'effile de la racine (bas) vers la pointe (haut)
    const sheet = ctx.createLinearGradient(0, size, 0, 0);
    sheet.addColorStop(0, 'rgba(255,255,255,1)');
    sheet.addColorStop(0.5, 'rgba(255,255,255,1)');
    sheet.addColorStop(0.82, 'rgba(255,255,255,0.82)');
    sheet.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = sheet;
    ctx.fillRect(0, 0, size, size);
    // Séparation en mèches : traits sombres, nuls à la racine, marqués vers la pointe
    ctx.lineCap = 'round';
    const gaps = 30;
    for (let i = 0; i <= gaps; i += 1) {
        const x = (i / gaps) * size + (Math.random() - 0.5) * 5;
        const g = ctx.createLinearGradient(0, size, 0, 0);
        g.addColorStop(0, 'rgba(0,0,0,0)');
        g.addColorStop(0.45, 'rgba(0,0,0,0.2)');
        g.addColorStop(1, 'rgba(0,0,0,1)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.2 + Math.random() * 3.4;
        const sway = (Math.random() - 0.5) * 24;
        ctx.beginPath();
        ctx.moveTo(x, size);
        ctx.bezierCurveTo(x + sway, size * 0.62, x - sway, size * 0.3, x + sway * 0.6, -6);
        ctx.stroke();
    }
    const tex = new three.CanvasTexture(canvas);
    tex.colorSpace = three.NoColorSpace;
    tex.anisotropy = 4;
    __hairAlphaTexture = tex;
    return tex;
}

// Chevelure realiste par "cartes de cheveux" : calotte + meches peignees vers le bas/la nuque.
function addHair(three, parent, capMat, hairStyle, phase, hairColorHex, hairTexture, hasCap) {
    const center = new three.Vector3(0, 2.66, 0.02);
    const R = 0.30;

    let seed = Math.floor((Math.abs(phase) + 1) * 1471) % 9973 + 13;
    const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

    // Calotte de base (cuir chevelu dense, jamais de trou)
    const mass = new three.Mesh(new three.SphereGeometry(0.32, 28, 22), capMat);
    mass.position.set(center.x, 2.63, 0.02);

    let baseLen = 0.18;
    let baseWidth = 0.12;
    let curly = false;
    let backSweep = 0.34;
    if (hairStyle === 'quiff') { mass.scale.set(1.05, 1.03, 1.07); baseLen = 0.2; baseWidth = 0.12; }
    else if (hairStyle === 'curly') { mass.scale.set(1.08, 1.06, 1.1); baseLen = 0.16; baseWidth = 0.14; curly = true; backSweep = 0.26; }
    else if (hairStyle === 'ponytail') { mass.scale.set(1.05, 1.05, 1.12); baseLen = 0.17; baseWidth = 0.11; backSweep = 0.5; }
    else { mass.scale.set(1.05, 1.02, 1.07); baseLen = 0.18; baseWidth = 0.12; }
    if (hasCap) { mass.scale.multiplyScalar(0.88); mass.position.set(center.x, 2.58, 0.02); }
    parent.add(mass);

    const positions = [];
    const uvs = [];
    const indices = [];
    const down = new three.Vector3(0, -1, 0);

    const emitLock = (root, dir, length, width) => {
        const t = dir.clone().normalize();
        const outward = root.clone().sub(center);
        if (outward.lengthSq() < 1e-6) outward.set(0, 1, 0);
        outward.normalize();
        const p0 = root.clone();
        const p1 = root.clone().addScaledVector(t, length * 0.34);
        const p2 = root.clone().addScaledVector(t, length * 0.68).addScaledVector(down, length * 0.1);
        const p3 = root.clone().addScaledVector(t, length * 1.0).addScaledVector(down, length * 0.24);
        if (curly) {
            const s = new three.Vector3().crossVectors(t, outward).normalize();
            p1.addScaledVector(s, length * 0.18);
            p2.addScaledVector(s, -length * 0.2).addScaledVector(outward, length * 0.1);
            p3.addScaledVector(s, length * 0.16);
        }
        const curve = new three.CatmullRomCurve3([p0, p1, p2, p3]);
        const N = 7;
        const base = positions.length / 3;
        for (let i = 0; i <= N; i += 1) {
            const f = i / N;
            const P = curve.getPoint(f);
            const T = curve.getTangent(f);
            let side = new three.Vector3().crossVectors(T, outward);
            if (side.lengthSq() < 1e-5) side.set(1, 0, 0);
            side.normalize().multiplyScalar(width * (1 - 0.7 * f) * 0.5);
            positions.push(P.x - side.x, P.y - side.y, P.z - side.z, P.x + side.x, P.y + side.y, P.z + side.z);
            uvs.push(0, f, 1, f);
        }
        for (let i = 0; i < N; i += 1) {
            const a = base + i * 2, b = base + i * 2 + 1, c = base + i * 2 + 2, d = base + i * 2 + 3;
            indices.push(a, b, d, a, d, c);
        }
    };

    const rings = [14, 26, 38, 50, 62, 74, 86, 96];
    rings.forEach((deg, ri) => {
        const th = deg * Math.PI / 180;
        const st = Math.sin(th), ct = Math.cos(th);
        const per = ri < 1 ? 6 : (ri < 3 ? 12 : 16);
        for (let k = 0; k < per; k += 1) {
            const phi = (k / per) * Math.PI * 2 + ri * 0.6 + rnd() * 0.35;
            const ox = st * Math.cos(phi), oz = st * Math.sin(phi), oy = ct;
            const root = new three.Vector3(center.x + ox * R, center.y + oy * R, center.z + oz * R);
            const isFront = oz < -0.05;
            if (isFront && root.y < 2.74) continue;      // degage le front
            if (oz < -0.30 && root.y < 2.92) continue;   // rien sur le visage
            if (hasCap && oy > 0.34) continue;           // sous la casquette : cotes + nuque seulement
            const flow = new three.Vector3(ox * 0.26, oy * 0.26, oz * 0.26);
            flow.y -= 1.0;                               // peigne vers le bas
            flow.z += backSweep;                         // balaye vers la nuque
            if (hairStyle === 'quiff' && isFront) { flow.y += 1.5; flow.z -= 0.7; }
            else if (isFront) { flow.y += 0.3; }
            flow.normalize();
            let len = baseLen * (0.72 + rnd() * 0.6);
            if (oz > 0.05) len *= 1.25;                  // plus long dans le dos (nuque)
            if (ri >= 5) len *= 1.25;                    // plus long en bas
            if (isFront && hairStyle !== 'quiff') len = Math.min(len, 0.11);
            emitLock(root, flow, len, baseWidth * (0.85 + rnd() * 0.35));
        }
    });

    // Queue-de-cheval : elastique + longues meches qui retombent dans le dos
    if (hairStyle === 'ponytail') {
        const tie = new three.Mesh(new three.SphereGeometry(0.1, 12, 10), capMat);
        tie.position.set(0, 2.6, 0.34);
        parent.add(tie);
        for (let i = 0; i < 16; i += 1) {
            const ox = (rnd() - 0.5) * 0.22;
            const root = new three.Vector3(ox, 2.58 + (rnd() - 0.5) * 0.06, 0.35 + rnd() * 0.04);
            const dir = new three.Vector3(ox * 0.6, -0.5, 1).normalize();
            emitLock(root, dir, 0.52 + rnd() * 0.2, 0.09);
        }
    }

    const geo = new three.BufferGeometry();
    geo.setAttribute('position', new three.Float32BufferAttribute(positions, 3));
    geo.setAttribute('uv', new three.Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const lockMat = new three.MeshStandardMaterial({
        color: 0xffffff,
        map: hairTexture,
        alphaMap: getHairAlphaTexture(three),
        alphaTest: 0.5,
        side: three.DoubleSide,
        roughness: 0.9,
        metalness: 0.05,
        envMapIntensity: 0.4
    });
    parent.add(new three.Mesh(geo, lockMat));
}

// Casquette baseball (vue de dos : calotte + bandeau + fermoir), posee par-dessus la chevelure.
function addCap(three, parent, colorHex) {
    const col = (typeof colorHex === 'number') ? colorHex : 0x243447;
    const capMat = new three.MeshStandardMaterial({ color: col, metalness: 0.05, roughness: 0.72, envMapIntensity: 0.5 });
    const darkMat = new three.MeshStandardMaterial({ color: 0x0e1620, metalness: 0.1, roughness: 0.6, envMapIntensity: 0.5 });
    const crown = new three.Mesh(new three.SphereGeometry(0.35, 30, 20, 0, Math.PI * 2, 0, Math.PI * 0.6), capMat);
    crown.position.set(0, 2.575, -0.01);
    crown.scale.set(1.03, 0.94, 1.06);
    parent.add(crown);
    const btn = new three.Mesh(new three.SphereGeometry(0.03, 10, 8), capMat);
    btn.position.set(0, 2.9, -0.01);
    parent.add(btn);
    // Bandeau de base (contraste)
    const band = new three.Mesh(new three.TorusGeometry(0.335, 0.028, 10, 30), darkMat);
    band.position.set(0, 2.5, -0.01);
    band.rotation.x = Math.PI / 2;
    band.scale.set(1.02, 1.05, 1);
    parent.add(band);
    // Visiere avant
    const bill = new three.Mesh(new three.BoxGeometry(0.42, 0.045, 0.26), capMat);
    bill.position.set(0, 2.5, -0.4);
    bill.rotation.x = 0.16;
    parent.add(bill);
    // Fermoir arriere (visible de dos)
    addBox(three, parent, { x: 0.14, y: 0.09, z: 0.04 }, { x: 0, y: 2.52, z: 0.31 }, capMat);
    addBox(three, parent, { x: 0.05, y: 0.05, z: 0.03 }, { x: 0, y: 2.52, z: 0.34 }, darkMat);
}

function createMoonTexture(three, accent, variant) {
    const display = document.createElement('canvas');
    display.width = 1024;
    display.height = 720;
    const context = display.getContext('2d');
    const background = context.createLinearGradient(0, 0, 0, display.height);
    background.addColorStop(0, '#020914');
    background.addColorStop(0.58, '#01040a');
    background.addColorStop(1, '#000104');
    context.fillStyle = background;
    context.fillRect(0, 0, display.width, display.height);

    for (let index = 0; index < 190; index += 1) {
        const x = Math.abs(Math.sin(index * 17.1 + variant * 1.9)) * display.width;
        const y = Math.abs(Math.sin(index * 31.4 + variant * 2.7)) * display.height;
        context.fillStyle = index % 13 === 0 ? accent : '#e7f5ff';
        context.beginPath();
        context.arc(x, y, 0.3 + (index % 5) * 0.22, 0, Math.PI * 2);
        context.fill();
    }

    const moonX = 650 + (variant - 2) * 26;
    const moonY = 470 - variant * 16;
    const moonRadius = 306;
    const glow = context.createRadialGradient(moonX, moonY, moonRadius * 0.82, moonX, moonY, moonRadius * 1.16);
    glow.addColorStop(0, 'rgba(210, 224, 240, 0)');
    glow.addColorStop(0.72, 'rgba(194, 215, 235, 0.13)');
    glow.addColorStop(1, 'rgba(175, 205, 235, 0)');
    context.fillStyle = glow;
    context.beginPath();
    context.arc(moonX, moonY, moonRadius * 1.2, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.beginPath();
    context.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    context.clip();

    const lunarSurface = context.createRadialGradient(moonX - 108, moonY - 132, 14, moonX, moonY, moonRadius);
    lunarSurface.addColorStop(0, '#eef0ec');
    lunarSurface.addColorStop(0.35, '#b9b8b2');
    lunarSurface.addColorStop(0.72, '#72767a');
    lunarSurface.addColorStop(1, '#373c44');
    context.fillStyle = lunarSurface;
    context.beginPath();
    context.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    context.fill();

    for (let crater = 0; crater < 54; crater += 1) {
        const angle = crater * 2.399 + variant * 0.61;
        const distance = (0.1 + ((crater * 19) % 85) / 100) * moonRadius;
        const radius = 5 + ((crater * 13) % 28);
        const x = moonX + Math.cos(angle) * distance;
        const y = moonY + Math.sin(angle) * distance;
        context.fillStyle = crater % 3 === 0 ? 'rgba(47, 51, 58, 0.6)' : 'rgba(96, 98, 99, 0.36)';
        context.beginPath();
        context.ellipse(x, y, radius, radius * 0.72, angle * 0.28, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = 'rgba(244, 246, 240, 0.28)';
        context.lineWidth = 2;
        context.stroke();
    }

    context.fillStyle = 'rgba(206, 207, 197, 0.12)';
    for (let ridge = 0; ridge < 18; ridge += 1) {
        context.beginPath();
        context.arc(moonX - 190 + ridge * 23, moonY + 64 - ridge * 12, 54 + ridge * 4, 3.1, 4.4);
        context.fill();
    }

    const terminator = context.createLinearGradient(moonX - moonRadius * 0.12, moonY, moonX + moonRadius, moonY);
    terminator.addColorStop(0, 'rgba(0, 0, 0, 0)');
    terminator.addColorStop(0.48, 'rgba(9, 11, 16, 0.18)');
    terminator.addColorStop(1, 'rgba(0, 2, 7, 0.92)');
    context.fillStyle = terminator;
    context.beginPath();
    context.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
    context.fill();
    context.restore();

    const texture = new three.CanvasTexture(display);
    texture.colorSpace = three.SRGBColorSpace;
    return texture;
}

function createDoorWall(three, room, materials, roomWidth, z, accent) {
    const opening = 3.4;
    const sideWidth = Math.max((roomWidth - opening) / 2, 0.8);
    const accentMaterial = new three.MeshBasicMaterial({ color: accent });
    addBox(three, room, { x: sideWidth, y: 4.8, z: 0.3 }, { x: -(opening + sideWidth) / 2, y: 2.4, z }, materials.wall);
    addBox(three, room, { x: sideWidth, y: 4.8, z: 0.3 }, { x: (opening + sideWidth) / 2, y: 2.4, z }, materials.wall);
    addBox(three, room, { x: roomWidth, y: 1.5, z: 0.3 }, { x: 0, y: 5.55, z }, materials.wall);
    addBox(three, room, { x: 0.38, y: 4.7, z: 0.38 }, { x: -opening / 2, y: 2.35, z: z - 0.04 }, materials.structure);
    addBox(three, room, { x: 0.38, y: 4.7, z: 0.38 }, { x: opening / 2, y: 2.35, z: z - 0.04 }, materials.structure);
    addBox(three, room, { x: opening + 0.46, y: 0.34, z: 0.38 }, { x: 0, y: 4.58, z: z - 0.04 }, materials.structure);
    addBox(three, room, { x: 2.2, y: 0.1, z: 0.11 }, { x: 0, y: 5.04, z: z - 0.22 }, accentMaterial);
}

function addPorthole(three, room, materials, config) {
    const moonTexture = createMoonTexture(three, config.accent, config.variant);
    const moon = new three.Mesh(new three.CircleGeometry(config.radius, 48), new three.MeshBasicMaterial({ map: moonTexture, side: three.DoubleSide }));
    moon.position.set(config.x, config.y, config.z + 0.16);
    room.add(moon);
    const frame = new three.Mesh(new three.TorusGeometry(config.radius + 0.16, 0.1, 8, 48), materials.structure);
    frame.position.set(config.x, config.y, config.z + 0.22);
    room.add(frame);
    for (let index = 0; index < 8; index += 1) {
        const angle = (index / 8) * Math.PI * 2;
        const bolt = new three.Mesh(new three.SphereGeometry(0.055, 8, 6), materials.joint);
        bolt.position.set(config.x + Math.cos(angle) * (config.radius + 0.29), config.y + Math.sin(angle) * (config.radius + 0.29), config.z + 0.27);
        room.add(bolt);
    }
}

function createRoom(three, station, materials, config) {
    const room = new three.Group();
    const width = config.type === 'observatory' ? 16 : 13;
    const depth = 12;
    const halfWidth = width / 2;
    const halfDepth = depth / 2;
    const accentMaterial = new three.MeshBasicMaterial({ color: config.accent });

    room.position.set(config.x, 0, config.z);
    room.rotation.y = config.rotation;
    station.add(room);

    addBox(three, room, { x: width, y: 0.2, z: depth }, { x: 0, y: -0.1, z: 0 }, materials.floor);
    addBox(three, room, { x: width, y: 0.16, z: depth }, { x: 0, y: 6.26, z: 0 }, materials.panel);
    addBox(three, room, { x: 0.3, y: 6.25, z: depth }, { x: -halfWidth, y: 3.12, z: 0 }, materials.wall);
    addBox(three, room, { x: 0.3, y: 6.25, z: depth }, { x: halfWidth, y: 3.12, z: 0 }, materials.wall);
    createDoorWall(three, room, materials, width, halfDepth, config.accent);

    if (config.rearDoor) {
        createDoorWall(three, room, materials, width, -halfDepth, config.accent);
        addPorthole(three, room, materials, { x: -4.15, y: 3.3, z: -halfDepth, radius: 1.02, accent: config.accent, variant: config.earthVariant });
        addPorthole(three, room, materials, { x: 4.15, y: 3.3, z: -halfDepth, radius: 1.02, accent: config.accent, variant: config.earthVariant + 1 });
    } else {
        addBox(three, room, { x: width, y: 6.25, z: 0.3 }, { x: 0, y: 3.12, z: -halfDepth }, materials.wall);
        addPorthole(three, room, materials, { x: 0, y: 3.3, z: -halfDepth, radius: config.type === 'observatory' ? 2.2 : 1.65, accent: config.accent, variant: config.earthVariant });
    }

    [-2.8, 0, 2.8].forEach(z => {
        addBox(three, room, { x: 0.08, y: 1.4, z: 1.65 }, { x: -halfWidth + 0.18, y: 3.2, z }, materials.panel);
        addBox(three, room, { x: 0.08, y: 1.4, z: 1.65 }, { x: halfWidth - 0.18, y: 3.2, z }, materials.panel);
        addBox(three, room, { x: width - 1.3, y: 0.045, z: 0.1 }, { x: 0, y: 5.78, z }, accentMaterial);
    });
    addBox(three, room, { x: 0.18, y: 0.04, z: depth - 1.2 }, { x: -2.25, y: 0.08, z: 0 }, accentMaterial);
    addBox(three, room, { x: 0.18, y: 0.04, z: depth - 1.2 }, { x: 2.25, y: 0.08, z: 0 }, accentMaterial);

    addRoomFurniture(three, room, materials, config);
    addRoomHeader(three, room, materials, config, halfDepth);

    const keyLight = new three.PointLight(0xfff4e6, 3.4, 13, 2);
    keyLight.position.set(0, 4.7, 1.5);
    room.add(keyLight);
    const fillLight = new three.PointLight(0xe8eef5, 1.9, 12, 2);
    fillLight.position.set(-3.2, 3.5, -1.5);
    room.add(fillLight);
    const accentLight = new three.PointLight(config.accent, 1.1, 9, 2);
    accentLight.position.set(0, 4.3, -3.0);
    room.add(accentLight);
    return room;
}

function addRoomFurniture(three, room, materials, config) {
    const accentMaterial = new three.MeshBasicMaterial({ color: config.accent });
    if (config.type === 'backend') {
        addBox(three, room, { x: 2.8, y: 0.58, z: 0.72 }, { x: 3.9, y: 0.42, z: 1.5 }, materials.furniture);
        addBox(three, room, { x: 2.8, y: 0.58, z: 0.72 }, { x: 3.9, y: 0.42, z: 0.1 }, materials.furniture);
        addBox(three, room, { x: 1.1, y: 2.5, z: 0.66 }, { x: 4.3, y: 1.25, z: -2.15 }, materials.furniture);
        return;
    }
    if (config.type === 'data') {
        addCylinder(three, room, 1.4, 1.4, 0.16, { x: -3.4, y: 1.08, z: -1.5 }, materials.furniture);
        addCylinder(three, room, 0.3, 0.48, 1.12, { x: -3.4, y: 0.5, z: -1.5 }, materials.structure);
        addBox(three, room, { x: 0.9, y: 0.08, z: 0.9 }, { x: -3.4, y: 1.2, z: -1.5 }, accentMaterial);
        for (let index = 0; index < 4; index += 1) {
            const height = 0.85 + index * 0.22;
            addBox(three, room, { x: 0.36, y: height, z: 0.36 }, { x: -4.85 + index * 0.55, y: 0.42 + height / 2, z: 2.2 }, accentMaterial);
        }
        return;
    }
    if (config.type === 'ai') {
        const core = new three.Mesh(new three.IcosahedronGeometry(0.78, 1), new three.MeshBasicMaterial({ color: config.accent, wireframe: true, transparent: true, opacity: 0.84 }));
        core.position.set(3.5, 2.2, -1.5);
        room.add(core);
        addBox(three, room, { x: 2.9, y: 0.18, z: 1.2 }, { x: 3.5, y: 1.05, z: -1.5 }, materials.furniture);
        addBox(three, room, { x: 0.18, y: 1.0, z: 0.18 }, { x: 2.45, y: 0.5, z: -1.5 }, materials.structure);
        addBox(three, room, { x: 0.18, y: 1.0, z: 0.18 }, { x: 4.55, y: 0.5, z: -1.5 }, materials.structure);
        return;
    }
    if (config.type === 'cloud') {
        addBox(three, room, { x: 2.8, y: 3.8, z: 0.76 }, { x: -3.85, y: 1.9, z: -0.5 }, materials.furniture);
        for (let unit = 0; unit < 8; unit += 1) {
            addBox(three, room, { x: 2.35, y: 0.07, z: 0.05 }, { x: -3.85, y: 0.42 + unit * 0.42, z: -0.08 }, unit % 2 ? accentMaterial : materials.dark);
        }
        addBox(three, room, { x: 2.2, y: 0.18, z: 1.25 }, { x: 3.55, y: 1.05, z: -1.55 }, materials.furniture);
        return;
    }
    if (config.type === 'observatory') {
        addBox(three, room, { x: 5.6, y: 0.22, z: 1.4 }, { x: 0, y: 1.1, z: 0.9 }, materials.furniture);
        addBox(three, room, { x: 0.25, y: 1.0, z: 0.25 }, { x: -2.2, y: 0.5, z: 0.9 }, materials.structure);
        addBox(three, room, { x: 0.25, y: 1.0, z: 0.25 }, { x: 2.2, y: 0.5, z: 0.9 }, materials.structure);
    }
}

function addRoomHeader(three, room, materials, config, halfDepth) {
    const texture = createScreenTexture(three, config.title, ['FOCUS ACTIF', 'SYSTEMES EN LIGNE'], config.accent);
    const backing = new three.Mesh(new three.PlaneGeometry(2.9, 0.98), materials.dark);
    backing.position.set(0, 5.15, -halfDepth + 0.17);
    room.add(backing);
    const display = new three.Mesh(new three.PlaneGeometry(2.7, 0.84), new three.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.96 }));
    display.position.set(0, 5.15, -halfDepth + 0.2);
    room.add(display);
}

function createKeyboard(three, parent, materials, position, accent) {
    const keyboard = new three.Group();
    keyboard.position.set(position.x, position.y, position.z);
    parent.add(keyboard);
    addBox(three, keyboard, { x: 1.18, y: 0.06, z: 0.44 }, { x: 0, y: 0, z: 0 }, materials.dark);
    const keyMaterial = new three.MeshBasicMaterial({ color: accent });
    for (let row = 0; row < 4; row += 1) {
        for (let column = 0; column < 9; column += 1) {
            addBox(three, keyboard, { x: 0.085, y: 0.025, z: 0.06 }, { x: -0.43 + column * 0.108, y: 0.045, z: -0.12 + row * 0.08 }, (row + column) % 5 === 0 ? keyMaterial : materials.panel);
        }
    }
}

function createSeatedAstronaut(three, accent, suitColor, phase, action, style) {
    const look = style || {};
    const hairStyle = look.hairStyle || 'short';
    const garment = look.garment || 'plain';
    const astronaut = new three.Group();
    const accentMaterial = new three.MeshStandardMaterial({ color: accent, emissive: accent, emissiveIntensity: 0.35, metalness: 0.2, roughness: 0.5 });
    const shirt = new three.MeshStandardMaterial({ color: suitColor, metalness: 0.06, roughness: 0.6, envMapIntensity: 0.85 });
    const trousers = new three.MeshStandardMaterial({ color: 0x1a2a3a, metalness: 0.08, roughness: 0.68, envMapIntensity: 0.7 });
    const skinColor = look.skinColor ?? 0xe8b492;
    const skin = new three.MeshStandardMaterial({ color: skinColor, metalness: 0, roughness: 0.55, envMapIntensity: 0.45 });
    const hairColorHex = look.hairColor ?? 0x2a1d15;
    const hairTexture = createHairTexture(three, hairColorHex);
    const hair = new three.MeshStandardMaterial({ color: 0xffffff, map: hairTexture, bumpMap: hairTexture, bumpScale: 0.02, metalness: 0.12, roughness: 0.82, envMapIntensity: 0.55 });
    const shoe = new three.MeshStandardMaterial({ color: 0x0d141a, metalness: 0.25, roughness: 0.52, envMapIntensity: 0.6 });
    const chairMat = new three.MeshStandardMaterial({ color: 0x101922, metalness: 0.55, roughness: 0.42, envMapIntensity: 0.95 });

    // Chaise ergonomique
    addBox(three, astronaut, { x: 0.9, y: 0.18, z: 0.82 }, { x: 0, y: 0.9, z: 0.12 }, chairMat);
    const backrest = new three.Mesh(new three.BoxGeometry(0.84, 0.98, 0.14), chairMat);
    backrest.position.set(0, 1.47, 0.5);
    backrest.rotation.x = 0.14;
    astronaut.add(backrest);
    addCylinder(three, astronaut, 0.07, 0.07, 0.6, { x: 0, y: 0.56, z: 0.12 }, chairMat);
    addCylinder(three, astronaut, 0.34, 0.44, 0.09, { x: 0, y: 0.22, z: 0.12 }, chairMat);

    // Torse et bassin
    const torso = new three.Mesh(new three.CapsuleGeometry(0.34, 0.72, 6, 16), shirt);
    torso.position.set(0, 1.58, 0.04);
    astronaut.add(torso);
    addBox(three, astronaut, { x: 0.58, y: 0.24, z: 0.42 }, { x: 0, y: 1.16, z: -0.04 }, trousers);

    // Jambes assises
    const leftThigh = new three.Mesh(new three.CapsuleGeometry(0.15, 0.46, 5, 12), trousers);
    leftThigh.position.set(-0.22, 0.9, -0.2);
    leftThigh.rotation.x = Math.PI / 2;
    astronaut.add(leftThigh);
    const rightThigh = new three.Mesh(new three.CapsuleGeometry(0.15, 0.46, 5, 12), trousers);
    rightThigh.position.set(0.22, 0.9, -0.2);
    rightThigh.rotation.x = Math.PI / 2;
    astronaut.add(rightThigh);
    const leftShin = new three.Mesh(new three.CapsuleGeometry(0.12, 0.42, 5, 12), trousers);
    leftShin.position.set(-0.22, 0.6, -0.5);
    astronaut.add(leftShin);
    const rightShin = new three.Mesh(new three.CapsuleGeometry(0.12, 0.42, 5, 12), trousers);
    rightShin.position.set(0.22, 0.6, -0.5);
    astronaut.add(rightShin);
    addBox(three, astronaut, { x: 0.22, y: 0.13, z: 0.44 }, { x: -0.22, y: 0.4, z: -0.66 }, shoe);
    addBox(three, astronaut, { x: 0.22, y: 0.13, z: 0.44 }, { x: 0.22, y: 0.4, z: -0.66 }, shoe);

    // Epaules
    const leftShoulder = new three.Mesh(new three.SphereGeometry(0.18, 14, 12), shirt);
    leftShoulder.position.set(-0.4, 1.95, 0.02);
    astronaut.add(leftShoulder);
    const rightShoulder = new three.Mesh(new three.SphereGeometry(0.18, 14, 12), shirt);
    rightShoulder.position.set(0.4, 1.95, 0.02);
    astronaut.add(rightShoulder);

    // Chemise : empiecement d'epaules + col (bien visible de dos, au-dessus du dossier)
    const yoke = new three.Mesh(new three.CapsuleGeometry(0.2, 0.52, 5, 14), shirt);
    yoke.position.set(0, 2.0, 0.04);
    yoke.rotation.z = Math.PI / 2;
    yoke.scale.set(1, 1, 0.72);
    astronaut.add(yoke);
    const collar = new three.Mesh(new three.TorusGeometry(0.15, 0.05, 10, 24), shirt);
    collar.position.set(0, 2.14, 0);
    collar.rotation.x = Math.PI / 2;
    collar.scale.set(1, 0.9, 1);
    astronaut.add(collar);
    addBox(three, astronaut, { x: 0.24, y: 0.09, z: 0.05 }, { x: 0, y: 2.2, z: 0.08 }, shirt);

    // Cou et tete
    const neck = new three.Mesh(new three.CylinderGeometry(0.11, 0.14, 0.22, 12), skin);
    neck.position.set(0, 2.24, -0.02);
    astronaut.add(neck);
    // Tete vue de dos : aucun visage necessaire (couverte par la chevelure)
    const head = new three.Mesh(new three.SphereGeometry(0.31, 32, 24), skin);
    head.position.set(0, 2.54, -0.05);
    head.scale.set(0.98, 1.06, 1.0);
    astronaut.add(head);
    [-0.3, 0.3].forEach(side => {
        const ear = new three.Mesh(new three.SphereGeometry(0.055, 8, 8), skin);
        ear.position.set(side, 2.5, -0.03);
        ear.scale.set(0.6, 1, 1);
        astronaut.add(ear);
    });

    // --- Chevelure : calotte texturee + cartes de meches pour un rendu naturel ---
    addHair(three, astronaut, hair, hairStyle, phase, hairColorHex, hairTexture, !!look.cap);
    if (look.cap) addCap(three, astronaut, look.cap);

    // --- Vetement distinctif ---
    if (garment === 'hoodie') {
        const hood = new three.Mesh(new three.SphereGeometry(0.28, 18, 14, 0, Math.PI * 2, 0, Math.PI / 1.7), shirt);
        hood.position.set(0, 2.16, 0.14);
        hood.rotation.x = -0.6;
        hood.scale.set(1.05, 1, 0.8);
        astronaut.add(hood);
        addBox(three, astronaut, { x: 0.05, y: 0.34, z: 0.04 }, { x: -0.1, y: 1.82, z: -0.32 }, accentMaterial);
        addBox(three, astronaut, { x: 0.05, y: 0.34, z: 0.04 }, { x: 0.1, y: 1.82, z: -0.32 }, accentMaterial);
    } else if (garment === 'collar') {
        addBox(three, astronaut, { x: 0.17, y: 0.22, z: 0.06 }, { x: -0.14, y: 1.99, z: -0.31 }, shirt, 0.32);
        addBox(three, astronaut, { x: 0.17, y: 0.22, z: 0.06 }, { x: 0.14, y: 1.99, z: -0.31 }, shirt, -0.32);
    } else if (garment === 'zip') {
        addBox(three, astronaut, { x: 0.05, y: 0.68, z: 0.04 }, { x: 0, y: 1.6, z: -0.33 }, accentMaterial);
        addBox(three, astronaut, { x: 0.3, y: 0.14, z: 0.05 }, { x: 0, y: 1.98, z: -0.31 }, shirt);
    }

    const leftArm = new three.Group();
    leftArm.position.set(-0.42, 1.92, 0);
    const leftSleeve = new three.Mesh(new three.CapsuleGeometry(0.13, 0.2, 4, 10), shirt);
    leftSleeve.position.set(0, -0.18, -0.07);
    leftArm.add(leftSleeve);
    const leftForearm = new three.Mesh(new three.CapsuleGeometry(0.1, 0.24, 4, 10), skin);
    leftForearm.position.set(0, -0.48, -0.18);
    leftArm.add(leftForearm);
    const leftGlove = new three.Mesh(new three.SphereGeometry(0.13, 10, 8), skin);
    leftGlove.position.set(0, -0.68, -0.29);
    leftArm.add(leftGlove);
    for (let finger = 0; finger < 3; finger += 1) {
        const digit = new three.Mesh(new three.CapsuleGeometry(0.024, 0.1, 3, 6), skin);
        digit.position.set(-0.055 + finger * 0.055, -0.8, -0.39);
        digit.rotation.x = -0.45;
        leftArm.add(digit);
    }
    astronaut.add(leftArm);

    const rightArm = new three.Group();
    rightArm.position.set(0.42, 1.92, 0);
    const rightSleeve = new three.Mesh(new three.CapsuleGeometry(0.13, 0.2, 4, 10), shirt);
    rightSleeve.position.set(0, -0.18, -0.07);
    rightArm.add(rightSleeve);
    const rightForearm = new three.Mesh(new three.CapsuleGeometry(0.1, 0.24, 4, 10), skin);
    rightForearm.position.set(0, -0.48, -0.18);
    rightArm.add(rightForearm);
    const rightGlove = new three.Mesh(new three.SphereGeometry(0.13, 10, 8), skin);
    rightGlove.position.set(0, -0.68, -0.29);
    rightArm.add(rightGlove);
    for (let finger = 0; finger < 3; finger += 1) {
        const digit = new three.Mesh(new three.CapsuleGeometry(0.024, 0.1, 3, 6), skin);
        digit.position.set(-0.055 + finger * 0.055, -0.8, -0.39);
        digit.rotation.x = -0.45;
        rightArm.add(digit);
    }
    astronaut.add(rightArm);

    const motions = {
        typing: { leftBase: 1.15, rightBase: 1.12, leftSpeed: 5.4, rightSpeed: 5.1, leftRange: 0.14, rightRange: 0.13, leftTilt: 0.34, rightTilt: -0.34 },
        analysis: { leftBase: 0.94, rightBase: 1.3, leftSpeed: 1.35, rightSpeed: 3.1, leftRange: 0.06, rightRange: 0.1, leftTilt: 0.26, rightTilt: -0.38 },
        inference: { leftBase: 0.8, rightBase: 1.18, leftSpeed: 2.1, rightSpeed: 1.6, leftRange: 0.09, rightRange: 0.06, leftTilt: 0.42, rightTilt: -0.18 },
        deploy: { leftBase: 1.06, rightBase: 0.86, leftSpeed: 2.5, rightSpeed: 3.7, leftRange: 0.08, rightRange: 0.12, leftTilt: 0.22, rightTilt: -0.44 }
    };
    const motion = motions[action] || motions.typing;
    leftArm.rotation.set(motion.leftBase, 0, motion.leftTilt);
    rightArm.rotation.set(motion.rightBase, 0, motion.rightTilt);
    astronaut.rotation.y = -0.2;
    astronaut.scale.setScalar(1.0);
    return { developer: astronaut, leftArm, rightArm, phase, motion };
}

function createWorkstation(three, room, materials, config, animatedOperators, animatedDisplays) {
    const bay = new three.Group();
    room.add(bay);
    bay.position.set(0, 0, 0.85);
    const accentMaterial = new three.MeshBasicMaterial({ color: config.accent });
    const screenTexture = createScreenTexture(three, config.title, config.lines, config.accent);
    const screenMaterial = new three.MeshBasicMaterial({
        map: screenTexture,
        toneMapped: false
    });

    addBox(three, bay, { x: 4.15, y: 0.2, z: 1.18 }, { x: 0, y: 1.42, z: 0 }, materials.furniture);
    addBox(three, bay, { x: 0.18, y: 1.38, z: 0.18 }, { x: -1.72, y: 0.69, z: 0 }, materials.structure);
    addBox(three, bay, { x: 0.18, y: 1.38, z: 0.18 }, { x: 1.72, y: 0.69, z: 0 }, materials.structure);
    // Moniteur pose sur le bureau, a hauteur naturelle
    addBox(three, bay, { x: 0.56, y: 0.06, z: 0.3 }, { x: -0.2, y: 1.55, z: -0.16 }, materials.dark);
    addBox(three, bay, { x: 0.16, y: 0.62, z: 0.12 }, { x: -0.2, y: 1.85, z: -0.28 }, materials.structure);
    addBox(three, bay, { x: 2.5, y: 1.44, z: 0.12 }, { x: -0.2, y: 2.7, z: -0.32 }, materials.dark);
    const screen = new three.Mesh(new three.PlaneGeometry(2.36, 1.3), screenMaterial);
    screen.position.set(-0.2, 2.7, -0.25);
    bay.add(screen);
    createKeyboard(three, bay, materials, { x: -0.05, y: 1.55, z: 0.34 }, config.accent);
    // Accessoires de bureau (poste coherent et vivant)
    const mug = new three.Mesh(new three.CylinderGeometry(0.09, 0.08, 0.18, 14), materials.structure);
    mug.position.set(1.4, 1.63, 0.14);
    bay.add(mug);
    addBox(three, bay, { x: 0.42, y: 0.03, z: 0.3 }, { x: -1.25, y: 1.54, z: 0.3 }, materials.panel);
    const pot = new three.Mesh(new three.CylinderGeometry(0.11, 0.09, 0.18, 12), materials.furniture);
    pot.position.set(1.5, 1.63, -0.32);
    bay.add(pot);
    const foliage = new three.Mesh(new three.IcosahedronGeometry(0.17, 0), new three.MeshStandardMaterial({ color: 0x3f7d54, roughness: 0.82, envMapIntensity: 0.6 }));
    foliage.position.set(1.5, 1.83, -0.32);
    bay.add(foliage);

    const astronaut = createSeatedAstronaut(three, config.accent, config.suit, config.phase, config.action, config.style);
    astronaut.developer.position.set(0.44, 0, 0.55);
    bay.add(astronaut.developer);
    addContactShadow(three, bay, { x: 0.44, y: 0.05, z: 0.5 }, { x: 2.2, y: 1.8 });
    animatedOperators.push(astronaut);

    addBox(three, bay, { x: 0.72, y: 2.8, z: 0.78 }, { x: -1.92, y: 1.4, z: -1.55 }, materials.structure);
    for (let unit = 0; unit < 7; unit += 1) {
        addBox(three, bay, { x: 0.54, y: 0.07, z: 0.04 }, { x: -1.92, y: 0.36 + unit * 0.34, z: -1.15 }, unit % 2 ? accentMaterial : materials.dark);
    }
    const workLight = new three.PointLight(0xfff1de, 1.9, 8, 2);
    workLight.position.set(0, 3.2, 1);
    bay.add(workLight);
    const developerFill = new three.PointLight(0xf0f4fa, 1.9, 8, 2);
    developerFill.position.set(0.5, 2.7, 2.6);
    bay.add(developerFill);
}

function createConnector(three, station, materials, config) {
    const tunnel = new three.Group();
    tunnel.position.set(config.x, 0, config.z);
    tunnel.rotation.y = config.rotation;
    station.add(tunnel);
    const accentMaterial = new three.MeshBasicMaterial({ color: config.accent });
    const length = 2.45;

    addBox(three, tunnel, { x: 3.6, y: 0.18, z: length }, { x: 0, y: -0.08, z: 0 }, materials.floor);
    addBox(three, tunnel, { x: 0.18, y: 4.5, z: length }, { x: -1.8, y: 2.25, z: 0 }, materials.wall);
    addBox(three, tunnel, { x: 0.18, y: 4.5, z: length }, { x: 1.8, y: 2.25, z: 0 }, materials.wall);
    addBox(three, tunnel, { x: 3.6, y: 0.16, z: length }, { x: 0, y: 4.5, z: 0 }, materials.panel);
    addBox(three, tunnel, { x: 2.8, y: 0.04, z: length - 0.2 }, { x: 0, y: 4.16, z: 0 }, accentMaterial);
    addBox(three, tunnel, { x: 2.6, y: 0.04, z: length - 0.2 }, { x: 0, y: 0.08, z: 0 }, accentMaterial);
    [-1.08, 1.08].forEach(z => {
        addBox(three, tunnel, { x: 0.28, y: 4.5, z: 0.24 }, { x: -1.55, y: 2.25, z }, materials.structure);
        addBox(three, tunnel, { x: 0.28, y: 4.5, z: 0.24 }, { x: 1.55, y: 2.25, z }, materials.structure);
        addBox(three, tunnel, { x: 3.36, y: 0.26, z: 0.24 }, { x: 0, y: 4.37, z }, materials.structure);
    });
}

function createCentralHub(three, station, materials) {
    const hub = new three.Group();
    station.add(hub);
    const accentMaterial = new three.MeshBasicMaterial({ color: 0x8de4ff });

    hub.add(new three.Mesh(new three.CylinderGeometry(5.6, 5.6, 0.2, 8), materials.floor));
    const ceilingMat = new three.MeshStandardMaterial({ color: 0x3d5a63, metalness: 0.5, roughness: 0.55, side: three.DoubleSide, envMapIntensity: 0.9 });
    const ceiling = new three.Mesh(new three.RingGeometry(2.55, 5.9, 40), ceilingMat);
    ceiling.rotation.x = -Math.PI / 2;
    ceiling.position.y = 6.22;
    hub.add(ceiling);

    [Math.PI / 4, (Math.PI * 3) / 4, (Math.PI * 5) / 4, (Math.PI * 7) / 4].forEach(angle => {
        addBox(three, hub, { x: 3.85, y: 6.1, z: 0.3 }, { x: Math.sin(angle) * 5.08, y: 3.05, z: Math.cos(angle) * 5.08 }, materials.wall, angle);
    });

    const hubConsole = new three.Mesh(new three.CylinderGeometry(1.22, 1.42, 1.15, 8), materials.furniture);
    hubConsole.position.y = 0.58;
    hub.add(hubConsole);
    const consoleGlow = new three.Mesh(new three.CylinderGeometry(1.02, 1.02, 0.06, 8), accentMaterial);
    consoleGlow.position.y = 1.18;
    hub.add(consoleGlow);

    createHubDoorFrame(three, hub, materials, { x: -5.42, z: 0, rotation: Math.PI / 2, accent: '#6de0ff' });
    createHubDoorFrame(three, hub, materials, { x: 5.42, z: 0, rotation: -Math.PI / 2, accent: '#f4bd72' });
    createHubDoorFrame(three, hub, materials, { x: 0, z: -5.42, rotation: 0, accent: '#b7ff79' });
    createHubDoorFrame(three, hub, materials, { x: 0, z: 5.42, rotation: Math.PI, accent: '#9fb7ff' });

    const infoTexture = createScreenTexture(three, 'STATION CORE', ['HABITAT: NOMINAL', 'AIRLOCKS: 04', 'LUNAR ORBIT: STABLE'], '#8de4ff');
    const infoPanel = new three.Mesh(new three.PlaneGeometry(2.6, 1.45), new three.MeshBasicMaterial({ map: infoTexture }));
    infoPanel.position.set(-3.7, 4.5, -3.6);
    infoPanel.rotation.y = Math.PI / 4;
    hub.add(infoPanel);
}

function createHubDoorFrame(three, hub, materials, config) {
    const frame = new three.Group();
    frame.position.set(config.x, 2.3, config.z);
    frame.rotation.y = config.rotation;
    hub.add(frame);
    const accentMaterial = new three.MeshBasicMaterial({ color: config.accent });
    addBox(three, frame, { x: 0.34, y: 4.5, z: 0.3 }, { x: -1.56, y: 0, z: 0 }, materials.structure);
    addBox(three, frame, { x: 0.34, y: 4.5, z: 0.3 }, { x: 1.56, y: 0, z: 0 }, materials.structure);
    addBox(three, frame, { x: 3.46, y: 0.3, z: 0.3 }, { x: 0, y: 2.12, z: 0 }, materials.structure);
    addBox(three, frame, { x: 2.3, y: 0.08, z: 0.12 }, { x: 0, y: 1.76, z: -0.18 }, accentMaterial);
}

function createObservationDome(three, station, materials) {
    const dome = new three.Group();
    station.add(dome);
    const accentMaterial = new three.MeshBasicMaterial({ color: 0x8de4ff });
    const glassMaterial = new three.MeshPhysicalMaterial({ color: 0x0a2230, metalness: 0, roughness: 0.1, transparent: true, opacity: 0.18, side: three.DoubleSide, envMapIntensity: 1.3 });
    const frameMaterial = new three.MeshStandardMaterial({ color: 0x4a6670, metalness: 0.82, roughness: 0.34, envMapIntensity: 1.1 });

    const baseY = 6.32;
    const drumHeight = 2.5;
    const radius = 3.0;
    const segments = 12;

    // Rebord + plateforme d'observation autour de l'ouverture
    const rim = new three.Mesh(new three.CylinderGeometry(radius + 0.18, radius + 0.28, 0.36, segments, 1, true), frameMaterial);
    rim.position.y = baseY + 0.02;
    dome.add(rim);
    const railing = new three.Mesh(new three.TorusGeometry(2.5, 0.05, 8, 40), accentMaterial);
    railing.rotation.x = Math.PI / 2;
    railing.position.y = baseY + 1.02;
    dome.add(railing);
    for (let index = 0; index < 10; index += 1) {
        const angle = (index / 10) * Math.PI * 2;
        addBox(three, dome, { x: 0.06, y: 1.02, z: 0.06 }, { x: Math.cos(angle) * 2.5, y: baseY + 0.5, z: Math.sin(angle) * 2.5 }, frameMaterial);
    }
    const pedestal = new three.Mesh(new three.CylinderGeometry(0.5, 0.72, 0.62, 12), frameMaterial);
    pedestal.position.y = baseY + 0.31;
    dome.add(pedestal);
    const pedestalGlow = new three.Mesh(new three.CylinderGeometry(0.42, 0.42, 0.05, 12), accentMaterial);
    pedestalGlow.position.y = baseY + 0.63;
    dome.add(pedestalGlow);

    // Tambour vitre + meneaux verticaux
    const drumGlass = new three.Mesh(new three.CylinderGeometry(radius, radius, drumHeight, segments, 1, true), glassMaterial);
    drumGlass.position.y = baseY + drumHeight / 2;
    dome.add(drumGlass);
    for (let index = 0; index < segments; index += 1) {
        const angle = (index / segments) * Math.PI * 2;
        const mullion = new three.Mesh(new three.CylinderGeometry(0.06, 0.06, drumHeight, 6), frameMaterial);
        mullion.position.set(Math.cos(angle) * radius, baseY + drumHeight / 2, Math.sin(angle) * radius);
        dome.add(mullion);
    }
    const topRing = new three.Mesh(new three.TorusGeometry(radius, 0.09, 8, segments * 3), frameMaterial);
    topRing.rotation.x = Math.PI / 2;
    topRing.position.y = baseY + drumHeight;
    dome.add(topRing);

    // Coupole vitree + cercles de latitude (verriere geodesique)
    const cupola = new three.Mesh(new three.SphereGeometry(radius, segments * 3, 16, 0, Math.PI * 2, 0, Math.PI / 2), glassMaterial);
    cupola.position.y = baseY + drumHeight;
    dome.add(cupola);
    [0.32, 0.62, 0.86].forEach(fraction => {
        const ringRadius = radius * Math.cos(fraction * Math.PI / 2);
        const ringY = baseY + drumHeight + radius * Math.sin(fraction * Math.PI / 2);
        const latitude = new three.Mesh(new three.TorusGeometry(Math.max(ringRadius, 0.05), 0.04, 6, segments * 3), frameMaterial);
        latitude.rotation.x = Math.PI / 2;
        latitude.position.y = ringY;
        dome.add(latitude);
    });
    const apexOrb = new three.Mesh(new three.SphereGeometry(0.18, 16, 12), accentMaterial);
    apexOrb.position.y = baseY + drumHeight + radius - 0.1;
    dome.add(apexOrb);
    const apexLight = new three.PointLight(0x8de4ff, 2.2, 12, 2);
    apexLight.position.set(0, baseY + drumHeight + 0.8, 0);
    dome.add(apexLight);

    // La Lune, magnifique, vue depuis le dome
    const moon = createMoonGlobe(three);
    moon.position.set(11, 12.6, -13);
    dome.add(moon);
    const halo = new three.Mesh(new three.SphereGeometry(5.6, 32, 24), new three.MeshBasicMaterial({ color: 0x9fc6e6, transparent: true, opacity: 0.08, side: three.BackSide }));
    halo.position.copy(moon.position);
    dome.add(halo);
    const moonLight = new three.PointLight(0xdfefff, 1.6, 40, 2);
    moonLight.position.set(6, 9.5, -5);
    dome.add(moonLight);
    return dome;
}

function createMoonGlobe(three) {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    context.fillStyle = '#bcbfc4';
    context.fillRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < 18; index += 1) {
        const x = Math.abs(Math.sin(index * 23.1 + 1)) * canvas.width;
        const y = Math.abs(Math.sin(index * 11.7 + 2)) * canvas.height;
        const radius = 44 + ((index * 37) % 130);
        const sea = context.createRadialGradient(x, y, 0, x, y, radius);
        sea.addColorStop(0, 'rgba(88, 94, 104, 0.5)');
        sea.addColorStop(1, 'rgba(88, 94, 104, 0)');
        context.fillStyle = sea;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
    }
    for (let index = 0; index < 280; index += 1) {
        const x = Math.abs(Math.sin(index * 17.3 + 1)) * canvas.width;
        const y = Math.abs(Math.sin(index * 29.9 + 2)) * canvas.height;
        const radius = 2 + ((index * 13) % 22);
        context.fillStyle = 'rgba(122, 126, 132, 0.45)';
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = 'rgba(234, 238, 242, 0.4)';
        context.lineWidth = 1.4;
        context.beginPath();
        context.arc(x - radius * 0.18, y - radius * 0.18, radius * 0.92, 0, Math.PI * 2);
        context.stroke();
    }
    const texture = new three.CanvasTexture(canvas);
    texture.colorSpace = three.SRGBColorSpace;
    texture.anisotropy = 8;
    return new three.Mesh(
        new three.SphereGeometry(4.6, 48, 32),
        new three.MeshStandardMaterial({ map: texture, roughness: 1, metalness: 0, emissive: 0x223447, emissiveIntensity: 0.4 })
    );
}

function createStars(three, scene, compactViewport) {
    const count = compactViewport ? 180 : 380;
    const positions = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
        const offset = index * 3;
        positions[offset] = Math.sin(index * 12.9) * 48;
        positions[offset + 1] = Math.sin(index * 3.7) * 18 - 4;
        positions[offset + 2] = -40 - Math.abs(Math.sin(index * 8.4)) * 40;
    }
    const geometry = new three.BufferGeometry();
    geometry.setAttribute('position', new three.BufferAttribute(positions, 3));
    scene.add(new three.Points(geometry, new three.PointsMaterial({ color: 0xcdeeff, size: compactViewport ? 0.035 : 0.05, transparent: true, opacity: 0.7, depthWrite: false })));
}

function createCameraRoute(three) {
    const stop = (point, position, lookAt) => ({ point, position: new three.Vector3(...position), lookAt: new three.Vector3(...lookAt) });
    // Chaque halte vise un point situe a distance constante devant la camera.
    // L'orientation est ensuite interpolee en cap (yaw/pitch) pour des rotations
    // de tete lentes, continues et sans demi-tour brusque ni traversee de decor.
    const route = [
        // Arrivee : approche du hub depuis le quai sud
        stop(0.00, [0, 2.95, 10.5], [0, 2.72, 4.6]),
        stop(0.05, [0, 2.62, 4.6], [-3.4, 2.5, 1.6]),
        // T1 -> BACKEND (ouest) : virage a gauche progressif
        stop(0.105, [-3.2, 2.52, 0.7], [-7.3, 2.42, 0.15]),
        stop(0.15, [-6.4, 2.45, 0], [-10.6, 2.32, 0]),
        stop(0.21, [-8.6, 2.7, 0], [-12.9, 2.6, 0.25]),
        // T2 -> DATA (est) : demi-tour fluide via le nord (ouest -> nord -> est)
        stop(0.27, [-6.5, 2.43, 0], [-6.8, 2.32, -4.0]),
        stop(0.34, [0, 2.5, 0], [4.4, 2.42, -0.3]),
        stop(0.40, [6.4, 2.45, 0], [10.6, 2.34, 0]),
        stop(0.45, [8.6, 2.7, 0], [12.9, 2.6, -0.25]),
        // T3 -> IA (nord) : quart de tour (est -> nord)
        stop(0.51, [6.4, 2.44, 0], [6.0, 2.34, -4.2]),
        stop(0.57, [0.8, 2.5, -2.4], [0.2, 2.42, -6.6]),
        stop(0.605, [0, 2.44, -6.4], [0, 2.34, -10.6]),
        stop(0.64, [0, 2.7, -8.6], [-0.2, 2.6, -12.9]),
        // T4 -> CLOUD (sud) : demi-tour fluide via l'est (nord -> est -> sud)
        stop(0.70, [0, 2.44, -6.3], [4.0, 2.34, -6.6]),
        stop(0.76, [0, 2.5, 0], [0.3, 2.42, 4.4]),
        stop(0.81, [0, 2.45, 6.4], [0.2, 2.34, 10.6]),
        stop(0.86, [0, 2.7, 8.6], [0.2, 2.6, 12.9]),
        // T5 -> DOME LUNAIRE : retour au hub puis ascension majestueuse vers la Lune
        stop(0.90, [0, 2.6, 6.2], [-3.6, 2.5, 5.6]),
        stop(0.94, [0, 2.7, 0.5], [-0.4, 2.9, -3.6]),
        stop(0.965, [0, 4.4, 0], [1.6, 6.0, -3.4]),
        stop(0.985, [0.2, 6.8, 0.1], [5.5, 9.4, -8.2]),
        stop(1.00, [0.4, 8.0, 0.5], [9.5, 11.8, -11.5])
    ];

    const direction = new three.Vector3();
    route.forEach(node => {
        direction.subVectors(node.lookAt, node.position);
        node.dist = Math.max(direction.length(), 0.001);
        node.yaw = Math.atan2(direction.x, -direction.z);
        node.pitch = Math.atan2(direction.y, Math.max(Math.hypot(direction.x, direction.z), 0.0001));
    });
    // Deroule les caps pour garantir le plus court chemin angulaire et une rotation continue.
    for (let index = 1; index < route.length; index += 1) {
        let delta = route[index].yaw - route[index - 1].yaw;
        while (delta > Math.PI) { route[index].yaw -= 2 * Math.PI; delta = route[index].yaw - route[index - 1].yaw; }
        while (delta < -Math.PI) { route[index].yaw += 2 * Math.PI; delta = route[index].yaw - route[index - 1].yaw; }
    }
    return route;
}

function resolveRoute(route, progress, position, lookAt) {
    let lower = route[0];
    let upper = route.at(-1);
    for (let index = 0; index < route.length - 1; index += 1) {
        if (progress <= route[index + 1].point) {
            lower = route[index];
            upper = route[index + 1];
            break;
        }
    }
    const span = Math.max(upper.point - lower.point, 0.001);
    const local = Math.min(Math.max((progress - lower.point) / span, 0), 1);
    // Position : trajet lineaire le long des couloirs (aucun waypoint dans le decor).
    position.lerpVectors(lower.position, upper.position, local);
    // Orientation : interpolation du cap => la tete tourne a vitesse constante,
    // la cible reste toujours devant la camera (jamais de passage a travers l'objectif).
    const yaw = lower.yaw + (upper.yaw - lower.yaw) * local;
    const pitch = lower.pitch + (upper.pitch - lower.pitch) * local;
    const dist = lower.dist + (upper.dist - lower.dist) * local;
    const cosPitch = Math.cos(pitch);
    lookAt.set(
        position.x + Math.sin(yaw) * cosPitch * dist,
        position.y + Math.sin(pitch) * dist,
        position.z - Math.cos(yaw) * cosPitch * dist
    );
}
