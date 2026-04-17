// Supabase configuration - ACTUALIZA ESTOS VALORES
const SUPABASE_URL = 'https://rrmatjtqugrmjurbwrxz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8EWHi1ME2H68VplEc35aag_A7EhXEgj';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class Auth {
    constructor() {
        this.user = null;
        this.session = null;
    }

    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            this.session = data.session;
            this.user = {
                id: data.user.id,
                email: data.user.email,
            };

            localStorage.setItem('token', data.session.access_token);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    async signup(email, password, role) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) throw error;

            // Create profile
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([
                    {
                        id: data.user.id,
                        email,
                        role,
                    },
                ]);

            if (profileError) throw profileError;

            // Auto login
            await this.login(email, password);
            return true;
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    }

    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            this.user = null;
            this.session = null;
            localStorage.removeItem('token');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    async getProfile() {
        try {
            if (!this.user) return null;

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Get profile error:', error);
            return null;
        }
    }

    getToken() {
        return localStorage.getItem('token');
    }

    isAuthenticated() {
        return !!this.session;
    }
}

const auth = new Auth();
