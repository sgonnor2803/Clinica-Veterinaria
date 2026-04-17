// Router for SPA
class Router {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) this.goTo(page);
            });
        });
    }

    goTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.add('hidden');
        });

        // Show target page
        const target = document.getElementById(page);
        if (!target) return;

        target.classList.remove('hidden');
        this.currentPage = page;

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.page === page) {
                btn.classList.add('active');
            }
        });

        // Load page data
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

// Create global router
window.router = new Router();

// Modal utilities
window.showModal = (modalId) => {
    document.getElementById(modalId).classList.remove('hidden');
};

window.closeModal = (modalId) => {
    document.getElementById(modalId).classList.add('hidden');
};

// Close modals on outside click
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;

        // Update buttons
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.classList.remove('active');
        });
        e.target.classList.add('active');

        // Update forms
        document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
        document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');

        // Clear errors
        document.getElementById('loginError').textContent = '';
        document.getElementById('signupError').textContent = '';
    });
});

// Utility functions
window.showError = (elementId, message) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = message;
};

window.clearError = (elementId) => {
    const el = document.getElementById(elementId);
    if (el) el.textContent = '';
};

window.formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(price);
};

window.formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
