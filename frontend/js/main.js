let appState = {
    user: null,
    profile: null,
    products: [],
    pets: [],
    appointments: [],
    orders: [],
    cart: []
};

// INIT
window.addEventListener('load', async () => {
    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {
        showAuthModal();
        return;
    }

    await initApp();
});

supabaseClient.auth.onAuthStateChange(async (_, session) => {
    if (session) {
        await initApp();
    } else {
        showAuthModal();
    }
});

async function initApp() {
    const { data } = await supabaseClient.auth.getSession();

    if (!data.session) {
        showAuthModal();
        return;
    }

    appState.user = data.session.user;
    window.auth.user = data.session.user;

    const profile = await window.auth.getProfile(appState.user.id);
    appState.profile = profile;

    showApp();
    loadDashboardData();
}

// UI
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    document.getElementById('userEmail').textContent = appState.user.email;

    document.getElementById('userRole').textContent =
        appState.profile?.role || 'cliente';

    const admin = document.getElementById('adminPanel');
    admin.classList.toggle(
        'hidden',
        !['admin', 'vet', 'sales'].includes(appState.profile?.role)
    );
}

// LOGIN
document.getElementById('loginForm').addEventListener('submit', async e => {
    e.preventDefault();

    try {
        await window.auth.login(loginEmail.value, loginPassword.value);
        await initApp();
    } catch (err) {
        showError('loginError', err.message);
    }
});

document.getElementById('signupForm').addEventListener('submit', async e => {
    e.preventDefault();

    try {
        await window.auth.signup(
            signupEmail.value,
            signupPassword.value,
            signupRole.value
        );
    } catch (err) {
        showError('signupError', err.message);
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await window.auth.logout();
    appState = { user: null, profile: null, products: [], pets: [], appointments: [], orders: [], cart: [] };
    showAuthModal();
});

// DASHBOARD
async function loadDashboardData() {
    const [products, pets] = await Promise.all([
        window.api.getProducts(),
        window.api.getPets()
    ]);

    appState.products = products;
    appState.pets = pets;

    productCount.textContent = products.length;
    petsCount.textContent = pets.filter(p => !p.adopted).length;
}

// PRODUCTS
async function loadProducts() {
    const container = productsContainer;
    const products = await window.api.getProducts();

    container.innerHTML = products.map(p => `
        <div>
            <h3>${p.name}</h3>
            <p>${formatPrice(p.price)}</p>
            <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">
                Comprar
            </button>
        </div>
    `).join('');
}

function addToCart(id, name, price) {
    appState.cart.push({ id, name, price });
    alert('Añadido');
}

// PETS
async function loadPets() {
    const pets = await window.api.getPets();

    petsContainer.innerHTML = pets
        .filter(p => !p.adopted)
        .map(p => `
            <div>
                <h3>${p.name}</h3>
                <button onclick="adoptPet(${p.id})">Adoptar</button>
            </div>
        `).join('');
}

async function adoptPet(id) {
    await window.api.adoptPet(id);
    loadPets();
}

// APPOINTMENTS
async function loadAppointments() {
    const data = await window.api.getMyAppointments();

    appointmentsContainer.innerHTML = data.map(a => `
        <div>${a.date} - ${a.description}</div>
    `).join('');
}

// ORDERS
async function loadOrders() {
    const data = await window.api.getOrders();

    ordersContainer.innerHTML = data.map(o => `
        <div>#${o.id} - ${formatPrice(o.total)}</div>
    `).join('');
}