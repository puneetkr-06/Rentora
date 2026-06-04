import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// Helper function to generate a random 6-character Join ID
const generateJoinId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// --- 1. OWNER: CREATE A LEASE (Generates Join ID for Room or Cluster) ---
export const createLease = async (req: AuthRequest, res: Response): Promise<any> => {
  const { room_id, cluster_id, start_date, end_date, deposit_amount } = req.body;
  const owner_id = req.user.id; 

  // Must provide at least a room OR a cluster
  if ((!room_id && !cluster_id) || !start_date || deposit_amount === undefined) {
    return res.status(400).json({ error: 'Room ID or Cluster ID, Start Date, and Deposit Amount are required.' });
  }

  try {
    // Security Check: Verify the owner owns the targeted room or cluster
    if (room_id) {
      const { data: room, error: roomError } = await supabase
        .from('rooms')
        .select('id, properties(owner_id)')
        .eq('id', room_id)
        .single();
      if (roomError || !room || (room.properties as any).owner_id !== owner_id) {
        return res.status(403).json({ error: 'Unauthorized. You do not own this room.' });
      }
    } else if (cluster_id) {
      const { data: cluster, error: clusterError } = await supabase
        .from('clusters')
        .select('id, properties(owner_id)')
        .eq('id', cluster_id)
        .single();
      if (clusterError || !cluster || (cluster.properties as any).owner_id !== owner_id) {
        return res.status(403).json({ error: 'Unauthorized. You do not own this cluster.' });
      }
    }

    const join_id = generateJoinId();

    const { data, error } = await supabase
      .from('leases')
      .insert([
        {
          room_id: room_id || null,
          cluster_id: cluster_id || null,
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

// --- 2. TENANT: JOIN VIA JOIN ID ---
export const joinLease = async (req: AuthRequest, res: Response): Promise<any> => {
  const { join_id } = req.body;
  const tenant_id = req.user.id;

  if (!join_id) {
    return res.status(400).json({ error: 'Join ID is required.' });
  }

  try {
    // 1. Find the lease
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('*')
      .eq('join_id', join_id)
      .single();

    if (leaseError || !lease) return res.status(404).json({ error: 'Invalid Join ID. No lease found.' });
    if (lease.tenant_id) return res.status(400).json({ error: 'This Join ID has already been claimed.' });

    // 2. Update the lease to assign the Tenant
    const { error: updateLeaseError } = await supabase
      .from('leases')
      .update({ tenant_id: tenant_id })
      .eq('id', lease.id);

    if (updateLeaseError) throw updateLeaseError;

    // 3. Update the occupancy status based on whether it's a room or cluster
    if (lease.room_id) {
      await supabase.from('rooms').update({ status: 'OCCUPIED' }).eq('id', lease.room_id);
    } else if (lease.cluster_id) {
      await supabase.from('clusters').update({ status: 'OCCUPIED' }).eq('id', lease.cluster_id);
      // Also mark all sub-rooms inside this cluster as occupied
      await supabase.from('rooms').update({ status: 'OCCUPIED' }).eq('cluster_id', lease.cluster_id);
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully joined the property!',
      lease_id: lease.id
    });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- 3. TENANT: GET CURRENT LEASES (Updated to handle multiple & clusters) ---
export const getMyLeases = async (req: AuthRequest, res: Response): Promise<any> => {
  const tenant_id = req.user.id;

  try {
    // Fetch all active leases, pulling data for either the linked room OR linked cluster
    const { data: leases, error } = await supabase
      .from('leases')
      .select('*, rooms(*, properties(*)), clusters(*, properties(*))')
      .eq('tenant_id', tenant_id)
      .eq('status', 'ACTIVE');

    if (error) throw error;

    if (!leases || leases.length === 0) {
      return res.status(200).json({ status: 'success', hasLeases: false, leases: [] });
    }

    res.status(200).json({
      status: 'success',
      hasLeases: true,
      leases: leases
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// --- 4. OWNER: DIRECTLY ASSIGN TENANT (Bypass Join ID) ---
export const assignExistingTenant = async (req: AuthRequest, res: Response): Promise<any> => {
  const { room_id, cluster_id, tenant_id, start_date, deposit_amount } = req.body;
  const owner_id = req.user.id;

  if ((!room_id && !cluster_id) || !tenant_id || !start_date) {
    return res.status(400).json({ error: 'Room/Cluster ID, Tenant ID, and Start Date are required.' });
  }

  try {
    // Security check
    if (room_id) {
      const { data: room, error: roomError } = await supabase
        .from('rooms').select('id, properties(owner_id)').eq('id', room_id).single();
      if (roomError || !room || (room.properties as any).owner_id !== owner_id) return res.status(403).json({ error: 'Unauthorized.' });
    } else if (cluster_id) {
      const { data: cluster, error: clusterError } = await supabase
        .from('clusters').select('id, properties(owner_id)').eq('id', cluster_id).single();
      if (clusterError || !cluster || (cluster.properties as any).owner_id !== owner_id) return res.status(403).json({ error: 'Unauthorized.' });
    }

    // Insert direct lease
    const { error: leaseError } = await supabase
      .from('leases')
      .insert([{
          room_id: room_id || null,
          cluster_id: cluster_id || null,
          tenant_id,
          start_date,
          deposit_amount: deposit_amount || 0,
          status: 'ACTIVE',
          join_id: 'DIRECT' // Indicates no join code was needed
      }]);

    if (leaseError) throw leaseError;

    // Update statuses
    if (room_id) {
      await supabase.from('rooms').update({ status: 'OCCUPIED' }).eq('id', room_id);
    } else if (cluster_id) {
      await supabase.from('clusters').update({ status: 'OCCUPIED' }).eq('id', cluster_id);
      await supabase.from('rooms').update({ status: 'OCCUPIED' }).eq('cluster_id', cluster_id);
    }

    res.status(201).json({ status: 'success', message: 'Successfully assigned to existing tenant.' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};