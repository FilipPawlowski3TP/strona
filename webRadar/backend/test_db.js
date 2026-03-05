const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Pinging Supabase...');
    const start = Date.now();
    try {
        const { data, error } = await supabase.from('users').select('*').eq('username', 'admin').single();
        if (error) {
            if (error.code === 'PGRST116') {
                console.log('Admin user not found (expected if not initialized)');
            } else {
                console.error('Supabase error:', error);
            }
        } else {
            console.log('Admin user found:', data.username);
        }
    } catch (err) {
        console.error('Connection failed:', err);
    }
    console.log(`Finished in ${Date.now() - start}ms`);
}

test();
