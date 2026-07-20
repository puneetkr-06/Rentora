const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function test() {
  const { data: leases } = await supabase.from('leases').select('id, status, deposit_amount, rooms(property_id, rent_amount)');
  console.log("Leases:", JSON.stringify(leases, null, 2));

  const { data: invoices } = await supabase.from('invoices').select('*');
  console.log("Invoices:", JSON.stringify(invoices, null, 2));
}
test();
