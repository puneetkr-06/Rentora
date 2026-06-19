import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';
import { redis, clearCache } from '../utils/redis'; // Import Redis utilities

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

    // Invalidate caches since a new property was added
    await clearCache(`properties_${owner_id}`);
    await clearCache(`property_stats_${owner_id}`);

    res.status(201).json({ status: 'success', property: data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getProperties = async (req: AuthRequest, res: Response): Promise<any> => {
  const owner_id = req.user.id;
  const cacheKey = `properties_${owner_id}`;

  try {
    // 1. Check Redis cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({ status: 'success', source: 'cache', properties: cachedData });
    }

    // 2. Fallback to Supabase if not in cache
    const { data, error } = await supabase
      .from('properties')
      .select('*, rooms(id, status, rent_amount)')
      .eq('owner_id', owner_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formattedData = data.map((prop: any) => {
      const total_rooms = prop.rooms ? prop.rooms.length : 0;
      const occupied_rooms = prop.rooms ? prop.rooms.filter((r: any) => r.status === 'OCCUPIED') : [];
      const available_rooms = total_rooms - occupied_rooms.length;
      
      const property_revenue = occupied_rooms.reduce((sum: number, room: any) => sum + (room.rent_amount || 0), 0);
      delete prop.rooms; 
      
      return { ...prop, total_rooms, available_rooms, property_revenue };
    });

    // 3. Save to Redis for 1 hour (3600 seconds)
    await redis.set(cacheKey, formattedData, { ex: 3600 });

    res.status(200).json({ status: 'success', source: 'database', properties: formattedData });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response): Promise<any> => {
  const { propertyId } = req.params;
  const owner_id = req.user.id;

  try {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('owner_id', owner_id);

    if (error) throw error;

    // Invalidate caches since a property was removed
    await clearCache(`properties_${owner_id}`);
    await clearCache(`property_stats_${owner_id}`);

    res.status(200).json({ status: 'success', message: 'Property deleted successfully.' });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const getPropertyStats = async (req: AuthRequest, res: Response): Promise<any> => {
  const owner_id = req.user.id;
  const cacheKey = `property_stats_${owner_id}`;

  try {
    // 1. Check Redis cache first
    const cachedStats = await redis.get(cacheKey);
    if (cachedStats) {
      return res.status(200).json({ status: 'success', source: 'cache', stats: cachedStats });
    }

    // 2. Fallback to Supabase
    const { data: properties, error: propError } = await supabase
      .from('properties')
      .select('id, name')
      .eq('owner_id', owner_id);

    if (propError) throw propError;
    if (!properties || properties.length === 0) return res.json({ status: 'success', stats: [] });

    const propertyIds = properties.map(p => p.id);

    const { data: rooms, error: roomError } = await supabase
      .from('rooms')
      .select('id, property_id, status, rent_amount')
      .in('property_id', propertyIds);

    if (roomError) throw roomError;

    const stats = properties.map(property => {
      const propertyRooms = rooms?.filter(r => r.property_id === property.id) || [];
      const totalRooms = propertyRooms.length;
      const occupiedRooms = propertyRooms.filter(r => r.status === 'OCCUPIED').length;
      
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

    stats.sort((a, b) => b.expectedRevenue - a.expectedRevenue);

    // 3. Save to Redis for 1 hour
    await redis.set(cacheKey, stats, { ex: 3600 });

    res.json({ status: 'success', source: 'database', stats });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};