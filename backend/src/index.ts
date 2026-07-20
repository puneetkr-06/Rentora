import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import supabase from './config/supabase';
// Route Imports
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import roomRoutes from './routes/roomRoutes';
import leaseRoutes from './routes/leaseRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';
import noticeRoutes from './routes/noticeRoutes';
import complaintRoutes from './routes/complaintRoutes';

dotenv.config();

const app = express();


const corsOptions = {
  origin: function (origin: any, callback: any) {
    callback(null, true); // Allow all origins for dev
  },
  credentials: true,
  optionsSuccessStatus: 200 
};

app.use(cors(corsOptions));
app.use(express.json());

// Route Middleware
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/leases', leaseRoutes); 
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/complaints', complaintRoutes);

app.get('/api/health', async (req: Request, res: Response) => {
try {

    await supabase.from('properties').select('id').limit(1);

    res.status(200).json({ 
      status: 'success', 
      message: 'Rentora API and Supabase are awake and running perfectly.' 
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'API is awake, but Supabase ping failed.' });
  }

});

app.get('/', (req: Request, res: Response) => {
  res.redirect('https://rentoramain.vercel.app/signup'); 
});


if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;