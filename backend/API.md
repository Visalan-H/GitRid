# API Documentation

Base URL: `http://localhost:3000`

## Authentication

All authenticated endpoints require a valid JWT token stored in an HTTP-only cookie.

### Get GitHub OAuth URL

Returns the GitHub authorization URL for initiating OAuth flow.

**Endpoint:** `GET /api/auth/github/url`

**Response:**

```json
{
    "url": "https://github.com/login/oauth/authorize?client_id=..."
}
```

### GitHub OAuth Callback

Handles the OAuth callback from GitHub and creates a session.

**Endpoint:** `GET /api/auth/github/callback`

**Query Parameters:**

- `code` (string, required): Authorization code from GitHub

**Response:**

- Redirects to dashboard on success
- Redirects to home with error query parameter on failure

### Get Current User

Returns information about the authenticated user.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Response:**

```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "avatarUrl": "https://avatars.githubusercontent.com/u/123456",
    "deletedRepoCount": 5
}
```

### Logout

Clears the authentication session.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Required

**Response:**

```json
{
    "message": "Logged out successfully"
}
```

## Repositories

### Get All Repositories

Retrieves all repositories owned by the authenticated user.

**Endpoint:** `GET /api/repo/all`

**Authentication:** Required

**Response:**

```json
{
    "count": 42,
    "repos": [
        {
            "id": 123456789,
            "name": "my-project",
            "fullName": "john_doe/my-project",
            "private": false,
            "description": "A sample project",
            "url": "https://github.com/john_doe/my-project",
            "updatedAt": "2025-10-14T12:00:00Z",
            "createdAt": "2024-01-15T08:30:00Z",
            "language": "JavaScript",
            "stars": 15,
            "forks": 3,
            "size": 2048
        }
    ]
}
```

### Delete Repositories

Deletes multiple repositories in bulk.

**Endpoint:** `DELETE /api/repo/delete`

**Authentication:** Required

**Request Body:**

```json
{
    "repoNames": ["repo1", "repo2", "repo3"]
}
```

**Constraints:**

- Maximum 50 repositories per request
- Repository names must be an array of strings
- Only repositories owned by the authenticated user can be deleted

**Response:**

```json
{
    "results": [
        {
            "repo": "repo1",
            "success": true
        },
        {
            "repo": "repo2",
            "success": false,
            "error": "Not Found"
        }
    ],
    "summary": {
        "total": 2,
        "successfulDeletions": 1,
        "failed": 1
    }
}
```

## Error Responses

All endpoints may return the following error responses:

**400 Bad Request**

```json
{
    "message": "Invalid repository names"
}
```

**401 Unauthorized**

```json
{
    "message": "Unauthorized"
}
```

**500 Internal Server Error**

```json
{
    "message": "Error message describing the issue"
}
```

## Rate Limiting

The API processes repository deletions in batches of 10 to avoid hitting GitHub API rate limits.
