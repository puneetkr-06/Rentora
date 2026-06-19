import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';
import { redis, clearCache } from '../utils/redis';

const generateJoinId = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const createLease = async (req: AuthRequest, res: Response): Promise<any> => {
  const { room_id, cluster_id, start_date, end_date, deposit_amount, rent_amount } = req.body;
  const owner_id = req.user.id;

  if ((!room_id && !cluster_id) || !start_date || deposit_amount === undefined) {
    return res.status(400).json({ error: 'Target ID, Start Date, and Deposit Amount are required.' });
  }

  try {
    if (room_id && rent_amount !== undefined) {
      const { error: roomUpdateError } = await supabase
        .from('rooms')
        .update({ rent_amount: rent_amount })
        .eq('id', room_id);
      
      if (roomUpdateError) throw roomUpdateError;
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

    // Invalidate Owner's property caches because rent_amount may have changed
    await clearCache(`properties_${owner_id}`);
    await clearCache(`property_stats_${owner_id}`);

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

export const joinLease = async (req: AuthRequest, res: Response): Promise<any> => {
  const { join_id } = req.body;
  const tenant_id = req.user.id;

  if (!join_id) {
    return res.status(400).json({ error: 'Join ID is required.' });
  }

  try {
    const { data: lease, error: leaseError } = await supabase
      .from('leases')
      .select('*, rooms(properties(owner_id)), clusters(properties(owner_id))')
      .eq('join_id', join_id)
      .single();

    if (leaseError || !lease) throw new Error('Invalid Join Code. Please check and try again.');
    if (lease.tenant_id) throw new Error('This code has already been claimed by another tenant.');

    const { error: updateError } = await supabase
      .from('leases')
      .update({ tenant_id, status: 'ACTIVE' })
      .eq('id', lease.id);

    if (updateError) throw updateError;

    // Extract owner_id to invalidate their specific caches
    const owner_id = lease.rooms?.properties?.owner_id || lease.clusters?.properties?.owner_id;

    if (lease.room_id) {
      await supabase.from('rooms').update({ status: 'OCCUPIED' }).eq('id', lease.room_id);
    }
    if (lease.cluster_id) {
      await supabase.from('clusters').update({ status: 'OCCUPIED' }).eq('id', lease.cluster_id);
      await supabase.from('rooms').update({ status: 'OCCUPIED' }).eq('cluster_id', lease.cluster_id);
    }

    // Clear caches for both the Tenant and the Owner
    await clearCache(`tenant_leases_${tenant_id}`);
    if (owner_id) {
      await clearCache(`properties_${owner_id}`);
      await clearCache(`property_stats_${owner_id}`);
    }

    res.json({ status: 'success', message: 'Successfully joined property!' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getMyLeases = async (req: AuthRequest, res: Response): Promise<any> => {
  const tenant_id = req.user.id;
  const cacheKey = `tenant_leases_${tenant_id}`;

  try {
    // 1. Check Redis cache first
    const cachedLeases = await redis.get(cacheKey);
    if (cachedLeases) {
      return res.status(200).json({ status: 'success', hasLeases: true, source: 'cache', leases: cachedLeases });
    }

    // 2. Fallback to Supabase
    const { data: leases, error } = await supabase
      .from('leases')
      .select('*, rooms(*, properties(*)), clusters(*, properties(*))')
      .eq('tenant_id', tenant_id)
      .eq('status', 'ACTIVE');

    if (error) throw error;

    if (!leases || leases.length === 0) {
      return res.status(200).json({ status: 'success', hasLeases: false, leases: [] });
    }

    // 3. Save to Redis for 1 hour
    await redis.set(cacheKey, leases, { ex: 3600 });

    res.status(200).json({ status: 'success', hasLeases: true, source: 'database', leases });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const assignExistingTenant = async (req: AuthRequest, res: Response): Promise<any> => {
  const { room_id, cluster_id, tenant_id, start_date, deposit_amount } = req.body;
  const owner_id = req.user.id;

  if ((!room_id && !cluster_id) || !tenant_id || !start_date) {
    return res.status(400).json({ error: 'Room/Cluster ID, Tenant ID, and Start Date are required.' });
  }

  try {
    if (room_id) {
      const { data: room, error: roomError } = await supabase
        .from('rooms').select('id, properties(owner_id)').eq('id', room_id).single();
      if (roomError || !room || (room.properties as any).owner_id !== owner_id) return res.status(403).json({ error: 'Unauthorized.' });
    } else if (cluster_id) {
      const { data: cluster, error: clusterError } = await supabase
        .from('clusters').select('id, properties(owner_id)').eq('id', cluster_id).single();
      if (clusterError || !cluster || (cluster.properties as any).owner_id !== owner_id) return res.status(403).json({ error: 'Unauthorized.' });
    }

    const { error: leaseError } = await supabase
      .from('leases')
      .insert([{
          room_id: room_id || null,
          cluster_id: cluster_id || null,
          tenant_id,
          start_date,
          deposit_amount: deposit_amount || 0,
          status: 'ACTIVE',
          join_id: 'DIRECT'
      }]);

    if (leaseError) throw leaseError;

    if (room_id) {
      await supabase.from('rooms').update({ status: 'OCCUPIED' }).eq('id', room_id);
    } else if (cluster_id) {
      await supabase.from('clusters').update({ status: 'OCCUPIED' }).eq('id', cluster_id);
      await supabase.from('rooms').update({ status: 'OCCUPIED' }).eq('cluster_id', cluster_id);
    }

    // Clear caches for both Owner and the newly assigned Tenant
    await clearCache(`properties_${owner_id}`);
    await clearCache(`property_stats_${owner_id}`);
    await clearCache(`tenant_leases_${tenant_id}`);

    res.status(201).json({ status: 'success', message: 'Successfully assigned to existing tenant.' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};