# GitRid

A web application for bulk deletion of GitHub repositories.

## Overview

GitRid allows you to manage and delete multiple GitHub repositories at once through a clean interface. Authenticate with your GitHub account, select repositories, and delete them in batches.

## Features

-   GitHub OAuth authentication
-   View all repositories with filtering and pagination
-   Select multiple repositories for deletion
-   Bulk delete up to 50 repositories at once
-   Real-time deletion status and feedback
-   Track deletion statistics

## Tech Stack

**Frontend:**

-   React with TypeScript
-   Vite for build tooling
-   TanStack Table for data tables
-   Tailwind CSS for styling
-   Axios for API requests

**Backend:**

-   Node.js with Express
-   MongoDB for data storage
-   JWT for authentication
-   GitHub OAuth integration

## Setup

### Prerequisites

-   Node.js 18 or higher
-   MongoDB instance
-   GitHub OAuth application

### Environment Variables

**Backend** (`.env` in `backend/` directory):

```
PORT=3000
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:5173
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
JWT_SECRET=your_jwt_secret
```

**Frontend** (`.env` in `frontend/` directory):

```
VITE_API_URL=http://localhost:3000
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Visalan-H/GitRid.git
cd GitRid
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

4. Start the backend server:

```bash
cd backend
npm run dev
```

5. Start the frontend development server:

```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173`.

## GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth application
3. Set the authorization callback URL to `http://localhost:3000/api/auth/github/callback`
4. Copy the Client ID and Client Secret to your backend `.env` file

## API Documentation

See [API.md](backend/API.md) for detailed API documentation.

## Project Structure

```
GitRid/
├── backend/
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Authentication middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── server.js        # Entry point
└── frontend/
    └── src/
        ├── components/  # Reusable components
        ├── pages/       # Page components
        └── lib/         # Utilities
```

## Security

-   Authentication tokens are stored in HTTP-only cookies
-   All API endpoints require authentication except login routes
-   Repository deletion requires explicit confirmation
-   Maximum 50 repositories can be deleted per request

## License

MIT License

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## Author

Visalan-H
