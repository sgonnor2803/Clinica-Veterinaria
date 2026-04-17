class API {
    async getProducts() {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*');

        if (error) throw error;
        return data;
    }

    async getPets() {
        const { data, error } = await supabaseClient
            .from('pets')
            .select('*');

        if (error) throw error;
        return data;
    }

    async adoptPet(id) {
        const { error } = await supabaseClient
            .from('pets')
            .update({ adopted: true })
            .eq('id', id);

        if (error) throw error;
    }

    async getAppointments() {
        const { data, error } = await supabaseClient
            .from('appointments')
            .select('*');

        if (error) throw error;
        return data;
    }

    async getMyAppointments() {
        const user = supabaseClient.auth.getUser();
        const { data, error } = await supabaseClient
            .from('appointments')
            .select('*')
            .eq('user_id', (await user).data.user.id);

        if (error) throw error;
        return data;
    }

    async getOrders() {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('*');

        if (error) throw error;
        return data;
    }

    async createOrder(total) {
        const user = await supabaseClient.auth.getUser();

        const { error } = await supabaseClient
            .from('orders')
            .insert([
                {
                    user_id: user.data.user.id,
                    total
                }
            ]);

        if (error) throw error;
    }
}

window.api = new API();