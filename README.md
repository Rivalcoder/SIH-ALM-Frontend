# ALM-Asia | Audio Intelligence Platform

Next-gen audio intelligence engine that listens, thinks, and understands the entire sonic world — from speech to emotion to environmental reality.

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Set up environment variables
# Create a .env.local file in the root directory with:
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# For production, update to your production API URL:
# NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

- **Development**: Use `http://localhost:8000` (or your local backend URL)
- **Production**: Update to your production API domain (e.g., `https://your-api-domain.com`)

The application will use this URL to communicate with the backend API for:
- Audio file processing (`/process-audio`)
- Chat functionality (`/chat`)
- Health checks (`/health`)
- Session management (`/session/{session_id}`)

## Technologies

This project is built with:

- Next.js
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint

## Deployment

Build the application and deploy to your preferred hosting platform (Vercel, Netlify, etc.).

```sh
npm run build
npm run start
```
