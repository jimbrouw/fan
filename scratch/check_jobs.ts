import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkJobs() {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error('Error fetching jobs:', error);
    return;
  }

  console.log('Recent Generation Jobs:');
  data.forEach((job) => {
    console.log(`- ID: ${job.id}`);
    console.log(`  Provider ID: ${job.provider_job_id}`);
    console.log(`  Status: ${job.status}`);
    console.log(`  Model: ${job.kit_notes.match(/Model: (.*)/)?.[1] || 'Unknown'}`);
    console.log(`  Created At: ${job.created_at}`);
    console.log(`  Output: ${job.output_url || 'None'}`);
    console.log(`  Error: ${job.error || 'None'}`);
    console.log('---');
  });
}

checkJobs();
