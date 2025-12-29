# Code Vimarsh Backend API

Express.js + MongoDB backend for the Code Vimarsh coding club website.

## Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB URI and JWT secret.

5. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/password` | Update password | Yes |

### Projects
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/projects` | Get all projects | No |
| GET | `/api/projects/:id` | Get single project | No |
| GET | `/api/projects/user/:userId` | Get user's projects | No |
| POST | `/api/projects` | Create project | Yes |
| PUT | `/api/projects/:id` | Update project | Yes (owner) |
| DELETE | `/api/projects/:id` | Delete project | Yes (owner) |
| POST | `/api/projects/:id/like` | Toggle like | Yes |

### Forum
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/forum` | Get all topics | No |
| GET | `/api/forum/:id` | Get single topic | No |
| POST | `/api/forum` | Create topic | Yes |
| PUT | `/api/forum/:id` | Update topic | Yes (owner) |
| DELETE | `/api/forum/:id` | Delete topic | Yes (owner) |
| POST | `/api/forum/:id/replies` | Add reply | Yes |
| DELETE | `/api/forum/:id/replies/:replyId` | Delete reply | Yes (owner) |
| PUT | `/api/forum/:id/pin` | Toggle pin | Yes (admin) |
| PUT | `/api/forum/:id/lock` | Toggle lock | Yes (admin) |

### Events
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | Get all events | No |
| GET | `/api/events/:id` | Get single event | No |
| POST | `/api/events` | Create event | Yes (moderator) |
| PUT | `/api/events/:id` | Update event | Yes (moderator) |
| DELETE | `/api/events/:id` | Delete event | Yes (admin) |
| POST | `/api/events/:id/register` | Register for event | Yes |
| DELETE | `/api/events/:id/register` | Unregister from event | Yes |

### Users
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/users/:id` | Get user profile | No |
| PUT | `/api/users/profile` | Update own profile | Yes |
| DELETE | `/api/users/profile` | Delete own account | Yes |
| GET | `/api/users` | Get all users | Yes (admin) |
| PUT | `/api/users/:id/role` | Update user role | Yes (admin) |

## File Uploads

Files are uploaded using `multipart/form-data`:

- **Project files**: `image` (JPG/PNG), `video` (MP4), `document` (PDF)
- **Avatar**: `avatar` (JPG/PNG)
- **Event image**: `image` (JPG/PNG)

Max file size: 50MB

## Deployment

### Environment Variables (Production)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-production-secret
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com
```

### Platforms
- **Render**: Connect GitHub repo, set environment variables
- **Railway**: Deploy from GitHub with auto-detection
- **Heroku**: Use `heroku create` and push

## Project Structure

```
backend/
├── controllers/       # Route handlers
├── middleware/        # Auth & upload middleware
├── models/           # Mongoose schemas
├── routes/           # API routes
├── uploads/          # Uploaded files (gitignored)
├── server.js         # Express app entry
├── package.json
└── .env.example
```

## Security Notes

- Passwords are hashed with bcrypt (10 rounds)
- JWT tokens expire in 30 days
- CORS is configured for the frontend URL
- File uploads are filtered by MIME type
- Ownership checks on update/delete operations
