import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

const normalizeComplaint = (complaint: any) => ({
  ...complaint,
  category: complaint?.priority ?? complaint?.category,
  image_url: Array.isArray(complaint?.media_urls)
    ? complaint.media_urls[0] ?? null
    : complaint?.media_urls ?? complaint?.image_url ?? null,
  properties: complaint?.properties ?? {
    name:
      complaint?.rooms?.properties?.name ??
      complaint?.rooms?.properties?.[0]?.name ??
      null,
  },
});

// --- 1. TENANT: CREATE A COMPLAINT ---
export const createComplaint = async (req: AuthRequest, res: Response): Promise<any> => {
  const { title, description, category, image_url, lease_id } = req.body;
  const tenant_id = req.user.id;

  if (!title || !description || !lease_id) return res.status(400).json({ error: 'Title, description, and property selection are required.' });

  try {
    // 1. Look up the specific lease the tenant selected
    const { data: lease } = await supabase
      .from('leases')
      .select('room_id')
      .eq('id', lease_id)
      .eq('tenant_id', tenant_id)
      .single();

    if (!lease) return res.status(403).json({ error: 'Invalid lease selection.' });

    const { data, error } = await supabase
      .from('complaints')
      .insert([{
        tenant_id,
        room_id: lease.room_id,
        title,
        description,
        priority: category,
        media_urls: image_url ? [image_url] : [],
        status: 'OPEN'
      }])
      .select()
      .single();

    if (error) throw error;
    res.json({ status: 'success', complaint: normalizeComplaint(data) });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// --- 2. TENANT: GET MY COMPLAINTS ---
export const getTenantComplaints = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data: complaints, error } = await supabase
      .from('complaints')
      .select('*, rooms(room_number, properties(name))')
      .eq('tenant_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ status: 'success', complaints: (complaints || []).map(normalizeComplaint) });
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

    const { data: rooms } = await supabase.from('rooms').select('id').in('property_id', propertyIds);
    const roomIds = rooms?.map(room => room.id) || [];

    let complaints: any[] = [];
    if (roomIds.length) {
      const complaintSelect = '*, users(full_name, phone), rooms(room_number, properties(name))';
      const { data, error } = await supabase.from('complaints').select(complaintSelect).in('room_id', roomIds).order('created_at', { ascending: false });
      if (error) throw error;
      complaints = data || [];
    }

    const normalizedComplaints = complaints.map(normalizeComplaint);

    res.json({ status: 'success', complaints: normalizedComplaints });
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
    res.json({ status: 'success', complaint: normalizeComplaint(data) });
  } catch (err: any) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};