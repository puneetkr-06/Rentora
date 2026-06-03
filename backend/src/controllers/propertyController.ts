import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// --- ADD A NEW PROPERTY ---
export const createProperty = async (req: AuthRequest, res: Response): Promise<any> => {
  const { name, address, rules } = req.body;
  const owner_id = req.user.id; // Got this from the requireAuth middleware!

  if (!name || !address) {
    return res.status(400).json({ error: 'Property name and address are required.' });
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .insert([
        {
          owner_id: owner_id,
          name,
          address,
          rules
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      status: 'success',
      message: 'Property created successfully.',
      property: data
    });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// --- GET ALL PROPERTIES FOR LOGGED IN OWNER ---
export const getProperties = async (req: AuthRequest, res: Response): Promise<any> => {
  const owner_id = req.user.id;

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('owner_id', owner_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.status(200).json({
      status: 'success',
      properties: data
    });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};