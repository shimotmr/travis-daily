/**
 * Script to create reports table in Supabase
 */
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function createReportsTable() {
  console.log('Checking if reports table exists...');
  
  // Try to query the table
  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .limit(1);
  
  if (error) {
    console.log('Table does not exist or error:', error.message);
    
    // Create table using SQL
    const { error: createError } = await supabase.rpc('create_reports_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS reports (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          summary TEXT,
          content TEXT,
          category TEXT DEFAULT 'council',
          source TEXT DEFAULT 'grok-council',
          tags TEXT[] DEFAULT '{}',
          author TEXT DEFAULT 'William Hub',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Enable read access for all users" ON reports
          FOR SELECT USING (true);
        
        CREATE POLICY "Enable insert for authenticated users" ON reports
          FOR INSERT WITH CHECK (true);
        
        CREATE POLICY "Enable update for authenticated users" ON reports
          FOR UPDATE USING (true);
      `
    });
    
    if (createError) {
      console.log('Could not create table via RPC:', createError.message);
      console.log('Please create the table manually in Supabase dashboard:');
      console.log(`
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  category TEXT DEFAULT 'council',
  source TEXT DEFAULT 'grok-council',
  tags TEXT[] DEFAULT '{}',
  author TEXT DEFAULT 'William Hub',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
      `);
    } else {
      console.log('Table created successfully!');
    }
  } else {
    console.log('Reports table exists!');
  }
}

createReportsTable();
