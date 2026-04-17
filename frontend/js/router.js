class Router {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // botones del navbar
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.goTo(page);
            });
        });

        // cargar dashboard al iniciar
        this.goTo('dashboard');
    }

    goTo(page) {
        // ocultar todas las páginas
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });

        // mostrar página objetivo
        const target = document.getElementById(page);

        if (!target) {
            console.warn(`Página no encontrada: ${page}`);
            return;
        }

        target.classList.remove('hidden');
        this.currentPage = page;

        // estado activo en navbar
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');

            if (btn.dataset.page === page) {
                btn.classList.add('active');
            }
        });

        // cargar datos de la página
        this.loadPageData(page);
    }

    loadPageData(page) {
        switch (page) {
            case 'dashboard':
                loadDashboardData();
                break;

            case 'products':
                loadProducts();
                break;

            case 'pets':
                loadPets();
                break;

            case 'appointments':
                loadAppointments();
                break;

            case 'orders':
                loadOrders();
                break;
        }
    }
}

window.router = new Router();


// ================= MODALES =================

function showModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.remove('hidden');
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) modal.classList.add('hidden');
}

// cerrar modal al hacer click fuera
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});


// ================= TABS AUTH =================

document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;

        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));

        document.getElementById(tab === 'login' ? 'loginForm' : 'signupForm')
            .classList.remove('hidden');

        clearError('loginError');
        clearError('signupError');
    });
});


// ================= UTILS =================

function showError(id, msg) {
    const el = document.getElementById(id);
    if (el) el.textContent = msg;
}

function clearError(id) {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
}

function formatPrice(value) {
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR'
    }).format(value);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'long',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}