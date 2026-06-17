Check the Feature & Functionality Tour of Website with below attached Video :

https://github.com/user-attachments/assets/7b2436c0-1e46-4f4d-b4d5-edd88ff67723


## 1. Project Overview
### 1.1 Product Summary
**Rentora** is a dual-sided Real Estate & Property Management platform serving two distinct user personas:

- **Property Owners**: Manage properties, rooms, leases, payments, complaints, and broadcast notices to tenants
- **Tenants**: View lease details, make payments, submit complaints, and receive property notices
### 1.2 Dual-Sided Architecture Principle
The platform operates as a single codebase with role-based access control. User role (`owner` | `tenant`) determines:

- Dashboard views and navigation
- Available API endpoints
- Data visibility and mutation permissions

 ## 2. Tech Stack & Deployment Architecture
 ### 2.1 Technology Stack

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│  Framework:      Next.js 14+ (App Router)                       │
│  UI Library:     React 18+                                      │
│  Styling:        Tailwind CSS                                   │
│  Language:       TypeScript (strict mode)                       │
│  Hosting:        Vercel (Edge Network)                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
├─────────────────────────────────────────────────────────────────┤
│  Framework:      Express.js                                     │
│  Runtime:        Node.js 18+                                    │
│  Language:       TypeScript (strict mode)                       │
│  Hosting:        Vercel Serverless Functions                    │
│  Entry Point:    api/index.ts                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       DATA LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│  Database:       PostgreSQL                                     │
│  Authentication: Supabase Auth                                  │     │
└─────────────────────────────────────────────────────────────────┘

### 2.2 Deployment Architecture

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│   Vercel Edge    │────▶│ Vercel Serverless│────▶│   PostgreSQL     │
│   (Next.js SSR)  │     │ (Express API)    │     │   (Supabase)     │
│                  │     │                  │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
   Static Assets            /api/*  routes          Supabase Auth
   Client Hydration         JWT Validation          User Management
   
# Rentora – High-Level System Architecture

 <img width="1039" height="688" alt="highlevelarch" src="https://github.com/user-attachments/assets/9e15c325-e884-4c0e-bdb4-748097cbec42" />

# Rentora – Authentication & Role-Based Routing

<img width="890" height="1089" alt="autharch" src="https://github.com/user-attachments/assets/658c82a8-9382-44b7-9eba-0a7b582d8550" />

DATABASE ARCHITECTURE

<img width="1762" height="1176" alt="diagram-export-17-06-2026-15_57_04" src="https://github.com/user-attachments/assets/8985d08b-d519-4cd3-9f62-27a3ff5d16a1" />




