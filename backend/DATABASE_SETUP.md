# Database Setup Guide

## PostgreSQL Installation & Configuration

### Option 1: Local PostgreSQL Installation (WSL/Linux)

1. **Install PostgreSQL:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

2. **Start PostgreSQL service:**
```bash
sudo service postgresql start
```

3. **Access PostgreSQL:**
```bash
sudo -u postgres psql
```

4. **Create database and user:**
```sql
CREATE DATABASE ccm_engagemint;
CREATE USER ccm_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE ccm_engagemint TO ccm_user;
\c ccm_engagemint
GRANT ALL ON SCHEMA public TO ccm_user;
\q
```

5. **Run the initialization script:**
```bash
sudo -u postgres psql -d ccm_engagemint -f src/config/init-db.sql
```

6. **Update .env file:**
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ccm_engagemint
DB_USER=ccm_user
DB_PASSWORD=your_secure_password
```

### Option 2: Cloud PostgreSQL (Recommended for Quick Start)

#### Supabase (Free Tier)
1. Go to https://supabase.com
2. Create a new project
3. Get your connection details from Project Settings > Database
4. Update .env with your Supabase credentials
5. Run the SQL from `src/config/init-db.sql` in the Supabase SQL Editor

#### Render (Free Tier)
1. Go to https://render.com
2. Create a new PostgreSQL database
3. Copy the connection details
4. Update .env file
5. Connect and run init-db.sql

#### Railway (Free Tier)
1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy connection credentials
4. Update .env file
5. Run init-db.sql via Railway's built-in SQL editor

## Database Schema

The database includes the following tables:
- **users** - User accounts and profiles
- **tokens** - Creator tokens (KING, QUEEN, etc.)
- **videos** - Video content
- **user_token_balances** - User token holdings
- **communities** - Token-gated communities
- **community_members** - Community membership
- **video_likes** - Video engagement
- **video_comments** - Video comments
- **sessions** - Authentication sessions

## Testing the Connection

After setting up the database, test the connection:

```bash
cd backend
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server is running on port 5000
```

## API Endpoints

Once the database is set up, these endpoints will be available:

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout (requires auth)
- `GET /api/auth/profile` - Get user profile (requires auth)

## Troubleshooting

**Connection Refused:**
- Check if PostgreSQL is running: `sudo service postgresql status`
- Verify credentials in .env file

**Permission Denied:**
- Grant proper permissions to the user
- Check pg_hba.conf for authentication settings

**Cannot connect from WSL:**
- Edit postgresql.conf: `listen_addresses = '*'`
- Update pg_hba.conf to allow connections from your IP
