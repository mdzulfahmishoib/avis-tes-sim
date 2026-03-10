
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const { data, error } = await supabase.from('questions').select('*').limit(1);
  if (error) {
    console.error('Error fetching questions:', error);
    return;
  }
  if (data && data.length > 0) {
    console.log('Columns in questions table:', Object.keys(data[0]));
  } else {
    console.log('No questions found to check columns.');
    // Try to get column info from another way if possible
    const { data: cols, error: colError } = await supabase.rpc('get_table_columns', { table_name: 'questions' });
    if (colError) {
      console.log('get_table_columns RPC failed (expected if not defined).');
    } else {
      console.log('Columns:', cols);
    }
  }
}

checkColumns();
