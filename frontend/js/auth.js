// Supabase Configuration
const SUPABASE_URL = 'https://rrmatjtqugrmjurbwrxz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8EWHi1ME2H68VplEc35aag_A7EhXEgj';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Create global reference for API
window.supabaseClient = supabase;

class Auth {
    constructor() {
        this.user = null;
        this.session = null;
    }

    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.session = data.session;
            this.user = data.user;
            localStorage.setItem('token', data.session.access_token);

            return data;
        } catch (error) {
            console.error('Login error:', error.message);
            throw error;
        }
    }

    async loginWithGithub() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'github',
                options: {
                    redirectTo: window.location.origin + window.location.pathname
                }
            });

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('GitHub login error:', error.message);
            throw error;
        }
    }

    async signup(email, password, role) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            // Create profile with role
            const { error: profileError } = await supabase
                .from('profiles')
                .insert([{
                    id: data.user.id,
                    email,
                    role
                }]);

            if (profileError) throw profileError;

            // Auto login
            await this.login(email, password);
            return data;
        } catch (error) {
            console.error('Signup error:', error.message);
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
            console.error('Logout error:', error.message);
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
            console.error('Get profile error:', error.message);
            return null;
        }
    }

    async checkSession() {
        try {
            const { data, error } = await supabase.auth.getSession();

            if (error || !data.session) {
                return false;
            }

            this.session = data.session;
            this.user = data.session.user;
            localStorage.setItem('token', data.session.access_token);

            return true;
        } catch (error) {
            console.error('Check session error:', error.message);
            return false;
        }
    }
}

// Create global auth instance
window.auth = new Auth();
