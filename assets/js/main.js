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
        blog: '#blog-preview'
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
            <button class="btn btn--primary service-card__action">Enroll Now</button>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Renders the Blog Preview section.
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
            <a href="${post.link}" class="link link--arrow">Read More &rarr;</a>
        </div>
    `).join('');

    container.innerHTML = html;
}

/**
 * Initialize the application.
 * Orchestrates parallel data fetching and rendering.
 */
async function init() {
    console.log("System initialized. Welcome to Munificent.");

    // Fetch all data in parallel
    const [teamData, productsData, blogData] = await Promise.all([
        fetchData(CONFIG.paths.team),
        fetchData(CONFIG.paths.products),
        fetchData(CONFIG.paths.blog)
    ]);

    // Render components
    renderTeam(teamData);
    renderServices(productsData);
    renderBlog(blogData);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupModal();
});

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
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            emailjs.sendForm('contact_service', 'contact_form', this)
                .then(() => {
                    console.log('SUCCESS!');
                    alert("Message Sent! We will be in touch shortly.");
                    closeModal();
                    form.reset();
                }, (error) => {
                    console.log('FAILED...', error);
                    alert("Failed to send message. Please try again later.");
                })
                .finally(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }
}
