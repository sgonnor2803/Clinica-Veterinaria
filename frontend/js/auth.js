// Supabase config
const SUPABASE_URL = 'https://rrmatjtqugrmjurbwrxz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8EWHi1ME2H68VplEc35aag_A7EhXEgj';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class Auth {
    constructor() {
        this.user = null;
        this.session = null;
    }

    async login(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        this.session = data.session;
        this.user = data.user;

        return data;
    }

    async signup(email, password, role) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        });

        if (error) throw error;

        if (data.user) {
            await supabase.from('profiles').insert([
                {
                    id: data.user.id,
                    email,
                    role
                }
            ]);
        }

        return data;
    }

    async loginWithGithub() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;
    }

    async logout() {
        await supabase.auth.signOut();
        this.user = null;
        this.session = null;
    }

    async getProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) return null;
        return data;
    }
}

window.auth = new Auth();
window.supabaseClient = supabase;