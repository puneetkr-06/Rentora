import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// --- 1. OWNER: CREATE A NOTICE ---
export const createNotice = async (req: AuthRequest, res: Response): Promise<any> => {
  const { property_id, title, content, type } = req.body;
  const owner_id = req.user.id;

  if (!property_id || !title || !content) {
    return res.status(400).json({ error: 'Property ID, Title, and Content are required.' });
  }

  // Enforce the 50-word/250-character limit
  if (content.length > 250) {
    return res.status(400).json({ error: 'Notice content must be 250 characters or less.' });
  }

  try {
    // 1. Verify the logged-in owner actually owns this property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', property_id)
      .eq('owner_id', owner_id)
      .single();

    if (propError || !property) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this property.' });
    }

    // 2. Insert the notice
    const { data: notice, error: insertError } = await supabase
      .from('notices')
      .insert({
        property_id,
        title,
        content,
        type: type || 'GENERAL'
      })
      .select()
      .single();

    if (insertError) throw insertError;

    res.json({ status: 'success', message: 'Notice created successfully!', notice });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- 2. TENANT: GET MY NOTICES ---
export const getTenantNotices = async (req: AuthRequest, res: Response): Promise<any> => {
  const tenant_id = req.user.id;

  try {
    // 1. Find all active leases for this tenant to get their room/cluster details
    const { data: leases, error: leaseError } = await supabase
      .from('leases')
      .select(`
        id,
        rooms ( property_id ),
        clusters ( property_id )
      `)
      .eq('tenant_id', tenant_id)
      .eq('status', 'ACTIVE');

    if (leaseError) throw leaseError;

    if (!leases || leases.length === 0) {
      return res.json({ status: 'success', notices: [] }); // No active leases = No notices
    }

// 2. Extract the unique Property IDs the tenant belongs to
    const propertyIds = new Set<string>();
    
    leases.forEach((lease: any) => {
      // Safely handle whether Supabase returns an array or an object
      const room = Array.isArray(lease.rooms) ? lease.rooms[0] : lease.rooms;
      const cluster = Array.isArray(lease.clusters) ? lease.clusters[0] : lease.clusters;

      if (room?.property_id) propertyIds.add(room.property_id);
      if (cluster?.property_id) propertyIds.add(cluster.property_id);
    });

    const propertyIdArray = Array.from(propertyIds);

    // 3. Fetch notices ONLY for those specific properties
    const { data: notices, error: noticeError } = await supabase
      .from('notices')
      .select(`
        *,
        properties ( name ) 
      `)
      .in('property_id', propertyIdArray)
      .order('created_at', { ascending: false }); // Newest first

    if (noticeError) throw noticeError;

    res.json({ status: 'success', notices });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};