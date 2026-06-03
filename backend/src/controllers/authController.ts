import { Request, Response } from 'express';
import supabase from '../config/supabase';
import { createClient } from '@supabase/supabase-js';

export const signup = async (req: Request, res: Response): Promise<any> => {
  const { email, password, full_name, role } = req.body;

  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    // 1. Use the explicit ADMIN API. This creates the user but NEVER logs the server in.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Automatically confirms email for local testing
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('User creation failed.');

    // 2. Because the server didn't log in, it is still a pure Admin and easily bypasses RLS!
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: email,
          full_name: full_name,
          role: role
        }
      ]);

    if (userError) throw userError;

    res.status(201).json({ 
      status: 'success', 
      message: 'Account created successfully.',
      user: { id: authData.user.id, email, role }
    });

  } catch (error: any) {
    res.status(400).json({ status: 'error', message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<any> => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // 1. Create a disposable client JUST for verifying the password.
    // This prevents our main Admin client from being polluted by a user session.
    const authClient = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_ANON_KEY as string,
      { auth: { persistSession: false } }
    );

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) throw authError;

    // 2. Use our clean, global Admin client to fetch the user's role safely
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('full_name, role')
      .eq('id', authData.user.id)
      .single();

    if (userError) throw userError;

    res.status(200).json({
      status: 'success',
      token: authData.session.access_token,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name: userData.full_name,
        role: userData.role
      }
    });

  } catch (error: any) {
    res.status(401).json({ status: 'error', message: error.message });
  }
};