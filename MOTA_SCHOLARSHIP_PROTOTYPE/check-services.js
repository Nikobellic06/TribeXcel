// Script to check status of all MoTA prototype services
const services = [
  { name: 'System A (Document Intelligence)', url: 'http://localhost:5001/api/health' },
  { name: 'System B (Verification Engine)', url: 'http://localhost:5050/api/health' },
  { name: 'Integration API Server', url: 'http://localhost:5002/api/health' },
  { name: 'Demo Dashboard (Vite)', url: 'http://localhost:3000' }
];

async function checkAll() {
  console.log('====================================================');
  console.log('🔍 CHECKING MoTA PROTOTYPE SERVICES STATUS');
  console.log('====================================================\n');

  for (const s of services) {
    try {
      const res = await fetch(s.url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        console.log(`  🟢 ONLINE  : ${s.name} (${s.url})`);
      } else {
        console.log(`  🟡 WARNING : ${s.name} returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.log(`  🔴 OFFLINE : ${s.name} (${s.url}) - ${err.message}`);
    }
  }

  console.log('\n----------------------------------------------------');
  console.log('Dashboard URL : http://localhost:3000');
  console.log('API Base URL  : http://localhost:5002/api');
  console.log('====================================================');
}

checkAll();
