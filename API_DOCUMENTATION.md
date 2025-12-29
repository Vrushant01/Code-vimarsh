# Code Vimarsh Backend API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

Tokens are obtained after successful login/registration and expire after 30 days.

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [User Endpoints](#user-endpoints)
3. [Project Endpoints](#project-endpoints)
4. [Forum Endpoints](#forum-endpoints)
5. [Event Endpoints](#event-endpoints)
6. [Error Responses](#error-responses)

---

## Authentication Endpoints

### Register User
**POST** `/api/auth/register`

Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "_id": "65f1234567890abcdef12345",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Missing required fields or email already registered
- `500` - Server error

---

### Login User
**POST** `/api/auth/login`

Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "username": "johndoe",
  "email": "john@example.com",
  "avatar": "/uploads/avatars/avatar.jpg",
  "bio": "Software Developer",
  "skills": ["JavaScript", "React", "Node.js"],
  "socialLinks": {
    "github": "https://github.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe"
  },
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401` - Invalid email or password
- `500` - Server error

---

### Get Current User
**GET** `/api/auth/me`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authorized
- `404` - User not found
- `500` - Server error

---

### Update Password
**PUT** `/api/auth/password`

Update user's password.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**
- `400` - Current password is incorrect
- `401` - Not authorized
- `500` - Server error

---

## User Endpoints

### Get User Profile
**GET** `/api/users/:id`

Get public profile of a user by ID.

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404` - User not found
- `500` - Server error

---

### Update User Profile
**PUT** `/api/users/profile`

Update authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```
name: John Doe
bio: Software Developer
skills: ["JavaScript", "React", "Node.js"] (JSON string)
socialLinks: {"github": "https://github.com/johndoe"} (JSON string)
avatar: <file> (optional)
```

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Software Developer",
  "avatar": "/uploads/images/avatar.jpg",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Username already taken
- `401` - Not authorized
- `404` - User not found
- `500` - Server error

---

### Delete User Account
**DELETE** `/api/users/profile`

Delete authenticated user's account.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Account deleted successfully"
}
```

**Error Responses:**
- `401` - Not authorized
- `404` - User not found
- `500` - Server error

---

### Get All Users (Admin Only)
**GET** `/api/users`

Get paginated list of all users. Admin access required.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `search` (optional) - Search by username or email

**Example:**
```
GET /api/users?page=1&limit=20&search=john
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "_id": "65f1234567890abcdef12345",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 100
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized as admin
- `500` - Server error

---

### Update User Role (Admin Only)
**PUT** `/api/users/:id/role`

Update user's role. Admin access required.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "role": "moderator"
}
```

**Valid Roles:** `user`, `moderator`, `admin`

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "moderator",
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400` - Invalid role
- `401` - Not authorized
- `403` - Not authorized as admin
- `404` - User not found
- `500` - Server error

---

## Project Endpoints

### Get All Projects
**GET** `/api/projects`

Get paginated list of all projects.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 12)
- `search` (optional) - Search projects
- `technology` (optional) - Filter by technology (comma-separated)
- `sort` (optional) - Sort order (default: `-createdAt`)

**Example:**
```
GET /api/projects?page=1&limit=12&technology=React,Node.js&sort=-createdAt
```

**Response (200 OK):**
```json
{
  "projects": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "E-Commerce Platform",
      "description": "Full-stack e-commerce application",
      "technologies": ["React", "Node.js", "MongoDB"],
      "githubLink": "https://github.com/user/repo",
      "liveLink": "https://example.com",
      "image": "/uploads/images/project.jpg",
      "likes": ["65f1234567890abcdef12345"],
      "views": 150,
      "author": {
        "_id": "65f1234567890abcdef12345",
        "username": "johndoe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 10,
  "currentPage": 1,
  "total": 120
}
```

---

### Get Single Project
**GET** `/api/projects/:id`

Get detailed information about a project.

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "E-Commerce Platform",
  "description": "Full-stack e-commerce application",
  "technologies": ["React", "Node.js", "MongoDB"],
  "githubLink": "https://github.com/user/repo",
  "liveLink": "https://example.com",
  "image": "/uploads/images/project.jpg",
  "video": "/uploads/videos/demo.mp4",
  "document": "/uploads/documents/readme.pdf",
  "likes": ["65f1234567890abcdef12345"],
  "views": 151,
  "author": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg",
    "bio": "Software Developer"
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404` - Project not found
- `500` - Server error

---

### Create Project
**POST** `/api/projects`

Create a new project. Authentication required.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```
title: E-Commerce Platform
description: Full-stack e-commerce application
technologies: ["React", "Node.js", "MongoDB"] (JSON string)
githubLink: https://github.com/user/repo
liveLink: https://example.com
image: <file> (optional)
video: <file> (optional)
document: <file> (optional)
```

**Response (201 Created):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "E-Commerce Platform",
  "description": "Full-stack e-commerce application",
  "technologies": ["React", "Node.js", "MongoDB"],
  "githubLink": "https://github.com/user/repo",
  "liveLink": "https://example.com",
  "image": "/uploads/images/project.jpg",
  "author": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authorized
- `500` - Server error

---

### Update Project
**PUT** `/api/projects/:id`

Update a project. Only project owner can update.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```
title: Updated Project Title
description: Updated description
technologies: ["React", "Vue", "Node.js"] (JSON string)
githubLink: https://github.com/user/updated-repo
liveLink: https://updated-example.com
image: <file> (optional)
video: <file> (optional)
document: <file> (optional)
```

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Updated Project Title",
  "description": "Updated description",
  "technologies": ["React", "Vue", "Node.js"],
  "githubLink": "https://github.com/user/updated-repo",
  "liveLink": "https://updated-example.com",
  "image": "/uploads/images/updated-project.jpg",
  "author": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized to update this project
- `404` - Project not found
- `500` - Server error

---

### Delete Project
**DELETE** `/api/projects/:id`

Delete a project. Only project owner or admin can delete.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Project deleted successfully"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized to delete this project
- `404` - Project not found
- `500` - Server error

---

### Like/Unlike Project
**POST** `/api/projects/:id/like`

Toggle like on a project. Authentication required.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "likes": 25,
  "isLiked": true
}
```

**Error Responses:**
- `401` - Not authorized
- `404` - Project not found
- `500` - Server error

---

### Get User's Projects
**GET** `/api/projects/user/:userId`

Get all projects by a specific user.

**Response (200 OK):**
```json
[
  {
    "_id": "65f1234567890abcdef12345",
    "title": "E-Commerce Platform",
    "description": "Full-stack e-commerce application",
    "technologies": ["React", "Node.js", "MongoDB"],
    "author": {
      "_id": "65f1234567890abcdef12345",
      "username": "johndoe",
      "avatar": "/uploads/avatars/avatar.jpg"
    },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

## Forum Endpoints

### Get All Topics
**GET** `/api/forum`

Get paginated list of forum topics.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `category` (optional) - Filter by category
- `search` (optional) - Search topics
- `sort` (optional) - Sort order (default: `-createdAt`)

**Example:**
```
GET /api/forum?page=1&limit=20&category=general&sort=-createdAt
```

**Response (200 OK):**
```json
{
  "topics": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "How to use React Hooks?",
      "content": "I'm new to React Hooks...",
      "category": "general",
      "tags": ["react", "hooks"],
      "views": 150,
      "repliesCount": 5,
      "isPinned": false,
      "isLocked": false,
      "author": {
        "_id": "65f1234567890abcdef12345",
        "username": "johndoe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 10,
  "currentPage": 1,
  "total": 200
}
```

---

### Get Single Topic
**GET** `/api/forum/:id`

Get detailed topic with all replies.

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "How to use React Hooks?",
  "content": "I'm new to React Hooks...",
  "category": "general",
  "tags": ["react", "hooks"],
  "views": 151,
  "isPinned": false,
  "isLocked": false,
  "author": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "replies": [
    {
      "_id": "65f1234567890abcdef12346",
      "content": "You can use useState like this...",
      "author": {
        "_id": "65f1234567890abcdef12347",
        "username": "janedoe",
        "avatar": "/uploads/avatars/jane.jpg"
      },
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404` - Topic not found
- `500` - Server error

---

### Create Topic
**POST** `/api/forum`

Create a new forum topic. Authentication required.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "How to use React Hooks?",
  "content": "I'm new to React Hooks and need help...",
  "category": "general",
  "tags": ["react", "hooks"]
}
```

**Response (201 Created):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "How to use React Hooks?",
  "content": "I'm new to React Hooks and need help...",
  "category": "general",
  "tags": ["react", "hooks"],
  "author": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authorized
- `500` - Server error

---

### Update Topic
**PUT** `/api/forum/:id`

Update a topic. Only topic owner or admin can update.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "title": "Updated Topic Title",
  "content": "Updated content...",
  "category": "general",
  "tags": ["react", "hooks", "javascript"]
}
```

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Updated Topic Title",
  "content": "Updated content...",
  "category": "general",
  "tags": ["react", "hooks", "javascript"],
  "author": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized to update this topic
- `404` - Topic not found
- `500` - Server error

---

### Delete Topic
**DELETE** `/api/forum/:id`

Delete a topic. Only topic owner or admin can delete.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Topic deleted successfully"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized to delete this topic
- `404` - Topic not found
- `500` - Server error

---

### Add Reply to Topic
**POST** `/api/forum/:id/replies`

Add a reply to a topic. Authentication required.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "content": "You can use useState like this..."
}
```

**Response (201 Created):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "How to use React Hooks?",
  "content": "I'm new to React Hooks...",
  "replies": [
    {
      "_id": "65f1234567890abcdef12346",
      "content": "You can use useState like this...",
      "author": {
        "_id": "65f1234567890abcdef12347",
        "username": "janedoe",
        "avatar": "/uploads/avatars/jane.jpg"
      },
      "createdAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Topic is locked
- `404` - Topic not found
- `500` - Server error

---

### Delete Reply
**DELETE** `/api/forum/:id/replies/:replyId`

Delete a reply from a topic. Only reply owner or admin can delete.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Reply deleted successfully"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized to delete this reply
- `404` - Topic or reply not found
- `500` - Server error

---

### Pin Topic (Admin Only)
**PUT** `/api/forum/:id/pin`

Toggle pin status of a topic. Admin access required.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "isPinned": true
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized as admin
- `404` - Topic not found
- `500` - Server error

---

### Lock Topic (Admin Only)
**PUT** `/api/forum/:id/lock`

Toggle lock status of a topic. Admin access required.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "isLocked": true
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized as admin
- `404` - Topic not found
- `500` - Server error

---

## Event Endpoints

### Get All Events
**GET** `/api/events`

Get paginated list of published events.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `type` (optional) - Filter by event type
- `upcoming` (optional) - Filter upcoming/past events (`true` or `false`)

**Example:**
```
GET /api/events?page=1&limit=10&type=workshop&upcoming=true
```

**Response (200 OK):**
```json
{
  "events": [
    {
      "_id": "65f1234567890abcdef12345",
      "title": "React Workshop",
      "description": "Learn React from scratch",
      "date": "2024-02-15T10:00:00.000Z",
      "endDate": "2024-02-15T16:00:00.000Z",
      "location": "Online",
      "type": "workshop",
      "image": "/uploads/images/event.jpg",
      "registrationLink": "https://example.com/register",
      "maxParticipants": 50,
      "participants": ["65f1234567890abcdef12345"],
      "organizer": {
        "_id": "65f1234567890abcdef12345",
        "username": "johndoe",
        "avatar": "/uploads/avatars/avatar.jpg"
      },
      "isPublished": true,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "totalPages": 5,
  "currentPage": 1,
  "total": 50
}
```

---

### Get Single Event
**GET** `/api/events/:id`

Get detailed information about an event.

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "React Workshop",
  "description": "Learn React from scratch",
  "date": "2024-02-15T10:00:00.000Z",
  "endDate": "2024-02-15T16:00:00.000Z",
  "location": "Online",
  "type": "workshop",
  "image": "/uploads/images/event.jpg",
  "registrationLink": "https://example.com/register",
  "maxParticipants": 50,
  "participants": [
    {
      "_id": "65f1234567890abcdef12345",
      "username": "johndoe",
      "avatar": "/uploads/avatars/avatar.jpg"
    }
  ],
  "organizer": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "isPublished": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `404` - Event not found
- `500` - Server error

---

### Create Event
**POST** `/api/events`

Create a new event. Moderator or Admin access required.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```
title: React Workshop
description: Learn React from scratch
date: 2024-02-15T10:00:00.000Z
endDate: 2024-02-15T16:00:00.000Z (optional)
location: Online
type: workshop
registrationLink: https://example.com/register (optional)
maxParticipants: 50 (optional)
image: <file> (optional)
```

**Response (201 Created):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "React Workshop",
  "description": "Learn React from scratch",
  "date": "2024-02-15T10:00:00.000Z",
  "endDate": "2024-02-15T16:00:00.000Z",
  "location": "Online",
  "type": "workshop",
  "image": "/uploads/images/event.jpg",
  "registrationLink": "https://example.com/register",
  "maxParticipants": 50,
  "organizer": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "isPublished": false,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized as moderator
- `500` - Server error

---

### Update Event
**PUT** `/api/events/:id`

Update an event. Moderator or Admin access required.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body (multipart/form-data):**
```
title: Updated Event Title
description: Updated description
date: 2024-02-20T10:00:00.000Z
endDate: 2024-02-20T16:00:00.000Z
location: In-Person
type: conference
registrationLink: https://example.com/updated-register
maxParticipants: 100
isPublished: true
image: <file> (optional)
```

**Response (200 OK):**
```json
{
  "_id": "65f1234567890abcdef12345",
  "title": "Updated Event Title",
  "description": "Updated description",
  "date": "2024-02-20T10:00:00.000Z",
  "endDate": "2024-02-20T16:00:00.000Z",
  "location": "In-Person",
  "type": "conference",
  "image": "/uploads/images/updated-event.jpg",
  "registrationLink": "https://example.com/updated-register",
  "maxParticipants": 100,
  "organizer": {
    "_id": "65f1234567890abcdef12345",
    "username": "johndoe",
    "avatar": "/uploads/avatars/avatar.jpg"
  },
  "isPublished": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized as moderator
- `404` - Event not found
- `500` - Server error

---

### Delete Event
**DELETE** `/api/events/:id`

Delete an event. Admin access required.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Event deleted successfully"
}
```

**Error Responses:**
- `401` - Not authorized
- `403` - Not authorized as admin
- `404` - Event not found
- `500` - Server error

---

### Register for Event
**POST** `/api/events/:id/register`

Register for an event. Authentication required.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Successfully registered for event",
  "participantCount": 25
}
```

**Error Responses:**
- `400` - Cannot register for past events / Already registered / Event is full
- `401` - Not authorized
- `404` - Event not found
- `500` - Server error

---

### Unregister from Event
**DELETE** `/api/events/:id/register`

Unregister from an event. Authentication required.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "message": "Successfully unregistered from event",
  "participantCount": 24
}
```

**Error Responses:**
- `400` - Not registered for this event
- `401` - Not authorized
- `404` - Event not found
- `500` - Server error

---

## Error Responses

### Standard Error Format
```json
{
  "message": "Error message description"
}
```

### HTTP Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required or failed
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **500 Internal Server Error** - Server error

### Common Error Messages

- `"Not authorized, no token provided"` - Missing authentication token
- `"Not authorized, token failed"` - Invalid or expired token
- `"Not authorized as admin"` - Admin access required
- `"Not authorized as moderator"` - Moderator access required
- `"Email already registered"` - Email already exists
- `"Invalid email or password"` - Login credentials incorrect
- `"User not found"` - User does not exist
- `"Project not found"` - Project does not exist
- `"Topic not found"` - Topic does not exist
- `"Event not found"` - Event does not exist
- `"Server error"` - Internal server error

---

## Health Check

### Get API Health Status
**GET** `/api/health`

Check if the API is running.

**Response (200 OK):**
```json
{
  "status": "ok",
  "message": "Code Vimarsh API is running"
}
```

---

## Notes

1. **File Uploads**: When uploading files (images, videos, documents), use `multipart/form-data` content type.

2. **Pagination**: Most list endpoints support pagination with `page` and `limit` query parameters.

3. **Authentication**: Include the JWT token in the Authorization header for protected routes:
   ```
   Authorization: Bearer <your_jwt_token>
   ```

4. **Base URL**: All endpoints are prefixed with `/api`

5. **Date Format**: All dates are in ISO 8601 format (e.g., `2024-01-15T10:30:00.000Z`)

6. **JSON Arrays**: When sending arrays in form data, stringify them as JSON (e.g., `["React", "Node.js"]`)

---

## Example Usage with cURL

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Get Projects (Authenticated)
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Project (with file upload)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "title=E-Commerce Platform" \
  -F "description=Full-stack application" \
  -F "technologies=[\"React\",\"Node.js\"]" \
  -F "githubLink=https://github.com/user/repo" \
  -F "image=@/path/to/image.jpg"
```

---

**Last Updated:** January 2024
**API Version:** 1.0.0

