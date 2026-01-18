/* ============================================
   Modern Interactive JavaScript
   ============================================ */

// GitHub Configuration - Kullanıcı adınızı buraya girin
const GITHUB_USERNAME = 'alpermdr';
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}`;

// Translations Global Object
let translations = {};

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize theme first to prevent flash
    initTheme();

    // Initialize language
    await initLanguage();

    // Initialize all features
    initNavbar();
    initMobileMenu();
    initScrollAnimations();
    initSmoothScroll();
    initActiveNavigation();

    // Initialize Background Interactivity
    initBackgroundInteractivity();

    // Initialize Particles (Dots)
    initParticles();

    // Load blog articles on homepage (first 3)
    loadBlogArticles();

    // Load GitHub projects (Homepage: first 6)
    if (document.getElementById('homepage-projects-grid')) {
        loadGitHubProjects('homepage-projects-grid', 6);
    }
});

/* ============================================
   Language Switcher
   ============================================ */
async function initLanguage() {
    const langButtons = document.querySelectorAll('.lang-btn');
    const currentLang = localStorage.getItem('selectedLang') || 'tr';
    window.currentLang = currentLang;

    try {
        const response = await fetch('translations.json');
        translations = await response.json();

        // Update UI with initial language
        updateLanguage(currentLang);
    } catch (error) {
        console.error('Could not load translations:', error);
    }

    // Set initial active state
    langButtons.forEach(btn => {
        if (btn.dataset.lang === currentLang) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            window.currentLang = lang;
            localStorage.setItem('selectedLang', lang);

            // Update UI
            langButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            updateLanguage(lang);

            // Reload projects/blog if necessary to update their specific texts
            loadBlogArticles();
            if (window.allRepos) {
                if (document.getElementById('github-projects-grid')) {
                    renderProjects(window.allRepos, 'github-projects-grid');
                }
                if (document.getElementById('homepage-projects-grid')) {
                    renderProjects(window.allRepos.slice(0, 6), 'homepage-projects-grid');
                }
            }
        });
    });
}

function updateLanguage(lang) {
    document.documentElement.lang = lang;

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    // Update placeholders if any
    const inputs = document.querySelectorAll('[data-i18n-placeholder]');
    inputs.forEach(input => {
        const key = input.dataset.i18nPlaceholder;
        if (translations[lang] && translations[lang][key]) {
            input.placeholder = translations[lang][key];
        }
    });
}

/* ============================================
   Theme Management
   ============================================ */

function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme || 'dark';

    // Apply initial theme
    document.documentElement.setAttribute('data-theme', initialTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

function initBackgroundInteractivity() {
    const bgGradient = document.querySelector('.bg-gradient');
    if (!bgGradient) return;

    document.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const moveX = (clientX - centerX) / centerX;
        const moveY = (clientY - centerY) / centerY;

        // Apply multi-layered parallax shift
        bgGradient.style.setProperty('--m-x-1', `${moveX * 30}px`);
        bgGradient.style.setProperty('--m-y-1', `${moveY * 30}px`);
        bgGradient.style.setProperty('--m-x-2', `${moveX * -20}px`);
        bgGradient.style.setProperty('--m-y-2', `${moveY * -20}px`);
        bgGradient.style.setProperty('--m-x-3', `${moveX * 15}px`);
        bgGradient.style.setProperty('--m-y-3', `${moveY * 15}px`);
    });
}

function initParticles() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: null, y: null, radius: 400 }; // Increased radius for attraction area

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        init();
    }

    window.addEventListener('resize', resize);
    resize();

    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.baseSize = this.size;
            this.speedX = (Math.random() * 2 - 1) * 0.3;
            this.speedY = (Math.random() * 2 - 1) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.3;
        }

        update() {
            // Drift
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce
            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

            if (mouse.x !== null && mouse.y !== null) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistanceToMouse = 50;

                if (distance < mouse.radius) {
                    const angle = Math.atan2(dy, dx);

                    if (distance > minDistanceToMouse) {
                        // Attraction
                        this.x += Math.cos(angle) * 2;
                        this.y += Math.sin(angle) * 2;
                    } else if (distance < minDistanceToMouse - 2) {
                        // Repulsion if too close
                        this.x -= Math.cos(angle) * 3;
                        this.y -= Math.sin(angle) * 3;
                    }
                }
            }

            // Inter-particle repulsion (Keep 50px distance)
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                if (p === this) continue;

                const dx = p.x - this.x;
                const dy = p.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minInterDist = 40; // Balanced to avoid overcrowding

                if (distance < minInterDist) {
                    const angle = Math.atan2(dy, dx);
                    this.x -= Math.cos(angle) * 0.5;
                    this.y -= Math.sin(angle) * 0.5;
                }
            }
        }

        draw() {
            const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
            const color = isDark ? `rgba(255, 255, 255, ${this.opacity + 0.3})` : `rgba(79, 70, 229, ${this.opacity})`;
            const glowColor = isDark ? `rgba(99, 102, 241, 0.8)` : `rgba(79, 70, 229, 0.5)`;

            ctx.shadowBlur = isDark ? 15 : 8;
            ctx.shadowColor = glowColor;
            ctx.fillStyle = color;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.fillStyle = isDark ? '#ffffff' : color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function init() {
        // Fixed count around 250-300
        const particleCount = 280;
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function connect() {
        const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
        const lineColor = isDark ? '99, 102, 241' : '79, 70, 229';

        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                const dx = particles[a].x - particles[b].x;
                const dy = particles[a].y - particles[b].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = 1 - (distance / 120);
                    ctx.strokeStyle = `rgba(${lineColor}, ${opacity * 0.2})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        connect();
        requestAnimationFrame(animate);
    }

    init();
    animate();
}

/* ============================================
   Navigation Functions
   ============================================ */

/* Navbar Scroll Effect */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* Mobile Menu Toggle */
function initMobileMenu() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* Scroll Animations using Intersection Observer */
function initScrollAnimations() {
    // Elements to animate
    const animatedElements = document.querySelectorAll(
        '.section-header, .skill-card, .project-card, .contact-card, .about-text, .github-project-card, .blog-card'
    );

    // Add initial state
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
    });

    // Create observer
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }
    );

    // Observe elements
    animatedElements.forEach(el => observer.observe(el));
}

/* Smooth Scroll */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));

            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/* Active Navigation Link Highlight */
function initActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.pageYOffset + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

/* ============================================
   GitHub Integration Functions
   ============================================ */

/* Load GitHub Projects */
async function loadGitHubProjects(targetId = 'github-projects-grid', limit = null) {
    const projectsGrid = document.getElementById(targetId);
    const loadingEl = document.getElementById('projects-loading');
    const errorEl = document.getElementById('projects-error');
    const statsEl = document.getElementById('github-stats');

    if (!projectsGrid) return;

    try {
        // Fetch user data and repos
        const [userResponse, reposResponse] = await Promise.all([
            fetch(GITHUB_API_URL),
            fetch(`${GITHUB_API_URL}/repos?sort=updated&per_page=100`)
        ]);

        if (!userResponse.ok || !reposResponse.ok) {
            throw new Error('GitHub API error');
        }

        const userData = await userResponse.json();
        const repos = await reposResponse.json();

        // Create explicit copy of all repos for potential use
        const allUserRepos = [...repos];

        // Hide loading, show content
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'none';

        // Show GitHub stats
        if (statsEl) {
            statsEl.innerHTML = createGitHubStats(userData, allUserRepos);
        }

        // Store repos for filtering
        window.allRepos = allUserRepos;

        // Render projects
        const displayRepos = limit ? allUserRepos.slice(0, limit) : allUserRepos;
        renderProjects(displayRepos, targetId);

    } catch (error) {
        console.error('GitHub API Error:', error);
        if (loadingEl) loadingEl.style.display = 'none';
        if (errorEl) errorEl.style.display = 'block';

        if (targetId === 'homepage-projects-grid') {
            projectsGrid.innerHTML = `
                <div class="no-projects">
                    <p>GitHub projeleri yüklenemedi. <a href="projects.html">Projeler sayfasını</a> ziyaret edin.</p>
                </div>
            `;
        }
    }
}

/* Create GitHub Stats HTML */
function createGitHubStats(user, repos) {
    const totalStars = repos.reduce((acc, repo) => acc + repo.stargazers_count, 0);
    const totalForks = repos.reduce((acc, repo) => acc + repo.forks_count, 0);

    return `
        <div class="github-stats-grid">
            <div class="github-stat-card">
                <div class="github-stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                </div>
                <div class="github-stat-value">${repos.length}</div>
                <div class="github-stat-label">Repo</div>
            </div>
            <div class="github-stat-card">
                <div class="github-stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                </div>
                <div class="github-stat-value">${totalStars}</div>
                <div class="github-stat-label">Yıldız</div>
            </div>
            <div class="github-stat-card">
                <div class="github-stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="18" r="3"></circle>
                        <circle cx="6" cy="6" r="3"></circle>
                        <circle cx="18" cy="6" r="3"></circle>
                        <path d="M18 9a9 9 0 0 1-9 9"></path>
                        <path d="M6 9a9 9 0 0 0 9 9"></path>
                    </svg>
                </div>
                <div class="github-stat-value">${totalForks}</div>
                <div class="github-stat-label">Fork</div>
            </div>
            <div class="github-stat-card">
                <div class="github-stat-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                </div>
                <div class="github-stat-value">${user.followers}</div>
                <div class="github-stat-label">Takipçi</div>
            </div>
        </div>
    `;
}

/* Render Projects Grid */
function renderProjects(repos, targetId = 'github-projects-grid') {
    const projectsGrid = document.getElementById(targetId);
    if (!projectsGrid) return;

    if (repos.length === 0) {
        projectsGrid.innerHTML = `
            <div class="no-projects">
                <p>Henüz proje bulunamadı.</p>
            </div>
        `;
        return;
    }

    // Clear any loading state
    projectsGrid.innerHTML = '';
    projectsGrid.innerHTML = repos.map(repo => createGitHubProjectCard(repo)).join('');

    // Re-initialize animations for new elements
    initScrollAnimations();
}

/* Create GitHub Project Card HTML */
function createGitHubProjectCard(repo) {
    const currentLang = window.currentLang || 'tr';
    const updatedDate = new Date(repo.updated_at).toLocaleDateString(currentLang === 'tr' ? 'tr-TR' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const languageColors = {
        'JavaScript': '#f7df1e',
        'TypeScript': '#3178c6',
        'Python': '#3776ab',
        'HTML': '#e34c26',
        'CSS': '#1572b6',
        'Java': '#b07219',
        'C++': '#00599c',
        'C#': '#239120',
        'PHP': '#4f5d95',
        'Ruby': '#cc342d',
        'Go': '#00add8',
        'Rust': '#dea584',
        'Vue': '#41b883',
        'Swift': '#f05138',
        'Kotlin': '#7f52ff'
    };

    const langColor = languageColors[repo.language] || '#6366f1';

    return `
        <article class="github-project-card">
            <div class="github-project-header">
                <div class="github-project-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                </div>
                <h3 class="github-project-name">${repo.name}</h3>
            </div>
            
            <p class="github-project-description">
                ${repo.description || (translations[currentLang]?.['no-description'] || 'Açıklama bulunmuyor.')}
            </p>
            
            <div class="github-project-meta">
                ${repo.language ? `
                    <span class="github-project-language">
                        <span class="language-dot" style="background-color: ${langColor}"></span>
                        ${repo.language}
                    </span>
                ` : ''}
                <span class="github-project-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                    ${repo.stargazers_count}
                </span>
                <span class="github-project-stat">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="18" r="3"></circle>
                        <circle cx="6" cy="6" r="3"></circle>
                        <circle cx="18" cy="6" r="3"></circle>
                        <path d="M18 9a9 9 0 0 1-9 9"></path>
                        <path d="M6 9a9 9 0 0 0 9 9"></path>
                    </svg>
                    ${repo.forks_count}
                </span>
            </div>
            
            <div class="github-project-footer">
                <span class="github-project-updated">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    ${updatedDate}
                </span>
                <div class="github-project-links">
                    <a href="${repo.html_url}" target="_blank" class="github-project-link" title="GitHub'da Gör">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                    </a>
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" class="github-project-link" title="Demo">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                        </a>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
}

/* Filter Tabs for Projects */
function initFilterTabs() {
    const filterTabs = document.querySelectorAll('.filter-tab');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Filter projects
            const filter = tab.dataset.filter;
            filterProjects(filter);
        });
    });
}

/* Filter Projects */
function filterProjects(filter) {
    if (!window.allRepos) return;

    let filteredRepos = [...window.allRepos];

    switch (filter) {
        case 'pinned':
            // Sort by stars (most starred first)
            filteredRepos = filteredRepos
                .sort((a, b) => b.stargazers_count - a.stargazers_count)
                .slice(0, 6);
            break;
        case 'recent':
            // Sort by updated date
            filteredRepos = filteredRepos
                .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
                .slice(0, 10);
            break;
        default:
            // Show all
            break;
    }

    renderProjects(filteredRepos);
}

/* Load GitHub Projects for Homepage */
async function loadHomepageGitHubProjects() {
    const projectsGrid = document.getElementById('homepage-projects-grid');
    if (!projectsGrid) return;

    try {
        const response = await fetch(`${GITHUB_API_URL}/repos?sort=updated&per_page=100`);
        if (!response.ok) throw new Error('GitHub API error');

        const repos = await response.json();
        const ownRepos = repos.slice(0, 6);

        // Clear loading spinner
        projectsGrid.innerHTML = '';

        if (ownRepos.length === 0) {
            projectsGrid.innerHTML = `
                <div class="no-projects">
                    <p>Henüz proje bulunmuyor. Daha sonra tekrar kontrol edin.</p>
                </div>
            `;
            return;
        }

        // Create project cards HTML
        const projectsHTML = ownRepos.map(repo => createHomepageProjectCard(repo)).join('');

        projectsGrid.innerHTML = projectsHTML;

        // Re-init animations
        initScrollAnimations();

    } catch (error) {
        console.error('Could not load GitHub projects for homepage:', error);
        // Show a fallback message
        projectsGrid.innerHTML = `
            <div class="no-projects">
                <p>GitHub projeleri yüklenemedi. <a href="projects.html">Projeler sayfasını</a> ziyaret edin.</p>
            </div>
        `;
    }
}

/* Create Homepage Project Card */
function createHomepageProjectCard(repo) {
    const languageColors = {
        'JavaScript': '#f7df1e',
        'TypeScript': '#3178c6',
        'Python': '#3776ab',
        'HTML': '#e34c26',
        'CSS': '#1572b6',
        'Java': '#b07219',
        'C++': '#00599c',
        'C#': '#239120',
        'PHP': '#4f5d95',
        'Ruby': '#cc342d',
        'Go': '#00add8',
        'Rust': '#dea584',
        'Vue': '#41b883',
        'Swift': '#f05138',
        'Kotlin': '#7f52ff'
    };

    const langColor = languageColors[repo.language] || '#6366f1';
    const isFeatured = repo.stargazers_count > 5 || repo === window.allRepos?.[0];

    return `
        <article class="project-card${isFeatured ? ' featured' : ''}">
            <div class="project-image">
                <div class="project-overlay"></div>
                <div class="project-placeholder" style="background: linear-gradient(135deg, ${langColor}44, ${langColor}22);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                        fill="none" stroke="${langColor}" stroke-width="1.5">
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                    </svg>
                </div>
            </div>
            <div class="project-content">
                <div class="project-tags">
                    ${repo.language ? `<span class="tag" style="background: ${langColor}22; color: ${langColor};">${repo.language}</span>` : ''}
                    ${repo.stargazers_count > 0 ? `<span class="tag">⭐ ${repo.stargazers_count}</span>` : ''}
                </div>
                <h3 class="project-title">${repo.name}</h3>
                <p class="project-description">
                    ${repo.description || 'Açıklama bulunmuyor.'}
                </p>
                <div class="project-links">
                    <a href="${repo.html_url}" target="_blank" class="project-link">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                            fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                        </svg>
                        <span>GitHub</span>
                    </a>
                    ${repo.homepage ? `
                        <a href="${repo.homepage}" target="_blank" class="project-link">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                <polyline points="15 3 21 3 21 9"></polyline>
                                <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                            <span>Demo</span>
                        </a>
                    ` : ''}
                </div>
            </div>
        </article>
    `;
}

/* ============================================
   Blog Functions
   ============================================ */

/* Load Blog Articles for Homepage */
async function loadBlogArticles() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    try {
        // First try to load from markdown files
        const articles = await loadArticlesFromMarkdown();

        // Show only first 3 articles on homepage
        const displayArticles = articles.slice(0, 3);

        blogGrid.innerHTML = displayArticles.map(article => createBlogCard(article)).join('');

        // Re-init animations
        initScrollAnimations();
    } catch (error) {
        console.log('Could not load articles:', error);
        // Fallback to JSON
        try {
            const response = await fetch('articles.json');
            const articles = await response.json();
            const displayArticles = articles.slice(0, 3);
            blogGrid.innerHTML = displayArticles.map(article => createBlogCard(article)).join('');
        } catch (e) {
            console.log('Could not load articles from JSON:', e);
        }
    }
}

/* Load All Articles for Blog Page */
async function loadAllArticles() {
    const blogGrid = document.getElementById('blog-grid');
    if (!blogGrid) return;

    try {
        // First try to load from markdown files
        const articles = await loadArticlesFromMarkdown();
        blogGrid.innerHTML = articles.map(article => createBlogCard(article)).join('');

        // Re-init animations
        initScrollAnimations();
    } catch (error) {
        console.log('Could not load articles from markdown:', error);
        // Fallback to JSON
        try {
            const response = await fetch('articles.json');
            const articles = await response.json();
            blogGrid.innerHTML = articles.map(article => createBlogCard(article)).join('');
        } catch (e) {
            console.log('Could not load articles from JSON:', e);
        }
    }
}

/* Load Articles from Markdown Files */
async function loadArticlesFromMarkdown() {
    // Define blog posts - in a real scenario, you might fetch a list from an index file
    const blogSlugs = [
        'lorem',
        'modern-web-gelistirme-trendleri-2026',
        'react-vs-vue-hangisini-secmeli',
        'python-ile-machine-learning-giris'
    ];

    const articles = [];

    for (const slug of blogSlugs) {
        try {
            // Priority 1: Markdown (.md)
            let response = await fetch(`blogs/${slug}.md`);
            if (response.ok) {
                const markdown = await response.text();
                const article = parseMarkdownFrontmatter(markdown, slug);
                if (article) {
                    articles.push(article);
                    continue;
                }
            }

            // Priority 2: Text (.txt)
            response = await fetch(`blogs/${slug}.txt`);
            if (response.ok) {
                const text = await response.text();
                const article = parseTxtFile(text, slug);
                if (article) {
                    articles.push(article);
                    continue;
                }
            }
        } catch (e) {
            console.log(`Could not load ${slug}`);
        }
    }

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.date) - new Date(a.date));

    return articles;
}

/* Parse Markdown Frontmatter */
function parseMarkdownFrontmatter(markdown, slug) {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
    const match = markdown.match(frontmatterRegex);

    if (!match) return null;

    const frontmatter = match[1];
    const content = markdown.slice(match[0].length).trim();

    // Parse YAML-like frontmatter
    const article = { slug };

    frontmatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            const key = line.slice(0, colonIndex).trim();
            let value = line.slice(colonIndex + 1).trim();

            // Remove quotes
            if ((value.startsWith('"') && value.endsWith('"')) ||
                (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }

            // Parse arrays
            if (value.startsWith('[') && value.endsWith(']')) {
                try {
                    value = JSON.parse(value.replace(/'/g, '"'));
                } catch (e) {
                    value = value.slice(1, -1).split(',').map(s => s.trim().replace(/['"]/g, ''));
                }
            }

            // Parse booleans
            if (value === 'true') value = true;
            if (value === 'false') value = false;
            if (value === 'null') value = null;

            article[key] = value;
        }
    });

    article.content = content;

    if (!article.title) return null;

    // Default values if missing
    article.date = article.date || new Date().toISOString().split('T')[0];
    article.category = article.category || 'Genel';
    article.readTime = article.readTime || '3 dk';
    article.excerpt = article.excerpt || content.slice(0, 150) + '...';

    return article;
}

/* Parse Plain Text File */
function parseTxtFile(text, slug) {
    const lines = text.split('\n').map(line => line.trim());
    const nonEmptyLines = lines.filter(l => l !== '');

    if (nonEmptyLines.length === 0) return null;

    // Smart Image Detection: Find the first image/URL in the whole file to use as cover
    let featuredImage = null;
    for (const line of nonEmptyLines) {
        const imgMarkerMatch = line.match(/^\[img(?:age)?:\s*(.*?)\]$/i);
        const isRawImgUrl = line.startsWith('http') && (line.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || line.includes('images.unsplash.com'));

        if (imgMarkerMatch) {
            const rawSrc = imgMarkerMatch[1];
            featuredImage = rawSrc.startsWith('http') || rawSrc.startsWith('/') ? rawSrc : `assets/images/blog/${rawSrc}`;
            break;
        } else if (isRawImgUrl) {
            featuredImage = line;
            break;
        }
    }

    // Title is the first line that isn't a URL and isn't empty
    let title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    for (const line of nonEmptyLines) {
        if (!line.startsWith('http') && !line.startsWith('[img') && line.length < 100) {
            title = line;
            break;
        }
    }

    // Process body lines
    const processedContent = lines.map(line => {
        if (line === '') return '';

        // Match [img: path.jpg]
        const imgMarkerMatch = line.match(/^\[img(?:age)?:\s*(.*?)\]$/i);
        // Match raw URL that looks like an image
        const isRawImgUrl = line.startsWith('http') && (line.match(/\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i) || line.includes('images.unsplash.com'));

        if (imgMarkerMatch || isRawImgUrl) {
            const rawSrc = imgMarkerMatch ? imgMarkerMatch[1] : line;
            const imgSrc = rawSrc.startsWith('http') || rawSrc.startsWith('/')
                ? rawSrc
                : `assets/images/blog/${rawSrc}`;
            return `<div class="content-image"><img src="${imgSrc}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"></div>`;
        }

        // Don't wrap the title in <p> if it's the exact title we found
        if (line === title) return `<h2 class="content-subtitle">${line}</h2>`;

        return `<p>${line}</p>`;
    }).filter(l => l !== '').join('');

    return {
        id: slug,
        slug: slug,
        title: title,
        image: featuredImage,
        excerpt: nonEmptyLines.find(l => l.length > 50 && !l.startsWith('http'))?.slice(0, 150) + '...' || title,
        date: new Date().toISOString().split('T')[0],
        readTime: Math.ceil(text.split(' ').length / 200) + ' dk',
        category: 'Blog',
        tags: [],
        content: processedContent,
        isTxt: true
    };
}

/* Create Blog Card HTML */
function createBlogCard(article) {
    const formattedDate = new Date(article.date).toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const categoryColors = {
        'Web Development': '#6366f1',
        'Frontend': '#8b5cf6',
        'AI/ML': '#06b6d4',
        'Backend': '#10b981',
        'DevOps': '#f59e0b',
        'Tutorial': '#ec4899'
    };

    const categoryColor = categoryColors[article.category] || '#6366f1';

    return `
        <a href="article.html?slug=${article.slug}" class="blog-card">
            <div class="blog-card-image" style="background: linear-gradient(135deg, ${categoryColor} 0%, ${categoryColor}99 100%);">
                ${article.image ? `<img src="${article.image}" alt="${article.title}" loading="lazy">` : `
                    <svg class="blog-card-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                `}
            </div>
            <div class="blog-card-content">
                <div class="blog-card-meta">
                    <span class="blog-card-category" style="background: ${categoryColor}22; color: ${categoryColor};">${article.category}</span>
                    <span>${formattedDate}</span>
                    <span>• ${article.readTime}</span>
                </div>
                <h3 class="blog-card-title">${article.title}</h3>
                <p class="blog-card-excerpt">${article.excerpt}</p>
                <div class="blog-card-footer">
                    <span class="blog-card-read">
                        ${translations[window.currentLang || 'tr']?.['read-more'] || 'Devamını Oku'}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </span>
                </div>
            </div>
        </a>
    `;
}

/* Load Single Article */
async function loadArticle() {
    const articleContent = document.getElementById('article-content');
    if (!articleContent) return;

    // Get slug from URL
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (!slug) {
        window.location.href = 'blog.html';
        return;
    }

    try {
        // Try to load from markdown first
        let article = null;
        let content = '';

        try {
            const mdResponse = await fetch(`blogs/${slug}.md`);
            if (mdResponse.ok) {
                const markdown = await mdResponse.text();
                article = parseMarkdownFrontmatter(markdown, slug);
                if (article && article.content) {
                    content = parseMarkdown(article.content);
                }
            }
        } catch (e) {
            console.log('Could not load from blogs folder');
        }

        // Priority 1: blogs folder (.md)
        try {
            const mdResponse = await fetch(`blogs/${slug}.md`);
            if (mdResponse.ok) {
                const markdown = await mdResponse.text();
                // We need the metadata too, so let's re-parse it
                article = parseMarkdownFrontmatter(markdown, slug);
                if (article) {
                    content = article.content;
                }
            }
        } catch (e) { }

        // Priority 2: blogs folder (.txt)
        if (!article) {
            try {
                const txtResponse = await fetch(`blogs/${slug}.txt`);
                if (txtResponse.ok) {
                    const text = await txtResponse.text();
                    article = parseTxtFile(text, slug);
                    if (article) {
                        content = article.content;
                    }
                }
            } catch (e) { }
        }

        // Priority 3: articles folder
        if (!article) {
            try {
                const mdResponse = await fetch(`articles/${slug}.md`);
                if (mdResponse.ok) {
                    const markdown = await mdResponse.text();
                    content = parseMarkdown(markdown);
                }
            } catch (e) { }
        }

        // If no markdown, try JSON
        if (!article) {
            const response = await fetch('articles.json');
            const articles = await response.json();
            article = articles.find(a => a.slug === slug);

            if (!article) {
                articleContent.innerHTML = '<p class="article-error">Makale bulunamadı.</p>';
                return;
            }

            content = content || `<p>${article.excerpt}</p>`;
        }

        // Update page title
        document.title = `${article.title} | Alper`;

        // Update meta description
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', article.excerpt);
        }

        const formattedDate = new Date(article.date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const tags = article.tags || [];

        articleContent.innerHTML = `
            <a href="blog.html" class="article-back">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Tüm Yazılar
            </a>
            <header class="article-header">
                ${article.image ? `
                    <div class="article-featured-image">
                        <img src="${article.image}" alt="${article.title}">
                    </div>
                ` : ''}
                <span class="article-category">${article.category}</span>
                <h1 class="article-title">${article.title}</h1>
                <div class="article-meta">
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        ${formattedDate}
                    </span>
                    <span>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        ${article.readTime}
                    </span>
                </div>
            </header>
            <div class="article-content">
                ${content}
            </div>
            ${tags.length > 0 ? `
                <div class="article-tags">
                    ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            ` : ''}
            <div class="article-share">
                <span class="share-label">Paylaş:</span>
                <div class="share-buttons">
                    <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(window.location.href)}" target="_blank" class="share-button twitter" title="Twitter'da Paylaş">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                    </a>
                    <a href="https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(article.title)}" target="_blank" class="share-button linkedin" title="LinkedIn'de Paylaş">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                            <rect x="2" y="9" width="4" height="12"></rect>
                            <circle cx="4" cy="4" r="2"></circle>
                        </svg>
                    </a>
                    <button onclick="copyToClipboard('${window.location.href}')" class="share-button copy" title="Linki Kopyala">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;

        // Add syntax highlighting for code blocks
        highlightCodeBlocks();

    } catch (error) {
        console.log('Could not load article:', error);
        articleContent.innerHTML = '<p class="article-error">Makale yüklenirken bir hata oluştu.</p>';
    }
}

/* Copy to Clipboard */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show toast notification
        showToast('Link kopyalandı!');
    }).catch(err => {
        console.error('Could not copy text:', err);
    });
}

/* Show Toast Notification */
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* Enhanced Markdown Parser */
function parseMarkdown(markdown) {
    let html = markdown
        // Code blocks with language
        .replace(/```(\w+)?\n([\s\S]*?)```/gim, (match, lang, code) => {
            return `<pre class="code-block${lang ? ' language-' + lang : ''}"><code>${escapeHtml(code.trim())}</code></pre>`;
        })
        // Headers
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        // Italic
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Inline code
        .replace(/`(.*?)`/gim, '<code>$1</code>')
        // Links
        .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener">$1</a>')
        // Images
        .replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" loading="lazy">')
        // Horizontal rule
        .replace(/^---$/gim, '<hr>')
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        // Unordered lists
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        // Ordered lists
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        // Tables
        .replace(/\|(.+)\|/g, (match) => {
            const cells = match.split('|').filter(cell => cell.trim());
            if (cells.every(cell => /^[-:\s]+$/.test(cell))) {
                return ''; // Skip separator row
            }
            const tag = 'td';
            return '<tr>' + cells.map(cell => `<${tag}>${cell.trim()}</${tag}>`).join('') + '</tr>';
        })
        // Paragraphs
        .replace(/\n\n/gim, '</p><p>')
        // Line breaks
        .replace(/\n/gim, '<br>');

    // Wrap lists
    html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');

    // Wrap tables
    html = html.replace(/(<tr>.*<\/tr>)/gims, '<table>$1</table>');

    // Merge consecutive blockquotes
    html = html.replace(/<\/blockquote><br><blockquote>/gim, '<br>');

    return '<p>' + html + '</p>';
}

/* Escape HTML for code blocks */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/* Simple Syntax Highlighting */
function highlightCodeBlocks() {
    const codeBlocks = document.querySelectorAll('pre.code-block code');

    codeBlocks.forEach(block => {
        let html = block.innerHTML;

        // Keywords
        const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'async', 'await', 'try', 'catch', 'throw', 'new', 'this', 'extends', 'default', 'switch', 'case', 'break', 'continue', 'typeof', 'instanceof'];
        keywords.forEach(kw => {
            const regex = new RegExp(`\\b(${kw})\\b`, 'g');
            html = html.replace(regex, '<span class="code-keyword">$1</span>');
        });

        // Strings
        html = html.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="code-string">$&</span>');

        // Numbers
        html = html.replace(/\b(\d+)\b/g, '<span class="code-number">$1</span>');

        // Comments
        html = html.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>');
        html = html.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');

        block.innerHTML = html;
    });
}
