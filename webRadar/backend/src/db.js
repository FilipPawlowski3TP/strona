require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase configuration. Please check your .env file.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseDB {
    async findUser(query) {
        let supabaseQuery = supabase.from('users').select('*');
        
        if (query.id) {
            supabaseQuery = supabaseQuery.eq('id', query.id);
        } else if (query.username) {
            supabaseQuery = supabaseQuery.eq('username', query.username);
        }
        
        const { data, error } = await supabaseQuery.single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error finding user:', error);
            return null;
        }
        return data;
    }

    async createUser(user) {
        const { data, error } = await supabase
            .from('users')
            .insert([user])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating user:', error);
            throw error;
        }
        return data;
    }

    async updateUser(id, updates) {
        const { data, error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating user:', error);
            throw error;
        }
        return data;
    }

    async findOTP(query) {
        let supabaseQuery = supabase.from('otp_codes').select('*');
        
        if (query.id) {
            supabaseQuery = supabaseQuery.eq('id', query.id);
        } else if (query.code) {
            supabaseQuery = supabaseQuery
                .eq('code', query.code)
                .eq('used', false)
                .gt('expires_at', new Date().toISOString());
        }
        
        const { data, error } = await supabaseQuery.single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error finding OTP:', error);
            return null;
        }
        return data;
    }

    async createOTP(otp) {
        const { data, error } = await supabase
            .from('otp_codes')
            .insert([otp])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating OTP:', error);
            throw error;
        }
        return data;
    }

    async updateOTP(id, updates) {
        const { data, error } = await supabase
            .from('otp_codes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating OTP:', error);
            throw error;
        }
        return data;
    }

    async findConfig(query) {
        const { data, error } = await supabase
            .from('configs')
            .select('*')
            .eq('id', query.id)
            .single();
        
        if (error && error.code !== 'PGRST116') {
            console.error('Error finding config:', error);
            return null;
        }
        return data;
    }

    async findConfigs(query) {
        let supabaseQuery = supabase.from('configs').select('*');
        
        if (query.user_id) {
            supabaseQuery = supabaseQuery.eq('user_id', query.user_id);
        } else if (query.is_public) {
            supabaseQuery = supabaseQuery.eq('is_public', true);
        }
        
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
        
        const { data, error } = await supabaseQuery;
        if (error) {
            console.error('Error finding configs:', error);
            return [];
        }
        return data || [];
    }

    async createConfig(config) {
        const { data, error } = await supabase
            .from('configs')
            .insert([config])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating config:', error);
            throw error;
        }
        return data;
    }

    async updateConfig(id, updates) {
        const { data, error } = await supabase
            .from('configs')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating config:', error);
            throw error;
        }
        return data;
    }

    async deleteConfig(id, user_id) {
        const { data, error } = await supabase
            .from('configs')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id)
            .select();
        
        if (error) {
            console.error('Error deleting config:', error);
            return false;
        }
        return data && data.length > 0;
    }

    async findSession(query) {
        let supabaseQuery = supabase.from('radar_sessions').select('*');
        
        if (query.share_code) {
            supabaseQuery = supabaseQuery
                .eq('share_code', query.share_code)
                .gt('expires_at', new Date().toISOString());
        } else if (query.id) {
            supabaseQuery = supabaseQuery.eq('id', query.id);
        }
        
        const { data, error } = await supabaseQuery.single();
        if (error && error.code !== 'PGRST116') {
            console.error('Error finding session:', error);
            return null;
        }
        return data;
    }

    async findSessions(query) {
        let supabaseQuery = supabase.from('radar_sessions').select('*');
        
        if (query.user_id) {
            supabaseQuery = supabaseQuery
                .eq('user_id', query.user_id)
                .gt('expires_at', new Date().toISOString());
        }
        
        supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
        
        const { data, error } = await supabaseQuery;
        if (error) {
            console.error('Error finding sessions:', error);
            return [];
        }
        return data || [];
    }

    async createSession(session) {
        const { data, error } = await supabase
            .from('radar_sessions')
            .insert([session])
            .select()
            .single();
        
        if (error) {
            console.error('Error creating session:', error);
            throw error;
        }
        return data;
    }

    async updateSession(id, updates) {
        const { data, error } = await supabase
            .from('radar_sessions')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        
        if (error) {
            console.error('Error updating session:', error);
            throw error;
        }
        return data;
    }

    async deleteSession(id, user_id) {
        const { data, error } = await supabase
            .from('radar_sessions')
            .delete()
            .eq('id', id)
            .eq('user_id', user_id)
            .select();
        
        if (error) {
            console.error('Error deleting session:', error);
            return false;
        }
        return data && data.length > 0;
    }
}

const db = new SupabaseDB();

async function initDatabase() {
    try {
        const adminExists = await db.findUser({ username: 'admin' });
        if (!adminExists) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            await db.createUser({
                id: uuidv4(),
                username: 'admin',
                password_hash: hashedPassword,
                hwid: null,
                is_admin: true,
                created_at: new Date().toISOString()
            });
            console.log('Default admin user created (admin/admin123)');
        }
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

module.exports = { db, initDatabase, supabase };
