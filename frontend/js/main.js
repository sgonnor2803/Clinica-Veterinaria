let appState = {
    user: null,
    profile: null,
    products: [],
    pets: [],
    appointments: [],
    orders: [],
    cart: [],
};


// ================= INIT =================
window.addEventListener('load', async () => {
    try {
        const { data, error } = await supabase.auth.getSession();

        if (error || !data.session) {
            showAuthModal();
            return;
        }

        await initializeApp();

    } catch (err) {
        console.error(err);
        showAuthModal();
    }
});


// reacción automática a login/logout
supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        await initializeApp();
    } else {
        showAuthModal();
    }
});


// ================= APP INIT =================
async function initializeApp() {
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
        showAuthModal();
        return;
    }

    appState.user = data.session.user;

    auth.session = data.session;
    auth.user = data.session.user;

    const profile = await auth.getProfile();
    appState.profile = profile;

    showApp();
    await loadDashboardData();

    router.goTo('dashboard');
}


// ================= UI =================
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
}

function showApp() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');

    document.getElementById('userEmail').textContent = appState.user.email;

    const role =
        appState.profile?.role === 'admin' ? 'Administrador' :
        appState.profile?.role === 'vet' ? 'Veterinario' :
        'Cliente';

    document.getElementById('userRole').textContent = role;

    const adminPanel = document.getElementById('adminPanel');

    if (['admin', 'vet', 'sales'].includes(appState.profile?.role)) {
        adminPanel.classList.remove('hidden');
    } else {
        adminPanel.classList.add('hidden');
    }
}


// ================= AUTH =================
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError('loginError');

    const email = loginEmail.value;
    const password = loginPassword.value;

    try {
        await auth.login(email, password);
    } catch (err) {
        showError('loginError', err.message);
    }
});


document.getElementById('githubLoginBtn').addEventListener('click', async () => {
    clearError('loginError');

    try {
        await auth.loginWithGithub();
    } catch (err) {
        showError('loginError', err.message);
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
    } catch (err) {
        showError('signupError', err.message);
    }
});


document.getElementById('logoutBtn').addEventListener('click', async () => {
    await auth.logout();

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


// ================= DASHBOARD =================
async function loadDashboardData() {
    try {
        const [products, pets] = await Promise.all([
            api.getProducts(),
            api.getPets()
        ]);

        let appointments = [];
        let orders = [];

        if (['admin', 'vet'].includes(appState.profile?.role)) {
            appointments = await api.getAppointments();
        } else {
            appointments = await api.getMyAppointments();
            orders = await api.getOrders();
        }

        appState.products = products;
        appState.pets = pets;
        appState.appointments = appointments;
        appState.orders = orders;

        productCount.textContent = `${products.length}`;
        petsCount.textContent = `${pets.filter(p => !p.adopted).length}`;
        appointmentsCount.textContent = `${appointments.length}`;
        ordersCount.textContent = `${orders.length}`;

    } catch (err) {
        console.error(err);
    }
}


// ================= PRODUCTS =================
async function loadProducts() {
    const container = productsContainer;
    container.innerHTML = 'Cargando...';

    try {
        const products = await api.getProducts();

        container.innerHTML = products.map(p => `
            <div class="card">
                <h3>${p.name}</h3>
                <p>${p.type}</p>

                ${p.discountApplied ? `
                    <p style="text-decoration:line-through">
                        ${formatPrice(p.originalPrice)}
                    </p>
                ` : ''}

                <p>${formatPrice(p.price)}</p>

                <button onclick="addToCart(${p.id}, '${p.name}', ${p.price})">
                    Añadir
                </button>
            </div>
        `).join('');

    } catch (err) {
        container.innerHTML = 'Error cargando productos';
    }
}


function addToCart(id, name, price) {
    appState.cart.push({ id, name, price });
    alert('Añadido 🐾');
}


// ================= PETS =================
async function loadPets() {
    const container = petsContainer;
    container.innerHTML = 'Cargando...';

    const pets = await api.getPets();
    const available = pets.filter(p => !p.adopted);

    container.innerHTML = available.map(p => `
        <div class="card">
            <h3>🐾 ${p.name}</h3>
            <button onclick="adoptPet(${p.id})">Adoptar</button>
        </div>
    `).join('');
}


async function adoptPet(id) {
    await api.adoptPet(id);
    alert('Adoptado 🐺');
    loadPets();
    loadDashboardData();
}


// ================= APPOINTMENTS =================
async function loadAppointments() {
    const data = await api.getMyAppointments();

    appointmentsContainer.innerHTML = data.map(a => `
        <div class="card">
            <p>${a.date}</p>
            <p>${a.description}</p>
        </div>
    `).join('');
}


// ================= ORDERS =================
async function loadOrders() {
    const data = await api.getOrders();

    ordersContainer.innerHTML = data.map(o => `
        <div class="card">
            <p>#${o.id}</p>
            <p>${formatPrice(o.total)}</p>
        </div>
    `).join('');
}