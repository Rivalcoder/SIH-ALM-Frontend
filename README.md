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
NEXT_PUBLIC_API_BASE_URL=https://untraceable-tiara-fittingly.ngrok-free.dev

# Optional: Set a secondary fallback URL (defaults to http://localhost:8000)
# NEXT_PUBLIC_API_BASE_URL_SECONDARY=http://localhost:8000

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## Environment Variables

Create a `.env.local` file in the root directory with the following:

```env
# Backend API Configuration
# Primary API URL (required)
NEXT_PUBLIC_API_BASE_URL=https://untraceable-tiara-fittingly.ngrok-free.dev

# Secondary fallback URL (optional, defaults to http://localhost:8000)
# The app will automatically try the secondary URL if the primary fails
NEXT_PUBLIC_API_BASE_URL_SECONDARY=http://localhost:8000

# Hosted Model API Configuration (for Chat functionality)
# Model API URL (required for chat feature)
MODEL_API_URL=https://your-hosted-model-api.com/chat
# OR use NEXT_PUBLIC_MODEL_API_URL for client-side access
# NEXT_PUBLIC_MODEL_API_URL=https://your-hosted-model-api.com/chat

# Optional: API Key for model authentication
MODEL_API_KEY=your-api-key-here

# Optional: Additional headers as JSON string (e.g., '{"X-Custom-Header": "value"}')
# MODEL_API_HEADER={"X-Custom-Header": "value"}
```

### API Fallback Mechanism

The application implements an automatic fallback system:
1. **Primary URL**: Tries `NEXT_PUBLIC_API_BASE_URL` first
2. **Secondary URL**: If primary fails, automatically tries `NEXT_PUBLIC_API_BASE_URL_SECONDARY` (or `http://localhost:8000` by default)
3. **Error Display**: If both URLs fail, a detailed error message is shown to the user

This ensures reliability when the primary API endpoint is unavailable (e.g., ngrok tunnel down).

The application uses these URLs to communicate with the backend API for:
- Audio file processing (`/process-audio`)
- Chat functionality (`/chat`)
- Health checks (`/health`)
- Session management (`/session/{session_id}`)

### Chat API with Hosted Model

The chat feature (`/api/chat`) sends the complete audio processed response along with user prompts and system instructions to a hosted model API. The model URL is configured via:
- `MODEL_API_URL` (server-side) or `NEXT_PUBLIC_MODEL_API_URL` (client-side)

The API sends:
- **audioData**: Complete audio analysis results (transcription, diarization, emotions, paralinguistics, etc.)
- **prompt**: User's question/message
- **systemInstruction**: System instructions for the AI model

The hosted model should return a response in the format:
```json
{
  "answer": "AI response text",
  "model": "model-name",
  "model_used": "model-name"
}
```

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
