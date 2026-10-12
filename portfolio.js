document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
    renderProjects();
    initProjectFilters();
    initNavigation();
    initScrollEffects();
    initReveal();
    initStatsCounter();
});

function renderProjects() {
    const grid = document.getElementById('projectsGrid');
    if (!grid || typeof projectsData === 'undefined') return;

    const projectCount = String(projectsData.length).padStart(2, '0');
    grid.innerHTML = projectsData.map((project, index) => {
        const featured = project.featured ? ' featured' : '';
        const badge = project.featured ? '<span class="featured-badge">Projet majeur</span>' : '';
        const links = [];

        if (project.demoUrl && project.demoUrl !== '#') {
            links.push(`<a href="${project.demoUrl}" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right" aria-hidden="true"></i> Voir le site</a>`);
        }
        if (project.githubUrl && project.githubUrl !== '#') {
            links.push(`<a href="${project.githubUrl}" target="_blank" rel="noopener"><i class="bi bi-github" aria-hidden="true"></i> Code source</a>`);
        }

        return `
            <div class="col-lg-4 col-md-6 project-col" data-category="${project.category}" data-aos="fade-up">
                <article class="project-card${featured}">
                    <div class="project-topline">
                        <span class="project-number">${String(index + 1).padStart(2, '0')} / ${projectCount}</span>
                        <span class="project-category">${project.categoryName}</span>
                    </div>
                    ${badge}
                    <div class="project-content">
                        <h3>${project.title}</h3>
                        <p>${project.description}</p>
                        <div class="project-tags" aria-label="Technologies utilisées">${project.tags.map(tag => `<span class="badge">${tag}</span>`).join('')}</div>
                        ${links.length ? `<div class="project-links">${links.join('')}</div>` : ''}
                    </div>
                </article>
            </div>
        `;
    }).join('');
}

function initProjectFilters() {
    const buttons = [...document.querySelectorAll('.filter-btn')];
    const cards = [...document.querySelectorAll('.project-col')];

    buttons.forEach(button => {
        button.setAttribute('aria-pressed', String(button.classList.contains('active')));
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;
            buttons.forEach(item => {
                const selected = item === button;
                item.classList.toggle('active', selected);
                item.setAttribute('aria-pressed', String(selected));
            });
            cards.forEach(card => {
                card.hidden = filter !== 'all' && card.dataset.category !== filter;
            });
        });
    });
}

function initNavigation() {
    const navbar = document.getElementById('mainNav');
    const navLinks = [...document.querySelectorAll('#navbarNav .nav-link')];
    const sections = navLinks
        .map(link => document.querySelector(link.getAttribute('href')))
        .filter(Boolean);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const menu = document.getElementById('navbarNav');
            if (menu?.classList.contains('show') && globalThis.bootstrap?.Collapse) {
                globalThis.bootstrap.Collapse.getOrCreateInstance(menu).hide();
            }
        });
    });

    if ('IntersectionObserver' in globalThis) {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                navLinks.forEach(link => {
                    link.classList.toggle('active', link.hash === `#${entry.target.id}`);
                });
            });
        }, { rootMargin: '-35% 0px -55% 0px' });
        sections.forEach(section => observer.observe(section));
    }
}

function initScrollEffects() {
    const navbar = document.getElementById('mainNav');
    const progress = document.getElementById('scrollProgress');
    const backToTop = document.getElementById('backToTop');
    let scheduled = false;

    const update = () => {
        const scrollableHeight = document.documentElement.scrollHeight - globalThis.innerHeight;
        const percentage = scrollableHeight > 0 ? (globalThis.scrollY / scrollableHeight) * 100 : 0;
        if (progress) progress.style.width = `${percentage}%`;
        if (navbar) navbar.classList.toggle('scrolled', globalThis.scrollY > 20);
        if (backToTop) backToTop.classList.toggle('show', globalThis.scrollY > 500);
        scheduled = false;
    };

    globalThis.addEventListener('scroll', () => {
        if (scheduled) return;
        scheduled = true;
        requestAnimationFrame(update);
    }, { passive: true });
    globalThis.addEventListener('resize', update, { passive: true });
    backToTop?.addEventListener('click', () => globalThis.scrollTo({ top: 0, behavior: 'smooth' }));
    update();
}

function initReveal() {
    const items = [...document.querySelectorAll('[data-aos]')];
    if (!items.length) return;

    if (!('IntersectionObserver' in globalThis) || globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        items.forEach(item => item.classList.add('aos-in'));
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('aos-in');
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });

    items.forEach(item => observer.observe(item));
}

function initStatsCounter() {
    const counters = [...document.querySelectorAll('.stat-number')];
    if (!counters.length) return;

    const animate = counter => {
        const target = Number.parseInt(counter.dataset.target, 10) || 0;
        if (globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            counter.textContent = String(target);
            return;
        }
        const start = performance.now();
        const duration = 800;
        const tick = now => {
            const progress = Math.min((now - start) / duration, 1);
            counter.textContent = String(Math.round(target * progress));
            if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    };

    if (!('IntersectionObserver' in globalThis)) {
        counters.forEach(animate);
        return;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            animate(entry.target);
            currentObserver.unobserve(entry.target);
        });
    }, { threshold: 0.5 });
    counters.forEach(counter => observer.observe(counter));
}