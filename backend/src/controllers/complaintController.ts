import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// --- 1. TENANT: CREATE A COMPLAINT ---
export const createComplaint = async (req: AuthRequest, res: Response): Promise<any> => {
  const { title, description, category, image_url, lease_id } = req.body;
  const tenant_id = req.user.id;

  if (!title || !description || !lease_id) return res.status(400).json({ error: 'Title, description, and property selection are required.' });

  try {
    // 1. Look up the specific lease the tenant selected
    const { data: lease } = await supabase
      .from('leases')
      .select('room_id, cluster_id, rooms(property_id), clusters(property_id)')
      .eq('id', lease_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (!lease) return res.status(403).json({ error: 'Invalid lease selection.' });

    // 2. Safely extract property_id (handling TypeScript arrays vs objects)
    const roomPropId = Array.isArray(lease.rooms) ? lease.rooms[0]?.property_id : (lease.rooms as any)?.property_id;
    const clusterPropId = Array.isArray(lease.clusters) ? lease.clusters[0]?.property_id : (lease.clusters as any)?.property_id;
    const extractedPropertyId = roomPropId || clusterPropId;

    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        tenant_id,
        property_id: extractedPropertyId,
        room_id: lease.room_id,
        cluster_id: lease.cluster_id,
        title,
        description,
        category,
        image_url,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ status: 'success', complaint: data });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- 2. TENANT: GET MY COMPLAINTS ---
export const getTenantComplaints = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*, properties(name), rooms(room_number), clusters(name)') // Added clusters
      .eq('tenant_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ status: 'success', complaints });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- 3. OWNER: GET ALL COMPLAINTS ---
export const getOwnerComplaints = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', req.user.id);
    const propertyIds = properties?.map(p => p.id) || [];

    if (propertyIds.length === 0) return res.json({ status: 'success', complaints: [] });

    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*, users(full_name, phone), properties(name), rooms(room_number), clusters(name)') // Added clusters
      .in('property_id', propertyIds)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ status: 'success', complaints });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- 4. OWNER: UPDATE COMPLAINT STATUS ---
export const updateComplaintStatus = async (req: AuthRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const { data, error } = await supabase
      .from('complaints')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ status: 'success', complaint: data });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};