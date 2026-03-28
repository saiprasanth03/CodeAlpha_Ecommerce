const app = {
    state: {
        products: [],
        cart: JSON.parse(localStorage.getItem('cart') || '[]'),
        user: JSON.parse(localStorage.getItem('user') || 'null'),
        currentView: 'home'
    },

    init() {
        this.render();
        this.loadProducts();
        this.updateCartCount();
        this.updateNavbar();
    },

    async loadProducts() {
        try {
            const res = await fetch('/api/products');
            this.state.products = await res.json();
            if (this.state.currentView === 'shop') this.renderShop();
        } catch (err) {
            console.error('Failed to load products', err);
        }
    },

    navigate(view, params = {}) {
        this.state.currentView = view;
        this.state.params = params;
        this.render();
        window.scrollTo(0, 0);
    },

    updateNavbar() {
        const authLinks = document.getElementById('auth-links');
        if (this.state.user) {
            authLinks.innerHTML = `
                <span class="user-greeting">Hi, ${this.state.user.username.split('@')[0]}</span>
                <a onclick="app.logout()">Logout</a>
            `;
        } else {
            authLinks.innerHTML = `
                <a onclick="app.navigate('login')">Login</a>
                <a onclick="app.navigate('register')">Register</a>
            `;
        }
    },

    updateCartCount() {
        const count = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelector('.cart-count').textContent = count;
    },

    render() {
        const main = document.getElementById('app');
        main.innerHTML = '';
        main.className = 'fade-in';

        switch (this.state.currentView) {
            case 'home': this.renderHome(main); break;
            case 'shop': this.renderShop(main); break;
            case 'product': this.renderProductDetails(main, this.state.params.id); break;
            case 'cart': this.renderCart(main); break;
            case 'login': this.renderLogin(main); break;
            case 'register': this.renderRegister(main); break;
            case 'checkout': this.renderCheckout(main); break;
        }
    },

    renderHome(container) {
        container.innerHTML = `
            <div class="hero">
                <h1 style="font-size: 4rem; margin-bottom: 1rem; font-weight: 800;">Experience Pure <span style="color: var(--primary);">Elegance</span></h1>
                <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2rem; max-width: 600px;">
                    Discover our curated collection of premium essentials designed for the modern lifestyle.
                </p>
                <button class="btn btn-primary" onclick="app.navigate('shop')">Shop Collection</button>
            </div>
            <style>
                .hero {
                    height: 80vh;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    background: radial-gradient(circle at center, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
                }
            </style>
        `;
    },

    renderShop(container) {
        container.innerHTML = `
            <h2 style="margin-bottom: 2rem; font-size: 2.5rem;">Our Collection</h2>
            <div class="product-grid">
                ${this.state.products.map(p => `
                    <div class="product-card" onclick="app.navigate('product', {id: ${p.id}})">
                        <img src="${p.image_url}" class="product-image" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800'; this.onerror=null;">
                        <div class="product-info">
                            <div class="product-category">${p.category}</div>
                            <div class="product-name">${p.name}</div>
                            <div class="product-price">₹${p.price.toLocaleString('en-IN')}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderProductDetails(container, id) {
        const product = this.state.products.find(p => p.id == id);
        if (!product) return container.innerHTML = '<h2>Product not found</h2>';

        container.innerHTML = `
            <div class="product-details-container" style="display: flex; gap: 4rem; align-items: flex-start; margin-top: 3rem;">
                <img src="${product.image_url}" style="width: 50%; border-radius: 2rem; box-shadow: var(--shadow);" onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800'; this.onerror=null;">
                <div style="flex: 1;">
                    <div class="product-category">${product.category}</div>
                    <h1 style="font-size: 3rem; margin-bottom: 1rem;">${product.name}</h1>
                    <p style="font-size: 1.2rem; color: var(--text-muted); margin-bottom: 2rem;">${product.description}</p>
                    <div style="font-size: 2rem; font-weight: bold; margin-bottom: 2rem;">₹${product.price.toLocaleString('en-IN')}</div>
                    <button class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.1rem;" onclick="app.addToCart(${product.id})">Add to Cart</button>
                </div>
            </div>
        `;
    },

    addToCart(productId) {
        const product = this.state.products.find(p => p.id == productId);
        const existing = this.state.cart.find(item => item.id == productId);
        
        if (existing) {
            existing.quantity++;
        } else {
            this.state.cart.push({ ...product, quantity: 1 });
        }

        saveCart();
        this.showNotification(`Added ${product.name} to cart`);
        this.updateCartCount();
    },

    renderCart(container) {
        if (this.state.cart.length === 0) {
            return container.innerHTML = `
                <div style="text-align: center; margin-top: 5rem;">
                    <h2>Your cart is empty</h2>
                    <br>
                    <button class="btn btn-primary" onclick="app.navigate('shop')">Explore Shop</button>
                </div>
            `;
        }

        const total = this.state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        container.innerHTML = `
            <h1 style="margin-bottom: 2rem;">Your Cart</h1>
            <div class="cart-view-container" style="display: flex; gap: 3rem;">
                <div style="flex: 2;">
                    ${this.state.cart.map(item => `
                        <div class="cart-item">
                            <div style="display: flex; gap: 1rem;">
                                <img src="${item.image_url}" onerror="this.src='https://images.unsplash.com/photo-1560393464-5c69a73c5770?w=800'; this.onerror=null;">
                                <div>
                                    <h3>${item.name}</h3>
                                    <p style="color: var(--text-muted)">₹${item.price.toLocaleString('en-IN')} x ${item.quantity}</p>
                                </div>
                            </div>
                            <div style="font-weight: bold;">₹${(item.price * item.quantity).toLocaleString('en-IN')}</div>
                        </div>
                    `).join('')}
                </div>
                <div style="flex: 1; background: var(--glass); padding: 2rem; border-radius: 1.5rem; height: fit-content;">
                    <h2 style="margin-bottom: 1.5rem;">Summary</h2>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                        <span>Subtotal</span>
                        <span>₹${total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem; margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                        <span>Total</span>
                        <span>₹${total.toLocaleString('en-IN')}</span>
                    </div>
                    <button class="btn btn-primary" style="width: 100%; margin-top: 2rem;" onclick="app.navigate('checkout')">Proceed to Checkout</button>
                </div>
            </div>
        `;
    },

    // --- AUTH VIEWS ---
    renderLogin(container) {
        container.innerHTML = `
            <div class="auth-container">
                <h2 style="margin-bottom: 1.5rem;">Login</h2>
                <form onsubmit="app.handleLogin(event)">
                    <div class="form-group">
                        <label>Username or Email</label>
                        <input type="text" id="login-username" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="login-password" required>
                    </div>
                    <button class="btn btn-primary" style="width: 100%;">Login</button>
                </form>
                <p style="margin-top: 1.5rem; text-align: center; color: var(--text-muted);">
                    Don't have an account? <a onclick="app.navigate('register')" style="color: var(--primary); cursor: pointer;">Register</a>
                </p>
            </div>
        `;
    },

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (res.ok) {
                this.state.user = { username, token: data.token };
                localStorage.setItem('user', JSON.stringify(this.state.user));
                this.showNotification('Successfully logged in!');
                this.updateNavbar();
                this.navigate('home');
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    },

    logout() {
        this.state.user = null;
        localStorage.removeItem('user');
        this.updateNavbar();
        this.showNotification('Logged out successfully');
        this.navigate('home');
    },

    // --- HELPERS ---
    showNotification(msg) {
        const div = document.getElementById('notification');
        div.textContent = msg;
        div.classList.add('show');
        setTimeout(() => div.classList.remove('show'), 3000);
    }
};

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(app.state.cart));
}

// Checkout Implementation
app.renderCheckout = function(container) {
    if (!this.state.user) {
        this.showNotification('Please login to checkout');
        return this.navigate('login');
    }

    const total = this.state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    container.innerHTML = `
        <div class="auth-container" style="max-width: 600px;">
            <h2 style="margin-bottom: 1.5rem;">Review Order</h2>
            <div style="margin-bottom: 2rem;">
                ${this.state.cart.map(item => `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; color: var(--text-muted);">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                `).join('')}
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem; margin-top: 1rem; border-top: 1px solid var(--border); padding-top: 1rem;">
                    <span>Total</span>
                    <span>₹${total.toLocaleString('en-IN')}</span>
                </div>
            </div>
            <button class="btn btn-primary" style="width: 100%;" onclick="app.processOrder()">Confirm and Place Order</button>
        </div>
    `;
};

app.processOrder = async function() {
    const total = this.state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const items = this.state.cart.map(item => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.price
    }));

    try {
        const res = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.state.user.token}`
            },
            body: JSON.stringify({ items, total })
        });

        if (res.ok) {
            this.state.cart = [];
            saveCart();
            this.updateCartCount();
            document.getElementById('app').innerHTML = `
                <div style="text-align: center; margin-top: 5rem;" class="fade-in">
                    <h2 style="font-size: 3rem;">Order Placed! 🎉</h2>
                    <p style="color: var(--text-muted); margin-top: 1rem;">Thank you for your purchase. We'll send you an update when it's shipped.</p>
                    <br>
                    <button class="btn btn-primary" onclick="app.navigate('home')">Back to Home</button>
                </div>
            `;
        } else {
            const data = await res.json();
            alert('Order failed: ' + data.message);
        }
    } catch (err) {
        console.error(err);
    }
};

app.renderRegister = function(container) {
    container.innerHTML = `
        <div class="auth-container">
            <h2 style="margin-bottom: 1.5rem;">Register</h2>
            <form onsubmit="app.handleRegister(event)">
                <div class="form-group">
                    <label>Username</label>
                    <input type="text" id="reg-username" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="reg-email" required>
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" id="reg-password" required>
                </div>
                <button class="btn btn-primary" style="width: 100%;">Create Account</button>
            </form>
            <p style="margin-top: 1.5rem; text-align: center; color: var(--text-muted);">
                Already have an account? <a onclick="app.navigate('login')" style="color: var(--primary); cursor: pointer;">Login</a>
            </p>
        </div>
    `;
};

app.handleRegister = async function(e) {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (res.ok) {
            this.showNotification('Registration successful! Please login.');
            this.navigate('login');
        } else {
            alert(data.message);
        }
    } catch (err) {
        console.error(err);
    }
};

app.init();
window.app = app;
