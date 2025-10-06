# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.5.3 application with:
- TypeScript
- Tailwind CSS v4
- App Router
- Turbopack enabled
- ESLint for linting

## Commands

```bash
# Development
npm run dev        # Start development server with Turbopack on http://localhost:3000

# Build & Production
npm run build      # Build for production with Turbopack
npm run start      # Start production server

# Code Quality
npm run lint       # Run ESLint
```

## CRITICAL: Server Management Protocol

**ALWAYS follow this protocol before starting any server:**

1. **Check for syntax errors first:**
   ```bash
   npm run lint
   ```

2. **Kill ALL existing Next.js processes:**
   ```bash
   pkill -f "next dev"
   ```

3. **Clear build cache completely:**
   ```bash
   rm -rf .next
   ```

4. **Start server on new port if conflicts exist:**
   ```bash
   npm run dev -- -p 3001  # or 3002, 3003, etc.
   ```

5. **Verify server is working:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" http://localhost:[PORT]
   ```

**Never start a server without following this protocol to prevent build manifest conflicts.**

## Project Structure

- `/app` - App Router pages and layouts
  - `layout.tsx` - Root layout component
  - `page.tsx` - Home page component
  - `globals.css` - Global styles with Tailwind directives
- `/components` - React components
  - `ReelsInterface.tsx` - Main video feed with engagement analytics
  - `CreatorProfile.tsx` - Creator profile and content management
  - `MintInterface.tsx` - Token minting and trading interface
  - `CommunityHub.tsx` - Community features and governance
  - `PasswordGate.tsx` - Authentication component
- `/public` - Static assets
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.mjs` - ESLint configuration

## Development Notes

- Pages auto-update on file changes during development
- Import alias `@/*` is configured for absolute imports
- Using Next.js font optimization with Geist font family
- Build manifest conflicts are common - always follow server management protocol
- Application uses password "ccm2024" for access