import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import supabase from '../config/supabase';

// Get Current User Profile
export const getProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*') // Selects all columns including the new ones
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.status(200).json({ status: 'success', user: data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

// Update User Profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<any> => {
  // Destructure the fields that can be updated from either tenant or owner profile forms.
  const {
    full_name,
    phone,
    gender,
    date_of_birth,
    permanent_address,
    city,
    state,
    pin_code,
    occupation_type,
    company_name,
    job_title,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_number,
    aadhaar_number,
    profile_photo,
    aadhaar_url,
  } = req.body;

  // Enforce that Full Name cannot be empty (compulsory)
  if (!full_name || full_name.trim() === '') {
    return res.status(400).json({ status: 'error', message: 'Full Name is strictly required and cannot be removed.' });
  }

  try {
    const updatePayload = Object.fromEntries(
      Object.entries({
        full_name,
        phone,
        gender,
        date_of_birth,
        permanent_address,
        city,
        state,
        pin_code,
        occupation_type,
        company_name,
        job_title,
        emergency_contact_name,
        emergency_contact_relationship,
        emergency_contact_number,
        aadhaar_number,
        profile_photo,
        aadhaar_url,
      }).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;
    res.status(200).json({ status: 'success', message: 'Profile updated successfully!', user: data });
  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};