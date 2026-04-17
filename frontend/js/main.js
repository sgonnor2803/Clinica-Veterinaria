// ============ App State ============
let appState = {
    user: null,
    profile: null,
    products: [],
    pets: [],
    appointments: [],
    orders: [],
    cart: [],
};

// ============ Initialization ============
window.addEventListener('load', async () => {
    try {
        // Check if user is authenticated
        const token = localStorage.getItem('token');

        if (!token) {
            showAuthModal();
            return;
        }

        // Verify token and load user data
        await initializeApp();
    } catch (error) {
        console.error('Init error:', error);
        showAuthModal();
    }
});

async function initializeApp() {
    try {
        // Get user from Supabase session
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
            localStorage.removeItem('token');
            showAuthModal();
            return;
        }

        appState.user = {
            id: data.session.user.id,
            email: data.session.user.email,
        };

        auth.session = data.session;
        auth.user = appState.user;

        // Get user profile
        const profile = await auth.getProfile();
        appState.profile = profile;

        // Show app
        showApp();

        // Load initial data
        await loadDashboardData();
    } catch (error) {
        console.error('Init error:', error);
        showAuthModal();
    }
}

function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    // Update user info
    document.getElementById('userEmail').textContent = appState.user.email;
    const roleText = appState.profile?.role === 'admin' ? 'Administrador' :
                     appState.profile?.role === 'vet' ? 'Veterinario' : 'Cliente';
    document.getElementById('userRole').textContent = roleText;

    // Show/hide admin panel
    const adminPanel = document.getElementById('adminPanel');
    if (appState.profile?.role === 'admin' || appState.profile?.role === 'sales' || appState.profile?.role === 'vet') {
        adminPanel.classList.remove('hidden');
    } else {
        adminPanel.classList.add('hidden');
    }
}

// ============ Auth Handlers ============
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('loginError');

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        await auth.login(email, password);
        await initializeApp();
    } catch (error) {
        showError('loginError', error.message || 'Error al iniciar sesión');
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('signupError');

    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const role = document.getElementById('signupRole').value;

    if (password !== confirm) {
        showError('signupError', 'Las contraseñas no coinciden');
        return;
    }

    if (password.length < 6) {
        showError('signupError', 'La contraseña debe tener al menos 6 caracteres');
        return;
    }

    try {
        await auth.signup(email, password, role);
        await initializeApp();
    } catch (error) {
        showError('signupError', error.message || 'Error al registrarse');
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await auth.logout();
        showAuthModal();
        // Clear forms
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// ============ Dashboard ============
async function loadDashboardData() {
    try {
        const [products, pets] = await Promise.all([
            api.getProducts(),
            api.getPets(),
        ]);

        let appointments = [];
        let orders = [];

        if (appState.profile?.role === 'vet' || appState.profile?.role === 'admin') {
            appointments = await api.getAppointments();
        } else {
            appointments = await api.getMyAppointments();
            orders = await api.getOrders();
        }

        appState.products = products;
        appState.pets = pets;
        appState.appointments = appointments;
        appState.orders = orders;

        // Update dashboard counts
        document.getElementById('productCount').textContent = `${products.length} productos disponibles`;
        const unadopted = pets.filter(p => !p.adopted).length;
        document.getElementById('petsCount').textContent = `${unadopted} mascotas disponibles`;
        document.getElementById('appointmentsCount').textContent = `${appointments.length} citas registradas`;
        document.getElementById('ordersCount').textContent = `${orders.length} órdenes realizadas`;
    } catch (error) {
        console.error('Load dashboard error:', error);
    }
}

// ============ Products ============
async function loadProducts() {
    try {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '<p class="loading">Cargando productos...</p>';

        const products = await api.getProducts();
        appState.products = products;

        if (products.length === 0) {
            container.innerHTML = '<p class="text-center">No hay productos disponibles</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="card-body">
                    <h3>${product.name}</h3>
                    <p>${product.type}</p>
                    ${product.discountApplied ? `
                        <div class="card-discount">
                            ¡Descuento 20% por adopción!
                        </div>
                        <p class="card-price" style="text-decoration: line-through; color: var(--text-light);">
                            ${formatPrice(product.originalPrice)}
                        </p>
                    ` : ''}
                    <p class="card-price">${formatPrice(product.price)}</p>
                    <div class="card-actions">
                        <button class="btn btn-primary" onclick="addToCart(${product.id}, '${product.name}', ${product.price})">
                            Agregar al carrito
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load products error:', error);
        document.getElementById('productsContainer').innerHTML =
            `<p class="text-center">Error al cargar productos: ${error.message}</p>`;
    }
}

function addToCart(id, name, price) {
    appState.cart.push({ id, name, price });
    alert(`${name} agregado al carrito`);

    // Show buy modal
    const total = appState.cart.reduce((sum, item) => sum + item.price, 0);
    const html = appState.cart.map(item =>
        `<div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border);">
            <span>${item.name}</span>
            <span>${formatPrice(item.price)}</span>
        </div>`
    ).join('');

    document.getElementById('buyModalContent').innerHTML = html;
    document.getElementById('buyTotal').value = total;

    showModal('buyModal');
}

document.getElementById('buyForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    if (appState.cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    try {
        const total = appState.cart.reduce((sum, item) => sum + item.price, 0);
        await api.createOrder(total);

        appState.cart = [];
        closeModal('buyModal');
        alert('Compra realizada exitosamente');

        // Reload dashboard
        loadDashboardData();
    } catch (error) {
        alert('Error al procesar la compra: ' + error.message);
    }
});

// ============ Pets ============
async function loadPets() {
    try {
        const container = document.getElementById('petsContainer');
        container.innerHTML = '<p class="loading">Cargando mascotas...</p>';

        const pets = await api.getPets();
        appState.pets = pets;

        const unadopted = pets.filter(p => !p.adopted);

        if (unadopted.length === 0) {
            container.innerHTML = '<p class="text-center">No hay mascotas disponibles para adopción</p>';
            return;
        }

        container.innerHTML = unadopted.map(pet => `
            <div class="pet-card">
                <div class="card-body">
                    <h3>🐾 ${pet.name}</h3>
                    <p>${pet.type || 'Mascota'}</p>
                    <p style="color: var(--success); font-weight: 600;">Disponible para adopción</p>
                    <div class="card-actions">
                        <button class="btn btn-success" onclick="adoptPet(${pet.id}, '${pet.name}')">
                            Adoptar
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Load pets error:', error);
        document.getElementById('petsContainer').innerHTML =
            `<p class="text-center">Error al cargar mascotas: ${error.message}</p>`;
    }
}

function adoptPet(petId, petName) {
    document.getElementById('adoptModalText').textContent =
        `¿Deseas adoptar a ${petName}?`;
    document.getElementById('confirmAdoptBtn').onclick = async () => {
        try {
            await api.adoptPet(petId);
            closeModal('adoptModal');
            alert('¡Adopción exitosa! Bienvenido a tu nuevo miembro de familia 🎉');
            loadPets();
            loadDashboardData();
        } catch (error) {
            alert('Error al adoptar: ' + error.message);
        }
    };
    showModal('adoptModal');
}

// ============ Appointments ============
async function loadAppointments() {
    try {
        const container = document.getElementById('appointmentsContainer');
        container.innerHTML = '<p class="loading">Cargando citas...</p>';

        const appointments = await api.getMyAppointments();
        appState.appointments = appointments;

        if (appointments.length === 0) {
            container.innerHTML = '<p class="text-center">No tienes citas agendadas</p>';
        } else {
            container.innerHTML = appointments.map(apt => `
                <div class="appointment-card">
                    <div class="card-body">
                        <h3>📅 ${apt.date}</h3>
                        <p>${apt.description}</p>
                        <p style="color: var(--text-light); font-size: 0.875rem;">
                            Veterinario: ${apt.vet_id}
                        </p>
                        <span class="status-badge status-pending">Pendiente</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load appointments error:', error);
        document.getElementById('appointmentsContainer').innerHTML =
            `<p class="text-center">Error al cargar citas: ${error.message}</p>`;
    }
}

document.getElementById('appointmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const vetId = document.getElementById('appointmentVet').value;
    const description = document.getElementById('appointmentDescription').value;

    if (!date || !time || !vetId) {
        alert('Por favor completa todos los campos');
        return;
    }

    try {
        const fullDate = `${date}T${time}:00`;
        await api.createAppointment(vetId, fullDate, description);

        alert('Cita agendada exitosamente');
        document.getElementById('appointmentForm').reset();
        loadAppointments();
    } catch (error) {
        alert('Error al agendar cita: ' + error.message);
    }
});

// ============ Orders ============
async function loadOrders() {
    try {
        const container = document.getElementById('ordersContainer');
        container.innerHTML = '<p class="loading">Cargando órdenes...</p>';

        const orders = await api.getOrders();
        appState.orders = orders;

        if (orders.length === 0) {
            container.innerHTML = '<p class="text-center">No tienes órdenes</p>';
        } else {
            container.innerHTML = orders.map(order => `
                <div class="order-card">
                    <div class="card-body">
                        <h3>Orden #${order.id}</h3>
                        <p class="card-price">${formatPrice(order.total)}</p>
                        <p style="color: var(--text-light); font-size: 0.875rem;">
                            ${formatDate(order.created_at)}
                        </p>
                        <span class="status-badge status-completed">Completada</span>
                    </div>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Load orders error:', error);
        document.getElementById('ordersContainer').innerHTML =
            `<p class="text-center">Error al cargar órdenes: ${error.message}</p>`;
    }
}

// ============ Admin Functions ============
function showAddProductForm() {
    showModal('productModal');
}

function showAddPetForm() {
    showModal('petModal');
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('productName').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const type = document.getElementById('productType').value;

    try {
        await api.createProduct(name, price, type);
        alert('Producto creado exitosamente');
        closeModal('productModal');
        document.getElementById('productForm').reset();
        loadProducts();
    } catch (error) {
        alert('Error al crear producto: ' + error.message);
    }
});

document.getElementById('petForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('petName').value;

    try {
        await api.createPet(name, null);
        alert('Mascota agregada exitosamente');
        closeModal('petModal');
        document.getElementById('petForm').reset();
        loadPets();
    } catch (error) {
        alert('Error al agregar mascota: ' + error.message);
    }
});
