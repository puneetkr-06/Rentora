import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';
import { redis, clearCache } from '../utils/redis';

// --- 1. OWNER: CREATE A NOTICE ---
export const createNotice = async (req: AuthRequest, res: Response): Promise<any> => {
  const { property_id, title, content, type } = req.body;
  const owner_id = req.user.id;

  if (!property_id || !title || !content) {
    return res.status(400).json({ error: 'Property ID, Title, and Content are required.' });
  }

  if (content.length > 250) {
    return res.status(400).json({ error: 'Notice content must be 250 characters or less.' });
  }

  try {
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', property_id)
      .eq('owner_id', owner_id)
      .single();

    if (propError || !property) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this property.' });
    }

    const { data: notice, error: insertError } = await supabase
      .from('notices')
      .insert({ property_id, title, content, type: type || 'GENERAL' })
      .select()
      .single();

    if (insertError) throw insertError;

    // 🚨 FAN-OUT INVALIDATION: Find all tenants in this property and clear their caches
    const { data: activeLeases } = await supabase
      .from('leases')
      .select('tenant_id, rooms(property_id)')
      .eq('status', 'ACTIVE');

    if (activeLeases) {
      activeLeases.forEach(async (lease: any) => {
        const pId = lease.rooms?.property_id;
        if (pId === property_id && lease.tenant_id) {
          await clearCache(`tenant_notices_${lease.tenant_id}`);
        }
      });
    }

    res.json({ status: 'success', message: 'Notice created successfully!', notice });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- 2. TENANT: GET MY NOTICES ---
export const getTenantNotices = async (req: AuthRequest, res: Response): Promise<any> => {
  const tenant_id = req.user.id;
  const cacheKey = `tenant_notices_${tenant_id}`;

  try {
    // 1. Check Redis cache first
    const cachedNotices = await redis.get(cacheKey);
    if (cachedNotices) {
      return res.status(200).json({ status: 'success', source: 'cache', notices: cachedNotices });
    }

    // 2. Fallback to Database
    const { data: leases, error: leaseError } = await supabase
      .from('leases')
      .select(`id, rooms(property_id)`)
      .eq('tenant_id', tenant_id)
      .eq('status', 'ACTIVE');

    if (leaseError) throw leaseError;

    if (!leases || leases.length === 0) {
      return res.json({ status: 'success', source: 'database', notices: [] }); 
    }

    const propertyIds = new Set<string>();
    
    leases.forEach((lease: any) => {
      const room = Array.isArray(lease.rooms) ? lease.rooms[0] : lease.rooms;

      if (room?.property_id) propertyIds.add(room.property_id);
    });

    const propertyIdArray = Array.from(propertyIds);

    const { data: notices, error: noticeError } = await supabase
      .from('notices')
      .select(`*, properties(name)`)
      .in('property_id', propertyIdArray)
      .order('created_at', { ascending: false }); 

    if (noticeError) throw noticeError;

    // 3. Save to Redis for 1 hour
    await redis.set(cacheKey, notices, { ex: 3600 });

    res.json({ status: 'success', source: 'database', notices });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};