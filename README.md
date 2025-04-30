# Financial Dashboard with AI Assistant

A modern financial dashboard with an AI assistant powered by OpenAI's GPT models.

## Features

- Interactive financial dashboard with various visualization modules
- AI assistant for natural language interaction
- Secure backend handling of OpenAI API calls
- Support for both OpenAI and Azure OpenAI services

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- OpenAI API key or Azure OpenAI credentials

## Setup

1. Clone the repository
2. Copy `_env.example` to `.env` and fill in your configuration:

   ```bash
   cp _env.example .env
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   # Start both frontend and backend
   npm run dev:all

   # Or start them separately:
   npm run server  # Backend
   npm run dev     # Frontend
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Environment Variables

### Frontend

- `VITE_API_URL`: Backend API URL (default: http://localhost:3000/api)

### Backend

- `PORT`: Backend server port (default: 3000)
- `OPENAI_API_KEY`: Your OpenAI API key
- `OPENAI_MODEL`: OpenAI model to use (default: gpt-4-turbo-preview)

### Azure OpenAI (Optional)

- `USE_AZURE`: Set to 'true' to use Azure OpenAI
- `AZURE_BASE_URL`: Your Azure OpenAI endpoint
- `AZURE_API_VERSION`: Azure OpenAI API version
- `AZURE_DEPLOYMENT_NAME`: Your model deployment name in Azure

## Development

The project is structured as follows:

- `/src`: Frontend React application
  - `/components`: React components
  - `/visualizations`: Dashboard visualization modules
  - `/utils`: Utility functions
- `/server`: Backend Node.js service
  - `index.js`: Express server and OpenAI integration

## Security

The OpenAI API key is now securely stored on the backend server and never exposed to the client. All AI interactions are proxied through the backend API.
