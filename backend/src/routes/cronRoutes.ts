import { Router, Request, Response } from 'express';
import supabase from '../config/supabase';

const router = Router();

// GET /api/keep-alive
router.get('/keep-alive', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (error) throw error;

    console.log("⏰ Keep-alive ping successful!");
    res.status(200).json({ status: 'success', message: 'Vercel and Supabase are awake!' });
  } catch (error: any) {
    console.error("Keep-alive failed:", error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;