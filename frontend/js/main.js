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
        // 🧠 Detectar redirect OAuth (GitHub)
        const hash = window.location.hash;

        if (hash && hash.includes("access_token")) {
            window.location.hash = ""; // limpiar URL
        }

        // 🔥 Usar sesión REAL de Supabase
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
            showAuthModal();
            return;
        }

        await initializeApp();

    } catch (error) {
        console.error('Init error:', error);
        showAuthModal();
    }
});

// 🔥 Reactividad automática (pro)
supabase.auth.onAuthStateChange((event, session) => {
    if (session) {
        initializeApp();
    } else {
        showAuthModal();
    }
});

async function initializeApp() {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
            showAuthModal();
            return;
        }

        appState.user = {
            id: data.session.user.id,
            email: data.session.user.email,
        };

        auth.session = data.session;
        auth.user = appState.user;

        const profile = await auth.getProfile();
        appState.profile = profile;

        showApp();
        await loadDashboardData();

    } catch (error) {
        console.error('Init error:', error);
        showAuthModal();
    }
}

// ============ UI ============
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    document.getElementById('userEmail').textContent = appState.user.email;

    const roleText =
        appState.profile?.role === 'admin' ? 'Administrador' :
        appState.profile?.role === 'vet' ? 'Veterinario' :
        'Cliente';

    document.getElementById('userRole').textContent = roleText;

    const adminPanel = document.getElementById('adminPanel');

    if (['admin', 'sales', 'vet'].includes(appState.profile?.role)) {
        adminPanel.classList.remove('hidden');
    } else {
        adminPanel.classList.add('hidden');
    }
}

// ============ AUTH ============
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('loginError');

    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
        await auth.login(email, password);
    } catch (error) {
        showError('loginError', error.message);
    }
});

document.getElementById('githubLoginBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    clearError('loginError');

    try {
        await auth.loginWithGithub();
    } catch (error) {
        showError('loginError', error.message);
    }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('signupError');

    const email = signupEmail.value;
    const password = signupPassword.value;
    const confirm = signupConfirm.value;
    const role = signupRole.value;

    if (password !== confirm) {
        return showError('signupError', 'Las contraseñas no coinciden');
    }

    if (password.length < 6) {
        return showError('signupError', 'Mínimo 6 caracteres');
    }

    try {
        await auth.signup(email, password, role);
    } catch (error) {
        showError('signupError', error.message);
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await auth.logout();

    // limpiar estado
    appState = {
        user: null,
        profile: null,
        products: [],
        pets: [],
        appointments: [],
        orders: [],
        cart: [],
    };

    showAuthModal();
});

// ============ DASHBOARD ============
async function loadDashboardData() {
    try {
        const [products, pets] = await Promise.all([
            api.getProducts(),
            api.getPets(),
        ]);

        let appointments = [];
        let orders = [];

        if (['admin', 'vet'].includes(appState.profile?.role)) {
            appointments = await api.getAppointments();
        } else {
            appointments = await api.getMyAppointments();
            orders = await api.getOrders();
        }

        appState = { ...appState, products, pets, appointments, orders };

        productCount.textContent = `${products.length} productos`;
        petsCount.textContent = `${pets.filter(p => !p.adopted).length} mascotas`;
        appointmentsCount.textContent = `${appointments.length} citas`;
        ordersCount.textContent = `${orders.length} órdenes`;

    } catch (error) {
        console.error(error);
    }
}

// ============ PRODUCTS ============
async function loadProducts() {
    const container = productsContainer;
    container.innerHTML = 'Cargando...';

    try {
        const products = await api.getProducts();
        appState.products = products;

        container.innerHTML = products.map(p => `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>${p.type}</p>

                ${p.discountApplied ? `
                    <p style="text-decoration:line-through">
                        ${formatPrice(p.originalPrice)}
                    </p>
                ` : ''}

                <p>${formatPrice(p.price)}</p>

                <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">
                    Comprar
                </button>
            </div>
        `).join('');

    } catch (e) {
        container.innerHTML = 'Error cargando productos';
    }
}

function addToCart(id, name, price) {
    appState.cart.push({ id, name, price });
    alert('Añadido 🐾');
}

// ============ PETS ============
async function loadPets() {
    const container = petsContainer;
    container.innerHTML = 'Cargando...';

    const pets = await api.getPets();
    const disponibles = pets.filter(p => !p.adopted);

    container.innerHTML = disponibles.map(p => `
        <div class="pet-card">
            <h3>🐾 ${p.name}</h3>
            <button onclick="adoptPet(${p.id})">Adoptar</button>
        </div>
    `).join('');
}

async function adoptPet(id) {
    await api.adoptPet(id);
    alert('Adoptado 🐺');
    loadPets();
}

// ============ APPOINTMENTS ============
async function loadAppointments() {
    const data = await api.getMyAppointments();

    appointmentsContainer.innerHTML = data.map(a => `
        <div>
            <p>${a.date}</p>
            <p>${a.description}</p>
        </div>
    `).join('');
}

// ============ ORDERS ============
async function loadOrders() {
    const data = await api.getOrders();

    ordersContainer.innerHTML = data.map(o => `
        <div>
            <p>#${o.id}</p>
            <p>${formatPrice(o.total)}</p>
        </div>
    `).join('');
}