// API Configuration - ACTUALIZA ESTO EN PRODUCCIÓN
const API_URL = 'https://clinica-veterinaria-4iyb.onrender.com';

class API {
    constructor(apiUrl) {
        this.apiUrl = apiUrl;
    }

    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${this.apiUrl}${endpoint}`, {
                ...options,
                headers,
            });

            if (response.status === 401) {
                // Token inválido, desloguear
                localStorage.removeItem('token');
                window.location.href = '/';
                throw new Error('Sesión expirada');
            }

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || `Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ============ Products ============
    async getProducts() {
        return this.request('/products');
    }

    async createProduct(name, price, type) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify({ name, price, type }),
        });
    }

    // ============ Pets ============
    async getPets() {
        return this.request('/pets');
    }

    async createPet(name, type) {
        return this.request('/pets', {
            method: 'POST',
            body: JSON.stringify({ name, adopted: false }),
        });
    }

    async adoptPet(petId) {
        return this.request(`/pets/adopt/${petId}`, {
            method: 'POST',
        });
    }

    // ============ Orders ============
    async getOrders() {
        return this.request('/orders', {
            method: 'GET',
        });
    }

    async getOrder(orderId) {
        return this.request(`/orders/${orderId}`);
    }

    async createOrder(total) {
        return this.request('/orders', {
            method: 'POST',
            body: JSON.stringify({ total }),
        });
    }

    // ============ Appointments ============
    async getAppointments() {
        return this.request('/appointments');
    }

    async getMyAppointments() {
        return this.request('/appointments/me');
    }

    async createAppointment(vet_id, date, description) {
        return this.request('/appointments', {
            method: 'POST',
            body: JSON.stringify({ vet_id, date, description }),
        });
    }

    // ============ Health Check ============
    async healthCheck() {
        return this.request('/');
    }
}

const api = new API(API_URL);
