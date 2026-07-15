import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Route Imports
import authRoutes from './routes/authRoutes';
import propertyRoutes from './routes/propertyRoutes';
import roomRoutes from './routes/roomRoutes';
import leaseRoutes from './routes/leaseRoutes';
import userRoutes from './routes/userRoutes';
import paymentRoutes from './routes/paymentRoutes';
import noticeRoutes from './routes/noticeRoutes';
import complaintRoutes from './routes/complaintRoutes';
import router from './routes/authRoutes';

dotenv.config();

const app = express();
// Add this BEFORE all your route middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://rentoramain.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

const corsOptions = {
  origin: ['http://localhost:3000', 'https://rentoramain.vercel.app'],
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
app.use('/api/keep-alive',router)

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'success', message: 'Rentora API is running perfectly in TypeScript.' });
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