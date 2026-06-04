import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// --- ADD A NEW PROPERTY ---
export const createProperty = async (req: AuthRequest, res: Response): Promise<any> => {
  const { name, address, rules } = req.body;
  const owner_id = req.user.id;

  if (!name || !address) {
    return res.status(400).json({ error: 'Property name and address are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([{ owner_id, name, address, rules }])
      .select().single();

    if (error) throw error;
    res.status(201).json({ status: 'success', property: data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- GET ALL PROPERTIES (UPDATED WITH REVENUE CALCULATION) ---
export const getProperties = async (req: AuthRequest, res: Response): Promise<any> => {
  const owner_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*, rooms(id, status, rent_amount)')
      .eq('owner_id', owner_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate total rooms, available rooms, and total revenue!
    const formattedData = data.map((prop: any) => {
      const total_rooms = prop.rooms ? prop.rooms.length : 0;
      const occupied_rooms = prop.rooms ? prop.rooms.filter((r: any) => r.status === 'OCCUPIED') : [];
      const available_rooms = total_rooms - occupied_rooms.length;
      
      // Sum up the rent_amount for all occupied rooms
      const property_revenue = occupied_rooms.reduce((sum: number, room: any) => sum + (room.rent_amount || 0), 0);
      
      delete prop.rooms; // Keep payload lightweight
      
      return { ...prop, total_rooms, available_rooms, property_revenue };
    });

    res.status(200).json({ status: 'success', properties: formattedData });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- DELETE PROPERTY ---
export const deleteProperty = async (req: AuthRequest, res: Response): Promise<any> => {
  const { propertyId } = req.params;
  const owner_id = req.user.id;

  try {
    // By checking owner_id, we ensure no one else can delete this property.
    // Thanks to our SQL schema setup yesterday, deleting the property will 
    // automatically CASCADE and delete all associated rooms!
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('owner_id', owner_id);

    if (error) throw error;

    res.status(200).json({ status: 'success', message: 'Property and all associated rooms deleted successfully.' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};