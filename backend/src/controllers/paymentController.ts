import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';
import { redis, clearCache } from '../utils/redis';

// --- 1. PROCESS DUMMY RENT PAYMENT ---
export const processDummyPayment = async (req: AuthRequest, res: Response): Promise<any> => {
  const { lease_id, amount } = req.body;

  try {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({ lease_id, amount, due_date: new Date().toISOString(), type: 'RENT', status: 'PAID' })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    const { error: paymentError } = await supabase
      .from('payments')
      .insert({ invoice_id: invoice.id, amount_paid: amount, payment_date: new Date().toISOString(), payment_method: 'DUMMY_UPI' });

    if (paymentError) throw paymentError;

// 🚨 CACHE INVALIDATION: Find who owns this lease to clear both Tenant and Owner dashboards
    const { data: leaseInfo } = await supabase
      .from('leases')
      .select('tenant_id, rooms(properties(owner_id)), clusters(properties(owner_id))')
      .eq('id', lease_id)
      .single();

    if (leaseInfo) {
      // 1. Tell TypeScript to bypass strict checking for this deep nested object
      const info = leaseInfo as any; 
      
      // 2. Safely unwrap the deeply nested Supabase Arrays
      let roomOwner = null;
      if (info.rooms) {
        const room = Array.isArray(info.rooms) ? info.rooms[0] : info.rooms;
        const props = Array.isArray(room?.properties) ? room.properties[0] : room?.properties;
        roomOwner = props?.owner_id;
      }

      let clusterOwner = null;
      if (info.clusters) {
        const cluster = Array.isArray(info.clusters) ? info.clusters[0] : info.clusters;
        const props = Array.isArray(cluster?.properties) ? cluster.properties[0] : cluster?.properties;
        clusterOwner = props?.owner_id;
      }

      const owner_id = roomOwner || clusterOwner;

      // 3. Clear the actual Redis caches
      if (info.tenant_id) {
        await clearCache(`tenant_payments_${info.tenant_id}`);
        await clearCache(`tenant_metrics_${info.tenant_id}`);
      }
      if (owner_id) {
        await clearCache(`owner_payments_${owner_id}`);
        await clearCache(`owner_metrics_${owner_id}`);
      }
    }

    res.json({ status: 'success', message: 'Rent paid successfully!' });
  } catch (error: any) {
    console.error("❌ processDummyPayment Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getLedger = async (req: AuthRequest, res: Response): Promise<any> => {
  const { leaseId } = req.params;
  try {
    const { data: ledger, error } = await supabase
      .from('invoices')
      .select('*, payments(*)')
      .eq('lease_id', leaseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ status: 'success', ledger });
  } catch (error: any) {
    console.error("❌ getLedger Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- 3. OWNER: GET ALL PAYMENTS ---
export const getOwnerPayments = async (req: AuthRequest, res: Response): Promise<any> => {
  const owner_id = req.user.id;
  const cacheKey = `owner_payments_${owner_id}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return res.json({ status: 'success', source: 'cache', payments: cachedData });

    const { data: properties, error: propError } = await supabase.from('properties').select('id').eq('owner_id', owner_id);
    if (propError) throw propError;
    
    const propertyIds = (properties || []).map(p => p.id);
    if (propertyIds.length === 0) return res.json({ status: 'success', payments: [] });

    const { data: leases, error: leaseError } = await supabase.from('leases').select('id, rooms(property_id), clusters(property_id)');
    if (leaseError) throw leaseError;
      
    // 🚨 BUG FIX: (leases || []) ensures we never run .map() on null/undefined!
    const ownerLeaseIds = (leases || []).filter((l: any) => {
      const roomPropId = Array.isArray(l.rooms) ? l.rooms[0]?.property_id : l.rooms?.property_id;
      const clusterPropId = Array.isArray(l.clusters) ? l.clusters[0]?.property_id : l.clusters?.property_id;
      return propertyIds.includes(roomPropId) || propertyIds.includes(clusterPropId);
    }).map((l: any) => l.id);

    if (ownerLeaseIds.length === 0) return res.json({ status: 'success', payments: [] });

    const { data: invoices, error: invError } = await supabase.from('invoices').select('id').in('lease_id', ownerLeaseIds);
    if (invError) throw invError;
    
    const invoiceIds = (invoices || []).map(i => i.id);
    if (invoiceIds.length === 0) return res.json({ status: 'success', payments: [] });

    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select(`id, amount_paid, payment_date, payment_method, invoices (due_date, type, leases (id, start_date, users ( full_name ), rooms ( room_number, properties ( id, name ) ), clusters ( name, properties ( id, name ) )))`)
      .in('invoice_id', invoiceIds)
      .order('payment_date', { ascending: false });

    if (payError) throw payError;

    await redis.set(cacheKey, payments || [], { ex: 3600 });
    res.json({ status: 'success', source: 'database', payments: payments || [] });
  } catch (error: any) {
    console.error("❌ getOwnerPayments Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- 4. TENANT: GET MY PAYMENT HISTORY ---
export const getTenantPayments = async (req: AuthRequest, res: Response): Promise<any> => {
  const tenant_id = req.user.id;
  const cacheKey = `tenant_payments_${tenant_id}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return res.json({ status: 'success', source: 'cache', payments: cachedData });

    const { data: leases, error: leaseError } = await supabase.from('leases').select('id').eq('tenant_id', tenant_id);
    if (leaseError) throw leaseError;
    
    const leaseIds = (leases || []).map(l => l.id);
    if (leaseIds.length === 0) return res.json({ status: 'success', payments: [] });

    const { data: invoices, error: invError } = await supabase.from('invoices').select('id').in('lease_id', leaseIds);
    if (invError) throw invError;
    
    const invoiceIds = (invoices || []).map(i => i.id);
    if (invoiceIds.length === 0) return res.json({ status: 'success', payments: [] });

    const { data: payments, error: payError } = await supabase
      .from('payments')
      .select(`id, amount_paid, payment_date, invoices:invoice_id (due_date, type, leases (id, start_date, rooms ( properties ( name ) ), clusters ( properties ( name ) )))`)
      .in('invoice_id', invoiceIds)
      .order('payment_date', { ascending: false });

    if (payError) throw payError;

    await redis.set(cacheKey, payments || [], { ex: 3600 });
    res.json({ status: 'success', source: 'database', payments: payments || [] });
  } catch (error: any) {
    console.error("❌ getTenantPayments Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- 5. THE JIT INVOICE ENGINE ---
const syncLeaseInvoices = async (leaseId: string) => {
  try {
    const { data: lease, error } = await supabase
      .from('leases')
      .select('*, rooms(rent_amount), clusters(rent_amount)')
      .eq('id', leaseId)
      .single();

    if (error || !lease || !lease.start_date) return;

    const roomRent = Array.isArray(lease.rooms) ? lease.rooms[0]?.rent_amount : lease.rooms?.rent_amount;
    const clusterRent = Array.isArray(lease.clusters) ? lease.clusters[0]?.rent_amount : lease.clusters?.rent_amount;
    const rentAmount = lease.rent_amount || roomRent || clusterRent || lease.deposit_amount || 0;
    
    const startDate = new Date(lease.start_date);
    const now = new Date();
    let expectedDates: Date[] = [];
    let tempDate = new Date(startDate);
    
    while (tempDate <= now) {
      expectedDates.push(new Date(tempDate));
      tempDate.setMonth(tempDate.getMonth() + 1); 
    }

    const { data: existingInvoices } = await supabase.from('invoices').select('*').eq('lease_id', leaseId).eq('type', 'RENT');

    const missingInvoices = [];
    for (const date of expectedDates) {
      const exists = (existingInvoices || []).some(inv => {
        const invDate = new Date(inv.due_date);
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear();
      });

      if (!exists) {
        missingInvoices.push({
          lease_id: leaseId,
          amount: rentAmount,
          due_date: date.toISOString(),
          type: 'RENT',
          status: 'PENDING'
        });
      }
    }

    if (missingInvoices.length > 0) {
      await supabase.from('invoices').insert(missingInvoices);
    }
  } catch (err) {
    console.error(`❌ JIT Sync failed for Lease ${leaseId}:`, err);
  }
};

// --- 6. TENANT: GET DASHBOARD METRICS ---
export const getTenantMetrics = async (req: AuthRequest, res: Response): Promise<any> => {
  const tenant_id = req.user.id;
  const cacheKey = `tenant_metrics_${tenant_id}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return res.json({ status: 'success', source: 'cache', pendingDues: cachedData });

    const { data: leases, error: leaseError } = await supabase.from('leases').select('id').eq('tenant_id', tenant_id).eq('status', 'ACTIVE');
    if (leaseError) throw leaseError;
    
    if (!leases || leases.length === 0) return res.json({ status: 'success', pendingDues: 0 });

    for (const lease of leases) await syncLeaseInvoices(lease.id);

    const leaseIds = leases.map(l => l.id);
    const { data: pendingInvoices, error: invError } = await supabase.from('invoices').select('amount').in('lease_id', leaseIds).eq('status', 'PENDING');
    if (invError) throw invError;

    const totalPending = (pendingInvoices || []).reduce((sum, inv) => sum + (inv.amount || 0), 0);

    await redis.set(cacheKey, totalPending, { ex: 3600 });
    res.json({ status: 'success', source: 'database', pendingDues: totalPending });
  } catch (error: any) {
    console.error("❌ getTenantMetrics Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- 7. OWNER: GET DASHBOARD METRICS ---
export const getOwnerMetrics = async (req: AuthRequest, res: Response): Promise<any> => {
  const owner_id = req.user.id;
  const cacheKey = `owner_metrics_${owner_id}`;

  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) return res.json({ status: 'success', source: 'cache', ...cachedData });

    const { data: properties, error: propError } = await supabase.from('properties').select('id').eq('owner_id', owner_id);
    if (propError) throw propError;
    
    const propertyIds = (properties || []).map(p => p.id);
    if (propertyIds.length === 0) return res.json({ status: 'success', totalPending: 0, totalCollected: 0 });

    const { data: leases, error: leaseError } = await supabase.from('leases').select('id, rooms(property_id), clusters(property_id)').eq('status', 'ACTIVE');
    if (leaseError) throw leaseError;

    const ownerLeases = (leases || []).filter((l: any) => {
      const roomPropId = Array.isArray(l.rooms) ? l.rooms[0]?.property_id : l.rooms?.property_id;
      const clusterPropId = Array.isArray(l.clusters) ? l.clusters[0]?.property_id : l.clusters?.property_id;
      return propertyIds.includes(roomPropId) || propertyIds.includes(clusterPropId);
    });

    for (const lease of ownerLeases) await syncLeaseInvoices(lease.id);

    const ownerLeaseIds = ownerLeases.map(l => l.id);

    if (ownerLeaseIds.length === 0) {
      const emptyMetrics = { totalPending: 0, totalCollected: 0 };
      await redis.set(cacheKey, emptyMetrics, { ex: 3600 });
      return res.json({ status: 'success', source: 'database', ...emptyMetrics });
    }

    const { data: invoices, error: invError } = await supabase.from('invoices').select('amount, status').in('lease_id', ownerLeaseIds);
    if (invError) throw invError;

    let totalPending = 0;
    let totalCollected = 0;

    (invoices || []).forEach(inv => {
      if (inv.status === 'PENDING') totalPending += (inv.amount || 0);
      if (inv.status === 'PAID') totalCollected += (inv.amount || 0);
    });

    const metricsPayload = { totalPending, totalCollected };
    await redis.set(cacheKey, metricsPayload, { ex: 3600 });
    
    res.json({ status: 'success', source: 'database', ...metricsPayload });
  } catch (error: any) {
    console.error("getOwnerMetrics Error:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
};