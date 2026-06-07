import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// 1. Process Dummy Rent Payment
export const processDummyPayment = async (req: AuthRequest, res: Response): Promise<any> => {
  const { lease_id, amount } = req.body;

  try {
    // A. Generate a quick invoice for this payment
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .insert({
        lease_id,
        amount,
        due_date: new Date().toISOString(),
        type: 'RENT',
        status: 'PAID'
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // B. Record the actual payment against that invoice
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoice.id,
        amount_paid: amount,
        payment_date: new Date().toISOString(),
        payment_method: 'DUMMY_UPI'
      });

    if (paymentError) throw paymentError;

    res.json({ status: 'success', message: 'Rent paid successfully!' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// 2. Fetch the Ledger History
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
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- 3. OWNER: GET ALL PAYMENTS FOR ALL PROPERTIES ---
export const getOwnerPayments = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // 1. Get all properties owned by this user
    const { data: properties } = await supabase
      .from('properties')
      .select('id, name')
      .eq('owner_id', req.user.id);
      
    const propertyIds = properties?.map(p => p.id) || [];

    if (propertyIds.length === 0) {
      return res.json({ status: 'success', payments: [] });
    }

    // 2. Fetch all payments with their deeply nested relations
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id, amount_paid, payment_date, payment_method,
        invoices:invoice_id (
          due_date, type,
          leases (
            users ( full_name ),
            rooms ( room_number, properties ( id, name ) ),
            clusters ( name, properties ( id, name ) )
          )
        )
      `)
      .order('payment_date', { ascending: false });

    if (error) throw error;

    // 3. Filter payments in JavaScript to ensure they belong to this owner's properties
    const filteredPayments = payments.filter((payment: any) => {
      const roomPropId = payment.invoices?.leases?.rooms?.properties?.id;
      const clusterPropId = payment.invoices?.leases?.clusters?.properties?.id;
      return propertyIds.includes(roomPropId) || propertyIds.includes(clusterPropId);
    });

    res.json({ status: 'success', payments: filteredPayments });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- 4. TENANT: GET MY PAYMENT HISTORY ---
export const getTenantPayments = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    // 1. Get the tenant's leases
    const { data: leases } = await supabase.from('leases').select('id').eq('tenant_id', req.user.id);
    const leaseIds = leases?.map(l => l.id) || [];

    if (leaseIds.length === 0) return res.json({ status: 'success', payments: [] });

    // 2. Get their invoices
    const { data: invoices } = await supabase.from('invoices').select('id').in('lease_id', leaseIds);
    const invoiceIds = invoices?.map(i => i.id) || [];

    if (invoiceIds.length === 0) return res.json({ status: 'success', payments: [] });

    // 3. Fetch specific payments
    const { data: payments, error } = await supabase
      .from('payments')
      .select(`
        id, amount_paid, payment_date,
        invoices:invoice_id (
          due_date, type,
          leases (
            rooms ( properties ( name ) ),
            clusters ( properties ( name ) )
          )
        )
      `)
      .in('invoice_id', invoiceIds)
      .order('payment_date', { ascending: false });

    if (error) throw error;
    res.json({ status: 'success', payments });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};


// --- 5. THE JIT INVOICE ENGINE (Auto-generates missed months) ---
const syncLeaseInvoices = async (leaseId: string) => {
  // 1. Fetch lease and room details
  const { data: lease } = await supabase
    .from('leases')
    .select('*, rooms(rent_amount), clusters(rent_amount)')
    .eq('id', leaseId)
    .single();

  if (!lease || !lease.start_date) return;

  // Safely find the rent amount
  const rentAmount = lease.rent_amount || lease.rooms?.rent_amount || lease.clusters?.rent_amount || lease.deposit_amount || 0;
  
  const startDate = new Date(lease.start_date);
  const now = new Date();

  // 2. Generate an array of all "Expected" billing dates (1st month, 2nd month, etc.)
  let expectedDates: Date[] = [];
  let tempDate = new Date(startDate);
  
  while (tempDate <= now) {
    expectedDates.push(new Date(tempDate));
    tempDate.setMonth(tempDate.getMonth() + 1); // Move forward 1 month
  }

  // 3. Fetch all existing RENT invoices for this lease
  const { data: existingInvoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('lease_id', leaseId)
    .eq('type', 'RENT');

  // 4. Find which months are missing and create PENDING invoices for them
  const missingInvoices = [];
  
  for (const date of expectedDates) {
    // Check if an invoice already exists for this specific Month and Year
    const exists = existingInvoices?.some(inv => {
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

  // 5. Insert all missing months into the database!
  if (missingInvoices.length > 0) {
    await supabase.from('invoices').insert(missingInvoices);
  }
};

// --- 6. TENANT: GET DASHBOARD METRICS ---
export const getTenantMetrics = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: leases } = await supabase.from('leases').select('id').eq('tenant_id', req.user.id).eq('status', 'ACTIVE');
    if (!leases || leases.length === 0) return res.json({ status: 'success', pendingDues: 0 });

    // Run the JIT Sync for all active leases
    for (const lease of leases) {
      await syncLeaseInvoices(lease.id);
    }

    // Now fetch the sum of all PENDING invoices
    const leaseIds = leases.map(l => l.id);
    const { data: pendingInvoices } = await supabase
      .from('invoices')
      .select('amount')
      .in('lease_id', leaseIds)
      .eq('status', 'PENDING');

    const totalPending = pendingInvoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
    res.json({ status: 'success', pendingDues: totalPending });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- 7. OWNER: GET DASHBOARD METRICS ---
export const getOwnerMetrics = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', req.user.id);
    const propertyIds = properties?.map(p => p.id) || [];

    if (propertyIds.length === 0) return res.json({ status: 'success', totalPending: 0, totalCollected: 0 });

    const { data: leases } = await supabase
      .from('leases')
      .select('id, rooms(property_id), clusters(property_id)')
      .eq('status', 'ACTIVE');

    // Filter leases belonging to this owner
    const ownerLeases = leases?.filter((l: any) => propertyIds.includes(l.rooms?.property_id) || propertyIds.includes(l.clusters?.property_id)) || [];

    // Sync all their tenants' leases
    for (const lease of ownerLeases) {
      await syncLeaseInvoices(lease.id);
    }

    // Calculate sum of PENDING vs PAID
    const ownerLeaseIds = ownerLeases.map(l => l.id);
    const { data: invoices } = await supabase.from('invoices').select('amount, status').in('lease_id', ownerLeaseIds);

    let totalPending = 0;
    let totalCollected = 0;

    invoices?.forEach(inv => {
      if (inv.status === 'PENDING') totalPending += inv.amount;
      if (inv.status === 'PAID') totalCollected += inv.amount;
    });

    res.json({ status: 'success', totalPending, totalCollected });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};