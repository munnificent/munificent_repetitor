/**
 * Munificent - Main System Script
 * Handles dynamic content loading and application logic.
 */

// Configuration
const CONFIG = {
    paths: {
        team: 'data/team.json',
        products: 'data/products.json',
        blog: 'data/blog.json'
    },
    selectors: {
        team: '#team-container',
        services: '#services-container',
        blog: '#blog-preview',
        fullBlog: '#full-blog-list'
    }
};

/**
 * Generic helper to fetch and parse JSON data.
 * @param {string} url - The path to the JSON file.
 * @returns {Promise<any|null>} - The parsed data or null if invalid.
 */
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        return null;
    }
}

/**
 * Renders the Team section.
 * @param {Array} data - Array of team member objects.
 */
async function renderTeam(data) {
    const container = document.querySelector(CONFIG.selectors.team);
    if (!container || !data) return;

    const html = data.map(member => `
        <div class="card team-card">
            <div class="team-card__image-wrapper">
                <img src="${member.photo}" alt="${member.name}" class="team-card__image" loading="lazy">
            </div>
            <div class="team-card__content">
                <h3 class="team-card__name">${member.name}</h3>
                <span class="badge team-card__role">${member.role}</span>
                <p class="team-card__bio">${member.bio}</p>
                <div class="team-card__subjects">
                    ${member.subjects.map(subject => `<span class="tag">${subject}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Renders the Services/Products section.
 * @param {Array} data - Array of product objects.
 */
async function renderServices(data) {
    const container = document.querySelector(CONFIG.selectors.services);
    if (!container || !data) return;

    const html = data.map(product => `
        <div class="card service-card ${product.isPopular ? 'card--popular' : ''}">
            ${product.isPopular ? '<span class="badge badge--popular">Popular</span>' : ''}
            <h3 class="service-card__title">${product.title}</h3>
            <div class="service-card__price">${product.price}</div>
            <ul class="service-card__features">
                ${product.features.map(feature => `<li class="service-card__feature-item">${feature}</li>`).join('')}
            </ul>
            <a href="https://wa.me/77085365323?text=Здравствуйте!%20Хочу%20записаться%20на%20курс:%20${product.title}" target="_blank" class="btn btn--primary service-card__action">Записаться в WhatsApp</a>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Renders the Blog Preview section (Home).
 * @param {Array} data - Array of blog post objects.
 */
async function renderBlog(data) {
    const container = document.querySelector(CONFIG.selectors.blog);
    if (!container || !data) return;

    const html = data.map(post => `
        <div class="card blog-card">
            <div class="blog-card__header">
                <time class="blog-card__date" datetime="${post.date}">${post.date}</time>
                <div class="blog-card__tags">
                    ${post.tags.slice(0, 2).map(tag => `<span class="tag tag--small">${tag}</span>`).join('')}
                </div>
            </div>
            <h3 class="blog-card__title">${post.title}</h3>
            <p class="blog-card__excerpt">${post.excerpt}</p>
            <a href="${post.link}" class="link link--arrow">Читать далее &rarr;</a>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Renders the Full Blog List (Blog Archive).
 * @param {Array} data - Array of blog post objects.
 */
async function renderAllArticles(data) {
    const container = document.querySelector(CONFIG.selectors.fullBlog);
    if (!container || !data) return;

    const html = data.map(post => `
        <div class="card blog-card" style="display: flex; flex-direction: column; height: 100%;">
            <div class="blog-card__header">
                <time class="blog-card__date" datetime="${post.date}">${post.date}</time>
                <div class="blog-card__tags">
                    ${post.tags.map(tag => `<span class="tag tag--small">${tag}</span>`).join('')}
                </div>
            </div>
            <h3 class="blog-card__title" style="margin-top: auto; margin-bottom: 0.5rem;">${post.title}</h3>
            <p class="blog-card__excerpt" style="flex-grow: 1;">${post.excerpt}</p>
            <a href="${post.link}" class="link link--arrow" style="margin-top: 1rem;">Читать далее &rarr;</a>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Initializes the application based on current page.
 */
async function init() {
    console.log("System initialized. Welcome to Munificent.");

    if (window.location.pathname.includes('article.html')) {
        renderFullArticle();
    } else if (window.location.pathname.includes('blog.html')) {
        // Blog Archive Logic
        const blogData = await fetchData(CONFIG.paths.blog);
        renderAllArticles(blogData);
    } else {
        // Main Logic for Landing Page
        const teamContainer = document.querySelector(CONFIG.selectors.team);
        if (teamContainer) {
            const [teamData, productsData, blogData] = await Promise.all([
                fetchData(CONFIG.paths.team),
                fetchData(CONFIG.paths.products),
                fetchData(CONFIG.paths.blog)
            ]);

            renderTeam(teamData);
            renderServices(productsData);
            renderBlog(blogData);
        }
    }
}

/**
 * Renders a single full article page.
 */
function renderFullArticle() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = parseInt(urlParams.get('id'));

    if (!id) {
        document.getElementById('article-title').textContent = "Статья не найдена";
        return;
    }

    fetch('data/blog.json')
        .then(response => response.json())
        .then(data => {
            const post = data.find(p => p.id === id);
            if (post) {
                document.title = `${post.title} | Munificent`;
                document.getElementById('article-title').textContent = post.title;

                // Handle Hero Image
                const heroImageDiv = document.getElementById('article-hero-image');
                if (post.image && heroImageDiv) {
                    heroImageDiv.innerHTML = `<img src="${post.image}" alt="${post.title}" style="width:100%; border-radius:8px; margin-bottom:1rem;">`;
                } else if (heroImageDiv) {
                    heroImageDiv.style.display = 'none';
                }

                document.getElementById('article-meta').innerHTML = `
                    <span>${post.date}</span> | 
                    <span style="color: var(--accent);">${post.tags.join(', ')}</span>
                `;

                const shareBlock = `
                    <div class="share-block" style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid rgba(100, 255, 218, 0.1);">
                        <h4 style="margin-bottom: 1rem;">Понравилась статья? Поделись с друзьями:</h4>
                        <a href="https://wa.me/?text=Смотри крутую статью: ${window.location.href}" target="_blank" class="btn-share">WhatsApp</a>
                        <a href="https://t.me/share/url?url=${window.location.href}" target="_blank" class="btn-share">Telegram</a>
                    </div>
                `;
                document.getElementById('article-content').innerHTML = post.content + shareBlock;
            } else {
                document.getElementById('article-title').textContent = "Статья не найдена";
                document.getElementById('article-content').innerHTML = "<p>Запрашиваемый материал отсутствует в нашей базе.</p>";
            }
        })
        .catch(err => console.error('Failed to load article:', err));
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupModal();
    setupMobileMenu();
});

/**
 * Sets up the Mobile Menu toggle logic.
 */
function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuToggle.classList.toggle('open');
        });

        // Close menu when clicking a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                menuToggle.classList.remove('open');
            });
        });
    }
}

/**
 * Sets up the Modal interaction logic.
 */
function setupModal() {
    // Initialize EmailJS
    (function () {
        emailjs.init({
            publicKey: "YOUR_PUBLIC_KEY",
        });
    })();

    const modal = document.getElementById('modal');
    const openBtn = document.getElementById('openModalBtn');
    const closeBtn = document.querySelector('.close-btn');
    const form = document.getElementById('contact-form');

    if (!modal || !openBtn || !closeBtn) return;

    // Open Modal
    openBtn.addEventListener('click', () => {
        modal.style.display = 'block';
        // Small delay to allow display:block to apply before adding opacity class for transition
        setTimeout(() => {
            modal.classList.add('modal--open');
        }, 10);
    });

    // Close Modal Function
    const closeModal = () => {
        modal.classList.remove('modal--open');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300); // Wait for transition
    };

    closeBtn.addEventListener('click', closeModal);

    // Close on outside click
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Form Submission
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            // Generate a random contact number
            const contactNumberInput = this.querySelector('input[name="contact_number"]');
            if (contactNumberInput) {
                contactNumberInput.value = Math.random() * 100000 | 0;
            }

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Отправка...';
            submitBtn.disabled = true;

            emailjs.sendForm('contact_service', 'contact_form', this)
                .then(() => {
                    console.log('SUCCESS!');
                    alert("Сообщение отправлено! Мы скоро свяжемся с вами.");
                    closeModal();
                    form.reset();
                }, (error) => {
                    console.log('FAILED...', error);
                    alert("Ошибка отправки. Пожалуйста, попробуйте позже.");
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
}
