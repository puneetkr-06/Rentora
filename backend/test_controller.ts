import express from 'express';
import { getOwnerMetrics } from './src/controllers/paymentController';
import { AuthRequest } from './src/middleware/authMiddleware';

async function test() {
  const req = {
    user: { id: 'fae66040-b24a-4739-bd17-e6de04fa3ec7' }
  } as unknown as AuthRequest;

  const res = {
    json: (data: any) => console.log("Success:", data),
    status: (code: number) => ({
      json: (data: any) => console.log(`Error ${code}:`, data)
    })
  } as unknown as express.Response;

  await getOwnerMetrics(req, res);
}

test();
