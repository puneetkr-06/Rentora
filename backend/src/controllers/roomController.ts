import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// --- ADD A NEW ROOM ---
export const createRoom = async (req: AuthRequest, res: Response): Promise<any> => {
  const { property_id, room_number, type, rent_amount, capacity } = req.body;
  const owner_id = req.user.id;

  if (!property_id || !room_number || !type || !rent_amount) {
    return res.status(400).json({ error: 'Property ID, Room Number, Type, and Rent Amount are required.' });
  }

  try {
    // 1. Security Check: Verify the property belongs to this owner
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', property_id)
      .eq('owner_id', owner_id)
      .single();

    if (propError || !property) {
      return res.status(403).json({ error: 'Unauthorized. You do not own this property.' });
    }

    // 2. Insert the room into the database
    const { data, error } = await supabase
      .from('rooms')
      .insert([
        {
          property_id,
          room_number,
          type,
          rent_amount,
          capacity: capacity || 1,
          status: 'VACANT'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      message: 'Room created successfully.',
      room: data
    });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- GET ALL ROOMS FOR A SPECIFIC PROPERTY ---
export const getRoomsByProperty = async (req: AuthRequest, res: Response): Promise<any> => {
  const { propertyId } = req.params;
  const owner_id = req.user.id;

  try {
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('owner_id', owner_id)
      .single();

    if (propError || !property) {
      return res.status(403).json({ error: 'Unauthorized to view these rooms.' });
    }

    // UPDATED: Now we fetch the active lease and the tenant's full profile details!
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        leases (
          id, start_date, deposit_amount, status,
          users (
            full_name, email, phone, gender, date_of_birth,
            permanent_address, city, state, pin_code,
            occupation_type, company_name, job_title,
            emergency_contact_name, emergency_contact_relationship, emergency_contact_number,
            aadhaar_number
          )
        )
      `)
      .eq('property_id', propertyId)
      .order('room_number', { ascending: true });

    if (error) throw error;

    res.status(200).json({ status: 'success', rooms: data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deallocateRoom = async (req: AuthRequest, res: Response): Promise<any> => {
  const { roomId } = req.params;
  const owner_id = req.user.id;

  try {
    // 1. Verify the owner owns this room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, properties(owner_id)')
      .eq('id', roomId)
      .single();

    if (roomError || !room || (room.properties as any).owner_id !== owner_id) {
      return res.status(403).json({ error: 'Unauthorized.' });
    }

    // 2. Mark any ACTIVE leases for this room as PAST
    const { error: leaseError } = await supabase
      .from('leases')
      .update({ status: 'PAST' })
      .eq('room_id', roomId)
      .eq('status', 'ACTIVE');

    if (leaseError) throw leaseError;

    // 3. Mark the room as VACANT
    const { error: updateRoomError } = await supabase
      .from('rooms')
      .update({ status: 'VACANT' })
      .eq('id', roomId);

    if (updateRoomError) throw updateRoomError;

    res.status(200).json({ status: 'success', message: 'Room successfully deallocated.' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- DELETE A ROOM (Cascades & Removes Tenants Automatically) ---
export const deleteRoom = async (req: AuthRequest, res: Response): Promise<any> => {
  const { roomId } = req.params;
  const owner_id = req.user.id;

  try {
    // 1. Verify the owner actually owns the property this room belongs to
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('id, properties(owner_id)')
      .eq('id', roomId)
      .single();

    if (roomError || !room || (room.properties as any).owner_id !== owner_id) {
      return res.status(403).json({ error: 'Unauthorized to delete this room.' });
    }

    // 2. Delete the room. 
    // Thanks to the ON DELETE CASCADE schema, any leases/tenant allocations 
    // attached to this room will be automatically wiped from the database!
    const { error: deleteError } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (deleteError) throw deleteError;

    res.status(200).json({ status: 'success', message: 'Room and all associated tenant allocations deleted successfully.' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};