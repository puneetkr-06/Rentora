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

// --- GET PROPERTY PERFORMANCE STATS ---
export const getPropertyStats = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const ownerId = req.user.id;

    // 1. Fetch all properties owned by the user
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name')
      .eq('owner_id', ownerId);

    if (propError) throw propError;
    if (!properties || properties.length === 0) return res.json({ status: 'success', stats: [] });

    const propertyIds = properties.map(p => p.id);

    // 2. Fetch all rooms belonging to those properties
    const { data: rooms, error: roomError } = await supabase
      .from('rooms')
      .select('id, property_id, status, rent_amount')
      .in('property_id', propertyIds);

    if (roomError) throw roomError;

    // 3. Calculate metrics per property
    const stats = properties.map(property => {
      // Find all rooms for this specific property
      const propertyRooms = rooms?.filter(r => r.property_id === property.id) || [];
      
      const totalRooms = propertyRooms.length;
      const occupiedRooms = propertyRooms.filter(r => r.status === 'OCCUPIED').length;
      
      // Sum the rent only for rooms that actually have tenants
      const expectedRevenue = propertyRooms
        .filter(r => r.status === 'OCCUPIED')
        .reduce((sum, r) => sum + Number(r.rent_amount || 0), 0);

      const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

      return {
        id: property.id,
        name: property.name,
        totalRooms,
        occupiedRooms,
        occupancyPercentage,
        expectedRevenue
      };
    });

    // 4. Sort properties by highest revenue first
    stats.sort((a, b) => b.expectedRevenue - a.expectedRevenue);

    res.json({ status: 'success', stats });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};