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
    // 1. Security Check: Verify the property belongs to this owner
    const { data: property, error: propError } = await supabase
      .from('properties')
      .select('id')
      .eq('id', propertyId)
      .eq('owner_id', owner_id)
      .single();

    if (propError || !property) {
      return res.status(403).json({ error: 'Unauthorized to view these rooms.' });
    }

    // 2. Fetch all rooms tied to this property
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      rooms: data
    });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};