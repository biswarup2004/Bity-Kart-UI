
const BASE_URL = "https://tea-library.onrender.com";

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
}

// Authentication API calls
async function registerUser(userData) {
    try {
        console.log('Registering user:', userData.email);
        const response = await fetch(`${BASE_URL}/users/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

async function loginUser(credentials) {
    try {
        console.log('Logging in user:', credentials.email);
        const response = await fetch(`${BASE_URL}/users/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

// Fixed getUserProfile function
async function getUserProfile() {
    try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!token || !currentUser) {
            throw new Error('No authentication token or user data found');
        }

        console.log('Fetching user profile for ID:', currentUser.id);
        
        // Try multiple endpoints - different APIs might use different endpoints
        let response;
        
        // Try endpoint with user ID first
        try {
            response = await fetch(`${BASE_URL}/users/${currentUser.id}`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
        } catch (error) {
            console.log('First endpoint failed, trying validate endpoint...');
            // Try validate endpoint as fallback
            response = await fetch(`${BASE_URL}/users/validate`, {
                method: 'GET',
                headers: getAuthHeaders()
            });
        }

        console.log('Profile response status:', response.status);
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.log('Authentication failed - clearing user data');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                throw new Error('Session expired. Please sign in again.');
            }
            
            const errorText = await response.text();
            console.error('Profile fetch error:', errorText);
            throw new Error(`Failed to fetch user profile: ${response.status}`);
        }

        const userData = await response.json();
        console.log('User profile fetched successfully:', userData);
        return userData;
    } catch (error) {
        console.error('Get user profile error:', error);
        
        // If we can't get fresh data, return the stored user data as fallback
        const storedUser = JSON.parse(localStorage.getItem('currentUser'));
        if (storedUser) {
            console.log('Using stored user data as fallback');
            return storedUser;
        }
        
        throw error;
    }
}

// Enhanced Order API calls with better error handling
async function placeOrder(orderData) {
    try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!token || !currentUser) {
            throw new Error('User not authenticated. Please sign in again.');
        }

        console.log('=== PLACE ORDER REQUEST ===');
        console.log('User ID:', currentUser.id);
        console.log('Order Data:', orderData);

        const response = await fetch(`${BASE_URL}/orders/place/${currentUser.id}`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Order placement failed:', errorText);
            throw new Error('Failed to place order: ' + response.status);
        }

        const order = await response.json();
        console.log('Order placed successfully:', order);
        return order;
    } catch (error) {
        console.error('Place order error:', error);
        throw error;
    }
}

async function getUserOrders() {
    try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!token || !currentUser) {
            throw new Error('User not authenticated. Please sign in again.');
        }

        console.log('=== GET USER ORDERS REQUEST ===');
        console.log('User ID:', currentUser.id);
        console.log('Token exists:', !!token);
        console.log('API URL:', `${BASE_URL}/orders/user/${currentUser.id}`);

        const response = await fetch(`${BASE_URL}/orders/user/${currentUser.id}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });

        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.log('Authentication failed - clearing user data');
                localStorage.removeItem('currentUser');
                localStorage.removeItem('token');
                throw new Error('Session expired. Please sign in again.');
            }
            
            // If no orders found, return empty array instead of error
            if (response.status === 404) {
                console.log('No orders found for user');
                return [];
            }
            
            throw new Error(`Failed to fetch orders: ${response.status}`);
        }

        const orders = await response.json();
        console.log('Orders fetched successfully:', orders.length, 'orders');
        return orders;
    } catch (error) {
        console.error('Get user orders error:', error);
        
        // If authentication fails, clear storage and notify
        if (error.message.includes('Session expired') || 
            error.message.includes('401') || 
            error.message.includes('403')) {
            showNotification('Session expired. Please sign in again.');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
        
        // Return empty array for other errors to prevent page break
        console.log('Returning empty orders array due to error');
        return [];
    }
}

// Payment API calls
async function processPaymentAPI(paymentData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('User not authenticated');
        }

        console.log('Processing payment:', paymentData);

        const response = await fetch(`${BASE_URL}/payments/process`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Payment failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Payment processing error:', error);
        throw error;
    }
}

// Product API call
async function loadProducts() {
    try {
        console.log('Fetching products from:', `${BASE_URL}/products`);
        const response = await fetch(`${BASE_URL}/products`);
        
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        const products = await response.json();
        console.log('Products loaded:', products.length);

        let trendingList = document.getElementById("trending-products");
        let teaList = document.getElementById("tea-products");
        let coffeeList = document.getElementById("coffee-products");
        let chipsList = document.getElementById("chips-products");
        let coldDrinksList = document.getElementById("colddrinks-products");
        let dryFruitsList = document.getElementById("dryfruits-products");
        let saltList = document.getElementById("salt-products");
        let sugarList = document.getElementById("sugar-products");

        if (trendingList) trendingList.innerHTML = "";
        if (teaList) teaList.innerHTML = "";
        if (coffeeList) coffeeList.innerHTML = "";
        if (chipsList) chipsList.innerHTML = "";
        if (coldDrinksList) coldDrinksList.innerHTML = "";
        if (dryFruitsList) dryFruitsList.innerHTML = "";
        if (saltList) saltList.innerHTML = "";
        if (sugarList) sugarList.innerHTML = "";

        // Get first 6 products for trending
        const trendingProducts = products.slice(0, 6);

        // Create product card with dynamic button
        function createProductCard(product) {
            let cart = JSON.parse(localStorage.getItem("cart")) || [];
            let cartItem = cart.find(item => item.id === product.id);
            
            let buttonContent = '';
            if (cartItem && cartItem.quantity > 0) {
                buttonContent = `
                    <div class="quantity-controls">
                        <button class="btn-quantity" onclick="event.stopPropagation(); decrementCart(${product.id})">−</button>
                        <span class="quantity-display">${cartItem.quantity}</span>
                        <button class="btn-quantity" onclick="event.stopPropagation(); incrementCart(${product.id})">+</button>
                    </div>
                `;
            } else {
                buttonContent = `<i class="fas fa-plus"></i> Add to Cart`;
            }
            
            return `
            <div class="product-card">
                <img src="${product.imageUrl}" class="product-image" alt="${product.name}">
                <div class="product-info">
                    <h3 class="product-title">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-bottom-section">
                        <div class="product-price">₹${product.price}</div>
                        <button class="add-to-cart" data-product-id="${product.id}" onclick="addToCart(${product.id}, '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.imageUrl}')">
                            ${buttonContent}
                        </button>
                    </div>
                </div>
            </div>
            `;
        }

        products.forEach((product) => {
            let productCard = createProductCard(product);

            if (product.category === "Tea" && teaList) {
                teaList.innerHTML += productCard;
            }
            else if (product.category === "coffee" && coffeeList) {
                coffeeList.innerHTML += productCard;
            }
            else if (product.category === "chips" && chipsList) {
                chipsList.innerHTML += productCard;
            }
            else if (product.category === "cold-drinks" && coldDrinksList) {
                coldDrinksList.innerHTML += productCard;
            }
            else if (product.category === "dry-fruits" && dryFruitsList) {
                dryFruitsList.innerHTML += productCard;
            }
            else if (product.category === "salt" && saltList) {
                saltList.innerHTML += productCard;
            }
            else if (product.category === "sugar" && sugarList) {
                sugarList.innerHTML += productCard;
            }
        });

        if (trendingList) {
            trendingProducts.forEach((product) => {
                let productCard = createProductCard(product);
                trendingList.innerHTML += productCard;
            });
        }

        updateAllProductButtons();

    } catch (error) {
        console.error("Error fetching products:", error);
        showNotification('Error loading products. Please try again.');
    }
}

// Debug function
function debugAuth() {
    console.log('=== AUTHENTICATION DEBUG ===');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('currentUser');
    console.log('Token exists:', !!token);
    console.log('Token preview:', token ? token.substring(0, 30) + '...' : 'none');
    console.log('Current User:', user ? JSON.parse(user) : 'none');
    console.log('Base URL:', BASE_URL);
}

// Make debugAuth available globally
window.debugAuth = debugAuth;
