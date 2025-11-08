// [file name]: api.js
// [file content begin]
const BASE_URL = "https://bitykart-backend-production.up.railway.app";

// Authentication API calls
async function registerUser(userData) {
    try {
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

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

async function loginUser(credentials) {
    try {
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

        const data = await response.json();
        return data;
    } catch (error) {
        throw error;
    }
}

async function getUserProfile() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch(`${BASE_URL}/users/validate`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user profile');
        }

        const user = await response.json();
        return user;
    } catch (error) {
        throw error;
    }
}

// Order API calls
async function placeOrder(orderData) {
    try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!token || !currentUser) {
            throw new Error('User not authenticated');
        }

        const response = await fetch(`${BASE_URL}/orders/place/${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        if (!response.ok) {
            throw new Error('Failed to place order');
        }

        const order = await response.json();
        return order;
    } catch (error) {
        throw error;
    }
}

async function getUserOrders() {
    try {
        const token = localStorage.getItem('token');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!token || !currentUser) {
            throw new Error('User not authenticated');
        }

        const response = await fetch(`${BASE_URL}/orders/user/${currentUser.id}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }

        const orders = await response.json();
        return orders;
    } catch (error) {
        throw error;
    }
}

// Product API call (existing but enhanced)
async function loadProducts() {
    try {
        const response = await fetch(`${BASE_URL}/products`);
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        const products = await response.json();

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

        console.log("Products data:", products);

        // Get first 6 products for trending
        const trendingProducts = products.slice(0, 6);

        // Create product card with dynamic button
        function createProductCard(product) {
            console.log(`Creating card for: ${product.name}, Price: ${product.price}, Type: ${typeof product.price}`);
            
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
        console.log("Error fetching products:", error);
        showNotification('Error loading products. Please try again.');
    }
}
// [file content end]