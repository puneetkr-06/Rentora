const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

async function test() {
  const owner_id = 'fae66040-b24a-4739-bd17-e6de04fa3ec7';
  const { data: properties, error: propError } = await supabase.from('properties').select('id').eq('owner_id', owner_id);
  const propertyIds = (properties || []).map(p => p.id);
  
  const { data: leases, error: leaseError } = await supabase.from('leases').select('id, status, deposit_amount, rooms(property_id, rent_amount)');
  
  const ownerLeases = (leases || []).filter((l) => {
    const roomPropId = Array.isArray(l.rooms) ? l.rooms[0]?.property_id : l.rooms?.property_id;
    return propertyIds.includes(roomPropId);
  });

  let totalMonthlyRent = 0;
  for (const lease of ownerLeases) {
    if (lease.status === 'ACTIVE') {
      const roomRent = Array.isArray(lease.rooms) ? lease.rooms[0]?.rent_amount : lease.rooms?.rent_amount;
      const rentAmount = roomRent || lease.deposit_amount || 0;
      totalMonthlyRent += Number(rentAmount);
    }
  }

  const ownerLeaseIds = ownerLeases.map(l => l.id);
  let totalPending = 0;
  if (ownerLeaseIds.length > 0) {
    const { data: pendingInvoices, error: pendError } = await supabase.from('invoices').select('amount').in('lease_id', ownerLeaseIds).eq('status', 'PENDING');
    totalPending = (pendingInvoices || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  }

  let totalCollectedOrig = 0;
  if (ownerLeaseIds.length > 0) {
    const { data: paidInvoices } = await supabase.from('invoices').select('amount').in('lease_id', ownerLeaseIds).eq('status', 'PAID');
    totalCollectedOrig = (paidInvoices || []).reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
  }

  console.log("totalMonthlyRent:", totalMonthlyRent);
  console.log("totalPending:", totalPending);
  console.log("totalCollectedOrig:", totalCollectedOrig);
}
test();
