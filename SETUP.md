# CCM Engagemint - Production Setup Guide

This guide will help you set up the CCM Engagemint application for production.

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Vercel Postgres or Supabase recommended)
- TikTok Developer Account
- Instagram/Meta Developer Account
- Vercel account (for deployment and Blob storage)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in all required environment variables:

### Database Setup

Get a PostgreSQL connection string from:
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres
- **Supabase**: https://supabase.com/docs/guides/database

```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### JWT Secret

Generate a secure random string (minimum 32 characters):

```bash
# Generate on macOS/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```bash
JWT_SECRET="your-generated-secret-here"
```

### Password Hash

Generate a bcrypt hash for your access password:

```bash
# Replace 'YourSecurePassword' with your desired password
node -e "console.log(require('bcryptjs').hashSync('YourSecurePassword', 10))"
```

```bash
APP_PASSWORD_HASH="$2a$10$..."
```

### TikTok OAuth

1. Go to https://developers.tiktok.com/
2. Create a new app
3. Get your Client Key and Client Secret
4. Set redirect URI to: `https://yourdomain.com/auth/tiktok/callback`

```bash
NEXT_PUBLIC_TIKTOK_CLIENT_KEY="your-tiktok-client-key"
TIKTOK_CLIENT_SECRET="your-tiktok-client-secret"
NEXT_PUBLIC_TIKTOK_REDIRECT_URI="https://yourdomain.com/auth/tiktok/callback"
```

### Instagram OAuth

1. Go to https://developers.facebook.com/
2. Create a new app with Instagram Basic Display
3. Get your Client ID and Client Secret
4. Set redirect URI to: `https://yourdomain.com/auth/instagram/callback`

```bash
NEXT_PUBLIC_INSTAGRAM_CLIENT_ID="your-instagram-client-id"
INSTAGRAM_CLIENT_SECRET="your-instagram-client-secret"
NEXT_PUBLIC_INSTAGRAM_REDIRECT_URI="https://yourdomain.com/auth/instagram/callback"
```

### Vercel Blob Storage

1. Go to https://vercel.com/docs/storage/vercel-blob
2. Create a Blob store
3. Copy the read/write token

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
```

## Step 3: Set Up Database

1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

3. (Optional) Seed database with sample data:
   ```bash
   npx prisma db seed
   ```

## Step 4: Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and enter your password to access the app.

## Step 5: Deploy to Production

### Vercel Deployment

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Add all environment variables in Vercel dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add all variables from `.env.local`

4. Redeploy after adding environment variables

### Important Production Checklist

- [ ] Database is set up and migrations are run
- [ ] All environment variables are configured
- [ ] JWT_SECRET is a strong random string
- [ ] APP_PASSWORD_HASH is set correctly
- [ ] OAuth redirect URIs match your production domain
- [ ] BLOB_READ_WRITE_TOKEN is configured
- [ ] NODE_ENV is set to "production"

## Security Notes

1. **Never commit `.env.local` to git** - it's already in `.gitignore`
2. **Use strong passwords** - minimum 12 characters recommended
3. **Rotate secrets regularly** - especially JWT_SECRET and passwords
4. **Enable HTTPS** - required for secure cookies (automatic on Vercel)
5. **Monitor rate limits** - adjust in production based on traffic

## Troubleshooting

### Database Connection Issues

- Ensure your DATABASE_URL includes `?sslmode=require` for secure connections
- Check that your database allows connections from Vercel IPs
- Verify your database credentials are correct

### OAuth Issues

- Verify redirect URIs exactly match your configuration
- Check that scopes are approved in developer consoles
- Ensure client secrets are not exposed in client-side code

### Build Errors

If you get Prisma-related errors during build:
```bash
npx prisma generate
npm run build
```

## Development vs Production

### Development
- Uses `npm run dev` with hot reloading
- Rate limits are more lenient
- Detailed error messages
- Database logs are verbose

### Production
- Uses `npm run build && npm start`
- Stricter rate limits
- Generic error messages for security
- Minimal database logging

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [TikTok Developer Docs](https://developers.tiktok.com/doc)
- [Instagram API Docs](https://developers.facebook.com/docs/instagram-basic-display-api)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review error logs in Vercel dashboard
3. Check Prisma Studio: `npx prisma studio`
4. Review database logs in your provider's dashboard
