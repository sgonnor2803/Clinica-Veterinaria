class Router {
    constructor() {
        this.current = 'dashboard';
        this.init();
    }

    init() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.go(btn.dataset.page);
            });
        });
    }

    go(page) {
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });

        const target = document.getElementById(page);
        if (!target) return;

        target.classList.remove('hidden');
        this.current = page;

        this.load(page);
    }

    load(page) {
        switch (page) {
            case 'dashboard': loadDashboardData(); break;
            case 'products': loadProducts(); break;
            case 'pets': loadPets(); break;
            case 'appointments': loadAppointments(); break;
            case 'orders': loadOrders(); break;
        }
    }
}

window.router = new Router();

// MODALES
window.showModal = (id) => {
    document.getElementById(id).classList.remove('hidden');
};

window.closeModal = (id) => {
    document.getElementById(id).classList.add('hidden');
};

// TABS AUTH
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const tab = btn.dataset.tab;

        document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
        document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
    });
});

// utils
window.showError = (id, msg) => {
    document.getElementById(id).textContent = msg;
};

window.clearError = (id) => {
    document.getElementById(id).textContent = '';
};

window.formatPrice = (n) =>
    new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(n);