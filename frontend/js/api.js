const API_URL = 'https://clinica-veterinaria-4iyb.onrender.com';

class API {
    async request(endpoint, method = 'GET', body = null) {
        const token = localStorage.getItem('token');

        const headers = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const options = {
            method,
            headers
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        try {
            const response = await fetch(`${API_URL}${endpoint}`, options);

            if (response.status === 401) {
                localStorage.removeItem('token');
                window.location.href = '/';
                throw new Error('Sesión expirada');
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.error || `Error ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Error:', error.message);
            throw error;
        }
    }

    // Products
    async getProducts() {
        return this.request('/products');
    }

    async createProduct(name, price, type) {
        return this.request('/products', 'POST', { name, price, type });
    }

    // Pets
    async getPets() {
        return this.request('/pets');
    }

    async createPet(name) {
        return this.request('/pets', 'POST', { name, adopted: false });
    }

    async adoptPet(id) {
        return this.request(`/pets/adopt/${id}`, 'POST');
    }

    // Appointments
    async getAppointments() {
        return this.request('/appointments');
    }

    async getMyAppointments() {
        return this.request('/appointments/me');
    }

    async createAppointment(vet_id, date, description) {
        return this.request('/appointments', 'POST', { vet_id, date, description });
    }

    // Orders
    async getOrders() {
        return this.request('/orders');
    }

    async getOrder(orderId) {
        return this.request(`/orders/${orderId}`);
    }

    async createOrder(total) {
        return this.request('/orders', 'POST', { total });
    }
}

// Create global API instance
window.api = new API();
