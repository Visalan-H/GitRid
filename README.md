# GitRid

A web application for bulk management of GitHub repositories.

## Overview

GitRid lets you authenticate with GitHub and manage your repositories in bulk — delete, make private, or make public — up to 50 at a time. Repositories are shown in a searchable, filterable table with sorting and pagination. Confirm dialogs let you review and remove individual repos from the pending list before committing.

## Features

-   GitHub OAuth authentication
-   View all repositories with search, language filter, and sortable columns
-   Shift+Click range select, Ctrl+Click individual toggle
-   Editable confirm dialogs — remove repos from the pending list before committing
-   Bulk delete up to 50 repositories at once (requires typing `delete my repos`)
-   Bulk make up to 50 repositories private at once
-   Bulk make up to 50 repositories public at once
-   Make Private / Make Public buttons appear only when the entire selection is uniform visibility
-   Batched GitHub API calls (10 at a time) with per-repo success/failure feedback
-   Track total repositories deleted
-   Dark and light mode support

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
ENCRYPTION_KEY=your_32_char_encryption_key
ENCRYPTION_SALT=your_encryption_salt
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

-   GitHub access tokens are AES-256-CBC encrypted at rest before being stored in MongoDB
-   Auth uses HTTP-only JWT cookie (7-day expiry) — no tokens in localStorage
-   GitHub OAuth CSRF protection via short-lived `oauth_state` HTTP-only cookie with `path: '/'`
-   All API endpoints require authentication except login routes
-   Bulk delete requires typing `delete my repos` to confirm
-   Maximum 50 repositories per bulk operation

## License

MIT License

## Contributing

Contributions are welcome. Please open an issue or submit a pull request.

## Author

Visalan-H
