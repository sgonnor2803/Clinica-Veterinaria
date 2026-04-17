// Simple Router for SPA
class Router {
    constructor() {
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Set up nav button listeners
        document.querySelectorAll('.nav-btn').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                const page = e.target.dataset.page;
                if (page) this.goTo(page);
            });
        });
    }

    goTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach((p) => {
            p.classList.add('hidden');
        });

        // Show target page
        const targetPage = document.getElementById(page);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            this.currentPage = page;

            // Update active nav button
            document.querySelectorAll('.nav-btn').forEach((btn) => {
                btn.classList.remove('active');
                if (btn.dataset.page === page) {
                    btn.classList.add('active');
                }
            });

            // Load page-specific data
            this.loadPageData(page);
        }
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

const router = new Router();

// ============ Modal Functions ============
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach((modal) => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// ============ Tab Switching ============
document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        const tab = e.target.dataset.tab;

        // Update buttons
        document.querySelectorAll('.tab-btn').forEach((b) => {
            b.classList.remove('active');
        });
        e.target.classList.add('active');

        // Update forms
        document.querySelectorAll('.auth-form').forEach((form) => {
            form.classList.add('hidden');
        });

        const formId = tab === 'login' ? 'loginForm' : 'signupForm';
        document.getElementById(formId).classList.remove('hidden');

        // Clear errors
        document.getElementById('loginError').textContent = '';
        document.getElementById('signupError').textContent = '';
    });
});

// Utilities
function showError(elementId, message) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = message;
    }
}

function clearError(elementId) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = '';
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0,
    }).format(price);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}
