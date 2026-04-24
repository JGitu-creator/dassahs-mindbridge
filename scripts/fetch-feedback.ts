import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkFeedback() {
  console.log('Fetching feedback from Supabase...');
  
  // Try 'feedback' table
  let { data, error } = await supabase
    .from('feedback')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    // Try 'feedbacks' table if 'feedback' fails
    console.log('Trying "feedbacks" table...');
    const retry = await supabase
      .from('feedbacks')
      .select('*')
      .order('created_at', { ascending: false });
    data = retry.data;
    error = retry.error;
  }

  if (error) {
    console.error('Error fetching feedback:', error.message);
  } else {
    console.log('--- FEEDBACK RECORDS ---');
    console.log(JSON.stringify(data, null, 2));
    console.log('------------------------');
  }
}

checkFeedback();
