import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// --- CREATE A CLUSTER (Group Rooms) ---
export const createCluster = async (req: AuthRequest, res: Response): Promise<any> => {
  const { property_id, name, room_ids } = req.body;
  const owner_id = req.user.id;

  if (!property_id || !name || !room_ids || room_ids.length === 0) {
    return res.status(400).json({ error: 'Property ID, Cluster Name, and Room IDs are required.' });
  }

  try {
    // 1. Verify owner owns this property
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', property_id)
      .eq('owner_id', owner_id)
      .single();

    if (propError || !property) return res.status(403).json({ error: 'Unauthorized.' });

    // 2. Create the Cluster
    const { data: cluster, error: clusterError } = await supabase
      .from('clusters')
      .insert([{ property_id, name, status: 'VACANT' }])
      .select()
      .single();

    if (clusterError) throw clusterError;

    // 3. Update the selected rooms to belong to this new cluster
    const { error: roomUpdateError } = await supabase
      .from('rooms')
      .update({ cluster_id: cluster.id })
      .in('id', room_ids);

    if (roomUpdateError) throw roomUpdateError;

    res.status(201).json({ status: 'success', message: 'Cluster created!', cluster });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- DECLUSTERIZE (Dissolve Cluster) ---
export const deleteCluster = async (req: AuthRequest, res: Response): Promise<any> => {
  const { clusterId } = req.params;

  try {
    // 1. Check if the cluster is vacant (Cannot declusterize if a tenant is living there!)
    const { data: cluster, error: fetchError } = await supabase
      .from('clusters')
      .select('status')
      .eq('id', clusterId)
      .single();

    if (fetchError || !cluster) return res.status(404).json({ error: 'Cluster not found.' });
    if (cluster.status === 'OCCUPIED') {
      return res.status(400).json({ error: 'Cannot dissolve an occupied cluster. Deallocate the tenant first.' });
    }

    // 2. Delete the cluster. 
    // Because we used ON DELETE SET NULL in our SQL, deleting this will automatically 
    // free all the rooms and make them independent again!
    const { error: deleteError } = await supabase
      .from('clusters')
      .delete()
      .eq('id', clusterId);

    if (deleteError) throw deleteError;

    res.status(200).json({ status: 'success', message: 'Cluster dissolved into independent rooms.' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};