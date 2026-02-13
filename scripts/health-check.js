import { createClient } from '@supabase/supabase-js';

const WEBSITE_URL = 'https://revastra.me';
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

let allChecksPassed = true;
const results = [];

// Helper to log results
function logCheck(name, passed, message, duration) {
  const status = passed ? '✅' : '❌';
  const result = `${status} ${name}: ${message} (${duration}ms)`;
  console.log(result);
  results.push({ name, passed, message, duration });
  if (!passed) allChecksPassed = false;
}

// Check 1: Website Availability
async function checkWebsite() {
  const start = Date.now();
  try {
    const response = await fetch(WEBSITE_URL, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    const duration = Date.now() - start;
    
    if (response.ok) {
      logCheck('Website', true, `Status ${response.status}`, duration);
    } else {
      logCheck('Website', false, `Status ${response.status}`, duration);
    }
  } catch (error) {
    const duration = Date.now() - start;
    logCheck('Website', false, error.message, duration);
  }
}

// Check 2: Browse Page
async function checkBrowsePage() {
  const start = Date.now();
  try {
    const response = await fetch(`${WEBSITE_URL}/browse`, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    const duration = Date.now() - start;
    
    // For SPA on GitHub Pages, 404 with redirect script is expected and OK
    if (response.ok || response.status === 404) {
      const text = await response.text();
      // Check if it's the SPA redirect 404 (contains our redirect script)
      if (text.includes('Single Page Apps for GitHub Pages') || response.ok) {
        logCheck('Browse Page', true, `Status ${response.status} (SPA routing)`, duration);
      } else {
        logCheck('Browse Page', false, `Status ${response.status}`, duration);
      }
    } else {
      logCheck('Browse Page', false, `Status ${response.status}`, duration);
    }
  } catch (error) {
    const duration = Date.now() - start;
    logCheck('Browse Page', false, error.message, duration);
  }
}

// Check 3: Supabase Connection
async function checkSupabase() {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);
    
    const duration = Date.now() - start;
    
    if (error) {
      logCheck('Supabase', false, error.message, duration);
    } else {
      logCheck('Supabase', true, 'Connected', duration);
    }
  } catch (error) {
    const duration = Date.now() - start;
    logCheck('Supabase', false, error.message, duration);
  }
}

// Check 4: Database Query Performance
async function checkDatabasePerformance() {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .from('listings')
      .select('id, title, price')
      .eq('status', 'active')
      .limit(10);
    
    const duration = Date.now() - start;
    
    if (error) {
      logCheck('DB Performance', false, error.message, duration);
    } else if (duration > 3000) {
      logCheck('DB Performance', false, 'Slow response', duration);
    } else {
      logCheck('DB Performance', true, `${data?.length || 0} listings`, duration);
    }
  } catch (error) {
    const duration = Date.now() - start;
    logCheck('DB Performance', false, error.message, duration);
  }
}

// Check 5: Storage Bucket
async function checkStorage() {
  const start = Date.now();
  try {
    const { data, error } = await supabase
      .storage
      .from('listings')
      .list('', { limit: 1 });
    
    const duration = Date.now() - start;
    
    if (error) {
      logCheck('Storage', false, error.message, duration);
    } else {
      logCheck('Storage', true, 'Accessible', duration);
    }
  } catch (error) {
    const duration = Date.now() - start;
    logCheck('Storage', false, error.message, duration);
  }
}

// Check 6: API Response Time
async function checkAPIResponseTime() {
  const start = Date.now();
  try {
    const response = await fetch(`${WEBSITE_URL}/store`, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    const duration = Date.now() - start;
    
    // For SPA on GitHub Pages, 404 with redirect script is expected and OK
    const text = await response.text();
    const isSPARedirect = text.includes('Single Page Apps for GitHub Pages');
    
    if (duration > 5000) {
      logCheck('Response Time', false, 'Too slow', duration);
    } else if (response.ok || (response.status === 404 && isSPARedirect)) {
      logCheck('Response Time', true, 'Fast (SPA routing)', duration);
    } else {
      logCheck('Response Time', false, `Status ${response.status}`, duration);
    }
  } catch (error) {
    const duration = Date.now() - start;
    logCheck('Response Time', false, error.message, duration);
  }
}

// Main health check
async function runHealthCheck() {
  console.log('🏥 Starting Health Check for रीवस्त्र...\n');
  console.log(`Time: ${new Date().toISOString()}\n`);

  await checkWebsite();
  await checkBrowsePage();
  await checkSupabase();
  await checkDatabasePerformance();
  await checkStorage();
  await checkAPIResponseTime();

  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Summary: ${results.filter(r => r.passed).length}/${results.length} checks passed\n`);

  if (!allChecksPassed) {
    console.log('❌ HEALTH CHECK FAILED\n');
    console.log('Failed checks:');
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
    process.exit(1);
  } else {
    console.log('✅ ALL CHECKS PASSED\n');
    console.log('Website is healthy and operational!');
  }
}

// Run the health check
runHealthCheck().catch(error => {
  console.error('❌ Fatal error during health check:', error);
  process.exit(1);
});
