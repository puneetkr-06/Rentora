import { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabase';

// Extend the Express Request type so TypeScript knows we are adding a user object
export interface AuthRequest extends Request {
  user?: any;
}

export const requireAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<any> => {
  try {
    // 1. Check if the Authorization header exists
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized. No token provided.' });
    }

    // 2. Extract the token
    const token = authHeader.split(' ')[1];

    // 3. Verify the token with Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Unauthorized. Invalid or expired token.' });
    }

    // 4. Attach the user object to the request so the next function can use it
    req.user = data.user;
    
    // 5. Move to the next function (the controller)
    next();
  } catch (error) {
    res.status(500).json({ error: 'Server error during authentication.' });
  }
};