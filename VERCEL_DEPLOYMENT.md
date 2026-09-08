# Deploying Manufacturing World to Vercel with Neon PostgreSQL

Follow this guide to deploy the **Manufacturing World** B2B marketplace to [Vercel](https://vercel.com) with a serverless [Neon PostgreSQL](https://neon.tech) database.

---

## 1. Create your Serverless Neon Database

1. Sign up or log into [Neon Console](https://console.neon.tech).
2. Click **Create Project**:
   - Project Name: `manufacturing-world`
   - Region: Choose the region closest to your Vercel deployment (e.g., `AWS us-east-2` or `AWS eu-central-1`).
   - PostgreSQL Version: `16` (Default)
3. Under **Connection Details**, copy your pooled connection string:
   ```text
   postgresql://[user]:[password]@[neon-hostname]/neondb?sslmode=require
   ```

---

## 2. Apply Database Schema & Migrations

You can apply the schema either through the Neon SQL Editor or using our automated migration runner:

### Option A: Automated CLI Migration Runner
Run the migration script directly from your terminal:
```bash
DATABASE_URL="postgresql://[user]:[password]@[neon-hostname]/neondb?sslmode=require" npm run db:neon-migrate
```

### Option B: Neon SQL Editor
1. In Neon Console, click **SQL Editor**.
2. Copy and paste the contents of [`neon/schema.sql`](./neon/schema.sql) and click **Run**.
3. Copy and paste the contents of [`neon/seed.sql`](./neon/seed.sql) and click **Run**.

---

## 3. Deploy to Vercel (1-Click GitHub Import)

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Select your repository: **`sagarw0/Manufacturing_World`**.
4. Configure Project Settings:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. In **Environment Variables**, add:
   - `DATABASE_URL`: `postgresql://[user]:[password]@[neon-hostname]/neondb?sslmode=require`
   - `NEON_DATABASE_URL`: `postgresql://[user]:[password]@[neon-hostname]/neondb?sslmode=require`
   - `NEXT_PUBLIC_APP_URL`: `https://[your-project-slug].vercel.app`
6. Click **Deploy**.

Vercel will compile the Next.js App Router project and publish your live production URL in under 60 seconds!

---

## 4. Continuous Deployment & Releases

Every time you push new commits to the `main` branch of `https://github.com/sagarw0/Manufacturing_World`, Vercel automatically runs `npm run build`, executes edge function optimization, and releases the update with zero downtime.
