import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// Helper function to generate a random 6-character Join ID
const generateJoinId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- 1. OWNER: CREATE A LEASE (Generates Join ID) ---
export const createLease = async (req: AuthRequest, res: Response): Promise<any> => {
  const { room_id, start_date, end_date, deposit_amount } = req.body;
  const owner_id = req.user.id; 

  if (!room_id || !start_date || deposit_amount === undefined) {
    return res.status(400).json({ error: 'Room ID, Start Date, and Deposit Amount are required.' });
  }

  try {
    // 1. Verify the logged-in owner actually owns the room (via the property)
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, property_id, properties(owner_id)')
      .eq('id', room_id)
      .single();

    if (roomError || !room || (room.properties as any).owner_id !== owner_id) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this room.' });
    }

    const join_id = generateJoinId();

    // 2. Create the lease (Tenant ID is null until a tenant uses the join_id)
    const { data, error } = await supabase
      .from('leases')
      .insert([
        {
          room_id,
          start_date,
          end_date,
          deposit_amount,
          join_id,
          status: 'ACTIVE'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      message: 'Lease created successfully. Share the Join ID with your tenant.',
      join_id: join_id,
      lease: data
    });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- 2. TENANT: JOIN A ROOM VIA JOIN ID ---
export const joinLease = async (req: AuthRequest, res: Response): Promise<any> => {
  const { join_id } = req.body;
  const tenant_id = req.user.id;

  if (!join_id) {
    return res.status(400).json({ error: 'Join ID is required.' });
  }

  try {
    // 1. Find the lease associated with this Join ID
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('*')
      .eq('join_id', join_id)
      .single();

    if (leaseError || !lease) {
      return res.status(404).json({ error: 'Invalid Join ID. No lease found.' });
    }

    if (lease.tenant_id) {
      return res.status(400).json({ error: 'This Join ID has already been claimed.' });
    }

    // 2. Update the lease to assign the Tenant
    const { error: updateLeaseError } = await supabase
      .from('leases')
      .update({ tenant_id: tenant_id })
      .eq('id', lease.id);

    if (updateLeaseError) throw updateLeaseError;

    // 3. Update the room status to 'OCCUPIED'
    const { error: updateRoomError } = await supabase
      .from('rooms')
      .update({ status: 'OCCUPIED' })
      .eq('id', lease.room_id);

    if (updateRoomError) throw updateRoomError;

    res.status(200).json({
      status: 'success',
      message: 'Successfully joined the room!',
      lease_id: lease.id
    });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- 3. TENANT: GET CURRENT LEASE STATUS ---
export const getMyLease = async (req: AuthRequest, res: Response): Promise<any> => {
  const tenant_id = req.user.id;

  try {
    // Look for an active lease tied to this specific tenant
    const { data: lease, error } = await supabase
      .from('leases')
      .select('*, rooms(*, properties(*))')
      .eq('tenant_id', tenant_id)
      .eq('status', 'ACTIVE')
      .single();

    // If no lease is found, simply return hasLease: false
    if (error || !lease) {
      return res.status(200).json({ status: 'success', hasLease: false });
    }

    // If found, return the lease and property details
    res.status(200).json({
      status: 'success',
      hasLease: true,
      lease: lease
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};