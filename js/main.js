let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let currentSlideIndex = 0;
const totalSlides = 3;

// Utility function to get first name only
function getFirstName(fullName) {
    if (!fullName) return 'User';
    // Split by space and take first part only
    return fullName.split(' ')[0];
}

// Carousel functionality
function changeSlide(direction) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    slides[currentSlideIndex].classList.remove('active');
    indicators[currentSlideIndex].classList.remove('active');
    
    currentSlideIndex += direction;
    
    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = totalSlides - 1;
    }
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
}

function currentSlide(slideIndex) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    currentSlideIndex = slideIndex - 1;
    
    slides[currentSlideIndex].classList.add('active');
    indicators[currentSlideIndex].classList.add('active');
}

function startCarouselAutoPlay() {
    setInterval(() => {
        changeSlide(1);
    }, 5000);
}

// Enhanced page navigation with history management
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    // Add to browser history
    if (history.pushState) {
        history.pushState({page: pageId}, '', `#${pageId}`);
    }
    
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
        page.style.display = 'none';
    });
    
    const selectedPage = document.getElementById(pageId);
    if (selectedPage) {
        selectedPage.classList.add('active');
        selectedPage.style.display = 'block';
        
        // Scroll to top when changing pages
        window.scrollTo(0, 0);
        
        // Load specific page content
        if (pageId === 'cart') {
            loadCart();
        } else if (pageId === 'profile') {
            loadUserProfile();
        } else if (pageId === 'orders') {
            loadUserOrders();
        } else if (pageId === 'home') {
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.value = '';
            }
            showAllSections();
        }
    }
}

// Handle browser back button
window.addEventListener('popstate', function(event) {
    const pageId = event.state ? event.state.page : 'home';
    showPage(pageId);
});

// Handle initial page load with hash
function handleInitialPageLoad() {
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'cart', 'profile', 'orders'];
    
    if (hash && validPages.includes(hash)) {
        showPage(hash);
    } else {
        showPage('home');
        // Set initial history state
        if (history.replaceState) {
            history.replaceState({page: 'home'}, '', '#home');
        }
    }
}

// Back navigation function
function goBack() {
    // Use history back or navigate to home
    if (history.length > 1) {
        history.back();
    } else {
        showPage('home');
    }
}

// Modal functions
function showModal(modalId) {
    const modal = document.getElementById(modalId + '-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId + '-modal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// User dropdown functionality
function toggleUserDropdown() {
    const dropdown = document.getElementById('user-dropdown');
    const profileDropdown = document.querySelector('.user-profile-dropdown');
    
    if (dropdown && profileDropdown) {
        dropdown.classList.toggle('active');
        profileDropdown.classList.toggle('active');
    }
}

// Enhanced Authentication functions
function setupAuthForms() {
    const signinForm = document.getElementById('signin-form');
    const signupForm = document.getElementById('signup-form');
    
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('signin-email').value;
            const password = document.getElementById('signin-password').value;
            
            if (email && password) {
                try {
                    const result = await loginUser({ email, password });
                    
                    // Store user data and token
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    localStorage.setItem('token', result.token);
                    
                    currentUser = result.user;
                    updateAuthUI();
                    closeModal('signin');
                    showNotification(`Welcome back, ${getFirstName(result.user.name)}!`);
                    
                    // Clear form
                    signinForm.reset();
                } catch (error) {
                    showNotification(error.message || 'Login failed. Please try again.');
                }
            }
        });
    }
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            
            if (name && email && password) {
                try {
                    const result = await registerUser({ name, email, password });
                    
                    // Store user data and token
                    localStorage.setItem('currentUser', JSON.stringify(result.user));
                    localStorage.setItem('token', result.token);
                    
                    currentUser = result.user;
                    updateAuthUI();
                    closeModal('signup');
                    showNotification(`Welcome to 𝗕𝗶𝘁𝘆 𝗞𝗮𝗿𝘁, ${getFirstName(result.user.name)}!`);
                    
                    // Clear form
                    signupForm.reset();
                } catch (error) {
                    showNotification(error.message || 'Registration failed. Please try again.');
                }
            }
        });
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    localStorage.removeItem('cart');
    updateAuthUI();
    updateCartCount();
    loadCart();
    updateAllProductButtons();
    showNotification('Logged out successfully!');
    
    const currentPage = document.querySelector('.page.active');
    if (currentPage && (currentPage.id === 'profile' || currentPage.id === 'orders')) {
        showPage('home');
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    const userName = document.getElementById('user-name');
    
    if (currentUser) {
        if (authButtons) authButtons.style.display = 'none';
        if (userMenu) userMenu.style.display = 'block';
        if (userName) {
            // Show only first name
            const firstName = getFirstName(currentUser.name);
            userName.textContent = `Hi, ${firstName}!`;
        }
        updateProfileInfo(currentUser);
    } else {
        if (authButtons) authButtons.style.display = 'flex';
        if (userMenu) userMenu.style.display = 'none';
    }
}

function updateProfileInfo(user) {
    const profileDisplayName = document.getElementById('profile-display-name');
    const profileDisplayEmail = document.getElementById('profile-display-email');
    const detailName = document.getElementById('detail-name');
    const detailEmail = document.getElementById('detail-email');
    
    // Show only first name in profile display
    const firstName = getFirstName(user.name);
    if (profileDisplayName) profileDisplayName.textContent = firstName;
    if (profileDisplayEmail) profileDisplayEmail.textContent = user.email;
    if (detailName) detailName.textContent = user.name; // Keep full name in details
    if (detailEmail) detailEmail.textContent = user.email;
    
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    
    // Show only first name in dropdown
    if (profileName) profileName.textContent = firstName;
    if (profileEmail) profileEmail.textContent = user.email;
}

// Load user profile from backend
async function loadUserProfile() {
    try {
        const user = await getUserProfile();
        updateProfileInfo(user);
        
        // Update profile stats if needed
        const statNumber = document.querySelector('.stat-number');
        if (statNumber) {
            // You can fetch actual order count from backend here
            statNumber.textContent = '0'; // Placeholder
        }
    } catch (error) {
        showNotification('Failed to load profile data');
        console.error('Profile load error:', error);
    }
}

// Load user orders from backend
async function loadUserOrders() {
    try {
        const orders = await getUserOrders();
        displayOrders(orders);
    } catch (error) {
        showNotification('Failed to load orders');
        console.error('Orders load error:', error);
        
        // Show empty state or redirect
        const ordersContainer = document.querySelector('.orders-container');
        if (ordersContainer) {
            ordersContainer.innerHTML = '<p style="text-align: center; color: white;">Failed to load orders. Please try again.</p>';
        }
    }
}

function displayOrders(orders) {
    const ordersContainer = document.querySelector('.orders-container');
    if (!ordersContainer) return;

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p style="text-align: center; color: white;">No orders found.</p>';
        return;
    }

    ordersContainer.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-id">Order #BK${order.id}</div>
                <div class="order-status status-${order.status ? order.status.toLowerCase() : 'pending'}">
                    ${order.status || 'Processing'}
                </div>
            </div>
            <div class="order-items">
                ${order.orderItems && order.orderItems.length > 0 ? `
                    <img src="${order.orderItems[0].imageUrl || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60&h=60&fit=crop'}" alt="Product">
                    <div class="order-details">
                        <h4>${order.orderItems[0].productName || 'Product'}</h4>
                        <p>${order.orderItems.length} item(s)</p>
                        <p class="order-date">Ordered on ${new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                ` : `
                    <img src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=60&h=60&fit=crop" alt="Product">
                    <div class="order-details">
                        <h4>Order Items</h4>
                        <p>Multiple items</p>
                        <p class="order-date">Ordered on ${new Date(order.orderDate).toLocaleDateString()}</p>
                    </div>
                `}
                <div class="order-amount">₹${order.totalAmount}</div>
            </div>
            <div class="order-actions">
                <button class="btn btn-outline btn-small" onclick="viewOrderDetails(${order.id})">View Details</button>
                <button class="btn btn-primary btn-small" onclick="reorder(${order.id})">Reorder</button>
            </div>
        </div>
    `).join('');
}

function viewOrderDetails(orderId) {
    showNotification('Order details functionality coming soon!');
}

function reorder(orderId) {
    showNotification('Reorder functionality coming soon!');
}

function showSettings() {
    showNotification('Settings functionality coming soon!');
    toggleUserDropdown();
}

function editProfile() {
    showNotification('Edit profile functionality coming soon!');
}

// Enhanced mobile menu functionality
function setupMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        // Toggle mobile menu
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('mobile-active');
            
            // Change icon
            const icon = this.querySelector('i');
            if (navLinks.classList.contains('mobile-active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Close menu when clicking on a link
        const navLinksItems = navLinks.querySelectorAll('a');
        navLinksItems.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('mobile-active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            });
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && 
                !mobileMenuBtn.contains(e.target) &&
                navLinks.classList.contains('mobile-active')) {
                navLinks.classList.remove('mobile-active');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
        
        // Prevent clicks inside nav from closing menu
        navLinks.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }
}

// Enhanced mobile search functionality
function setupMobileSearch() {
    const mobileSearchBtn = document.querySelector('.mobile-search-btn');
    
    if (mobileSearchBtn) {
        mobileSearchBtn.addEventListener('click', function() {
            showMobileSearch();
        });
    }
}

function showMobileSearch() {
    // Create mobile search overlay
    const searchOverlay = document.createElement('div');
    searchOverlay.className = 'mobile-search-overlay';
    searchOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.95);
        z-index: 3000;
        display: flex;
        flex-direction: column;
        padding: 2rem;
        animation: fadeIn 0.3s ease;
    `;

    // Search header
    const searchHeader = document.createElement('div');
    searchHeader.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    `;

    const searchTitle = document.createElement('h3');
    searchTitle.textContent = 'Search Products';
    searchTitle.style.cssText = `
        color: white;
        margin: 0;
        font-size: 1.5rem;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.8rem;
        cursor: pointer;
        padding: 0.5rem;
    `;

    // Search input container
    const searchContainer = document.createElement('div');
    searchContainer.style.cssText = `
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    `;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search products...';
    searchInput.style.cssText = `
        flex: 1;
        padding: 1rem;
        border: 2px solid #e5e7eb;
        border-radius: 25px;
        font-size: 1rem;
        background: white;
    `;

    const searchBtn = document.createElement('button');
    searchBtn.innerHTML = '<i class="fas fa-search"></i>';
    searchBtn.style.cssText = `
        padding: 1rem 1.5rem;
        background: var(--primary);
        color: white;
        border: none;
        border-radius: 25px;
        cursor: pointer;
        font-size: 1.2rem;
    `;

    // Results container
    const resultsContainer = document.createElement('div');
    resultsContainer.id = 'mobile-search-results';
    resultsContainer.style.cssText = `
        flex: 1;
        overflow-y: auto;
        background: white;
        border-radius: 10px;
        padding: 1rem;
    `;

    // Assemble overlay
    searchHeader.appendChild(searchTitle);
    searchHeader.appendChild(closeBtn);
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchBtn);
    
    searchOverlay.appendChild(searchHeader);
    searchOverlay.appendChild(searchContainer);
    searchOverlay.appendChild(resultsContainer);
    
    document.body.appendChild(searchOverlay);

    // Focus on input
    setTimeout(() => searchInput.focus(), 100);

    // Event handlers
    closeBtn.addEventListener('click', function() {
        searchOverlay.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(searchOverlay)) {
                document.body.removeChild(searchOverlay);
            }
        }, 300);
    });

    searchBtn.addEventListener('click', function() {
        performMobileSearch(searchInput.value, resultsContainer);
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performMobileSearch(searchInput.value, resultsContainer);
        }
    });

    // Close on overlay background click
    searchOverlay.addEventListener('click', function(e) {
        if (e.target === searchOverlay) {
            searchOverlay.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(searchOverlay)) {
                    document.body.removeChild(searchOverlay);
                }
            }, 300);
        }
    });
}

function performMobileSearch(searchTerm, resultsContainer) {
    if (!searchTerm.trim()) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Please enter a search term</p>';
        return;
    }

    const allProducts = document.querySelectorAll('.product-card');
    const matchedProducts = [];

    allProducts.forEach(card => {
        const title = card.querySelector('.product-title');
        const description = card.querySelector('.product-description');

        if (title && description) {
            const titleText = title.textContent.toLowerCase();
            const descText = description.textContent.toLowerCase();

            if (titleText.includes(searchTerm.toLowerCase()) || descText.includes(searchTerm.toLowerCase())) {
                matchedProducts.push(card.cloneNode(true));
            }
        }
    });

    if (matchedProducts.length === 0) {
        resultsContainer.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">No products found matching your search.</p>';
    } else {
        resultsContainer.innerHTML = `
            <h4 style="margin-bottom: 1rem; color: var(--dark); font-size: 1.2rem;">Found ${matchedProducts.length} product(s)</h4>
            <div style="display: grid; gap: 1rem;">
                ${matchedProducts.map(product => product.outerHTML).join('')}
            </div>
        `;
        
        // Reattach event listeners to the cloned product cards
        setTimeout(() => {
            if (typeof updateAllProductButtons === 'function') {
                updateAllProductButtons();
            }
        }, 100);
    }
}

// Search functionality
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        showAllSections();
        return;
    }
    
    hideAllSections();
    showSearchResults(searchTerm);
}

function hideAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
        carousel.style.display = 'none';
    }
    
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.display = 'none';
    }
}

function showAllSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'block';
    });
    
    const carousel = document.getElementById('heroCarousel');
    if (carousel) {
        carousel.style.display = 'block';
    }
    
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.display = 'block';
    }
    
    const searchResults = document.getElementById('search-results-section');
    if (searchResults) {
        searchResults.remove();
    }
}

function showSearchResults(searchTerm) {
    const existingResults = document.getElementById('search-results-section');
    if (existingResults) {
        existingResults.remove();
    }

    const allProducts = document.querySelectorAll('.product-card');
    const matchedProducts = [];

    allProducts.forEach(card => {
        const title = card.querySelector('.product-title');
        const description = card.querySelector('.product-description');

        if (title && description) {
            const titleText = title.textContent.toLowerCase();
            const descText = description.textContent.toLowerCase();

            if (titleText.includes(searchTerm) || descText.includes(searchTerm)) {
                let category = 'Trending';
                const parent = card.closest('[id*="products"]');
                if (parent) {
                    if (parent.id.includes('tea')) category = 'Tea';
                    else if (parent.id.includes('coffee')) category = 'Coffee';
                    else if (parent.id.includes('chips')) category = 'Chips & Snacks';
                    else if (parent.id.includes('colddrinks')) category = 'Cold Drinks';
                    else if (parent.id.includes('dryfruits')) category = 'Dry Fruits';
                    else if (parent.id.includes('salt')) category = 'Salt';
                    else if (parent.id.includes('sugar')) category = 'Sugar';
                }

                matchedProducts.push({
                    element: card.cloneNode(true),
                    category: category
                });
            }
        }
    });

    const searchSection = document.createElement('section');
    searchSection.className = 'section';
    searchSection.id = 'search-results-section';

    const container = document.createElement('div');
    container.className = 'container';

    const title = document.createElement('h2');
    title.className = 'section-title';
    title.textContent = `Search Results for "${searchTerm}" (${matchedProducts.length} found)`;

    const resultsGrid = document.createElement('div');
    resultsGrid.className = 'search-results-grid';
    resultsGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 2rem;
        margin-bottom: 3rem;
        justify-items: center;
    `;

    matchedProducts.forEach(product => {
        const productWrapper = document.createElement('div');
        productWrapper.style.cssText = `
            width: 100%;
            max-width: 380px;
        `;

        const categoryLabel = document.createElement('div');
        categoryLabel.textContent = product.category;
        categoryLabel.style.cssText = `
            background: linear-gradient(135deg, var(--primary), var(--accent));
            color: white;
            padding: 0.3rem 0.8rem;
            border-radius: 12px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-align: center;
            width: fit-content;
            margin-left: auto;
            margin-right: auto;
        `;

        const clonedCard = product.element.cloneNode(true);
        clonedCard.style.cssText = `width: 100%;`;

        productWrapper.appendChild(categoryLabel);
        productWrapper.appendChild(clonedCard);
        resultsGrid.appendChild(productWrapper);
    });

    if (matchedProducts.length === 0) {
        resultsGrid.innerHTML = '<p style="text-align: center; color: white; font-size: 1.2rem; grid-column: 1 / -1;">No products found matching your search.</p>';
    }

    container.appendChild(title);
    container.appendChild(resultsGrid);
    searchSection.appendChild(container);

    const homePage = document.getElementById('home');
    if (homePage) {
        homePage.insertBefore(searchSection, homePage.firstChild);
    }
    
    // Update buttons in search results
    updateAllProductButtons();
}

// Notification system
function showNotification(message) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    });

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, var(--success), #059669);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        z-index: 3000;
        box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);
        animation: slideInRight 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const dropdown = document.getElementById('user-dropdown');
    const profileDropdown = document.querySelector('.user-profile-dropdown');
    
    if (dropdown && profileDropdown && !profileDropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        profileDropdown.classList.remove('active');
    }
    
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Handle escape key for navigation
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        goBack();
    }
});

// Add CSS for notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupAuthForms();
    updateAuthUI();
    updateCartCount();
    setupMobileMenu();
    setupMobileSearch();
    handleInitialPageLoad();
    
    startCarouselAutoPlay();
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
        
        searchInput.addEventListener('input', function(e) {
            if (e.target.value.trim() === '') {
                showAllSections();
            }
        });
    }
    
    // Load initial data
    if (typeof loadProducts === 'function') {
        loadProducts();
    }
    if (typeof loadCart === 'function') {
        loadCart();
    }
    
    console.log('Mobile navigation initialized');
});