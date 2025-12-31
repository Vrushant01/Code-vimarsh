/**
 * Central API Service Layer
 * Handles all API calls with automatic JWT token management and error handlingd
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL for the backend API - MUST be set via VITE_API_URL in Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api'; // Fallback to relative path for same-domain deployment

/**
 * Create axios instance with default configuration
 */
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor: Automatically attach JWT token to requests
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('codevimarsh_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor: Handle common errors and token expiration
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear storage and redirect to login
      localStorage.removeItem('codevimarsh_token');
      localStorage.removeItem('codevimarsh_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * Extract error message from API response
 */
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message || axiosError.message || 'An error occurred';
  }
  return 'An unexpected error occurred';
};

// ==================== AUTHENTICATION API ====================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  _id: string;
  username?: string;
  name?: string;
  email: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
  };
  role?: string;
  token: string;
}

export interface User {
  _id: string;
  name?: string;
  username?: string;
  email: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  socialLinks?: {
    github?: string;
    linkedin?: string;
  };
  role?: string;
  createdAt?: string;
}

/**
 * Register a new user
 * Returns token in response for immediate login
 */
export const registerUser = async (data: RegisterRequest): Promise<{ success: boolean; user?: User; token?: string; message?: string; error?: string }> => {
  try {
    const response = await api.post<{ _id: string; username: string; email: string; role: string; token: string }>('/auth/register', data);
    return {
      success: true,
      user: {
        _id: response.data._id,
        username: response.data.username,
        email: response.data.email,
        role: response.data.role,
      },
      token: response.data.token,
      message: 'Registration successful',
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Login user
 */
export const loginUser = async (data: LoginRequest): Promise<{ success: boolean; data?: LoginResponse; error?: string }> => {
  try {
    const response = await api.post<LoginResponse>('/auth/login', data);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await api.get<User>('/auth/me');
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Update password
 */
export const updatePassword = async (data: { currentPassword: string; newPassword: string }): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await api.put<{ message: string }>('/auth/password', data);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ==================== USER API ====================

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await api.get<User>(`/users/${userId}`);
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Update user profile (supports file uploads)
 */
export const updateUserProfile = async (data: FormData): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await api.put<User>('/users/profile', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Delete user account
 */
export const deleteUserAccount = async (): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await api.delete<{ message: string }>('/users/profile');
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ==================== PROJECT API ====================

export interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
  image?: string;
  video?: string;
  document?: string;
  likes: string[];
  views: number;
  author: {
    _id: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface ProjectsResponse {
  projects: Project[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  technology?: string;
  sort?: string;
}

/**
 * Get all projects with pagination and filters
 */
export const getProjects = async (params?: ProjectQueryParams): Promise<{ success: boolean; data?: ProjectsResponse; error?: string }> => {
  try {
    const response = await api.get<ProjectsResponse>('/projects', { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Get single project by ID
 */
export const getProject = async (projectId: string): Promise<{ success: boolean; project?: Project; error?: string }> => {
  try {
    const response = await api.get<Project>(`/projects/${projectId}`);
    return {
      success: true,
      project: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Create a new project (supports file uploads)
 */
export const createProject = async (data: FormData): Promise<{ success: boolean; project?: Project; error?: string }> => {
  try {
    const response = await api.post<Project>('/projects', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      project: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Update a project (supports file uploads)
 */
export const updateProject = async (projectId: string, data: FormData): Promise<{ success: boolean; project?: Project; error?: string }> => {
  try {
    const response = await api.put<Project>(`/projects/${projectId}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      success: true,
      project: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Delete a project
 */
export const deleteProject = async (projectId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/projects/${projectId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Like/Unlike a project
 */
export const toggleProjectLike = async (projectId: string): Promise<{ success: boolean; likes?: number; isLiked?: boolean; error?: string }> => {
  try {
    const response = await api.post<{ likes: number; isLiked: boolean }>(`/projects/${projectId}/like`);
    return {
      success: true,
      likes: response.data.likes,
      isLiked: response.data.isLiked,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Get user's projects
 */
export const getUserProjects = async (userId: string): Promise<{ success: boolean; projects?: Project[]; error?: string }> => {
  try {
    const response = await api.get<Project[]>(`/projects/user/${userId}`);
    return {
      success: true,
      projects: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ==================== FORUM API ====================

export interface Topic {
  _id: string;
  title: string;
  content: string;
  category?: string;
  tags: string[];
  views: number;
  repliesCount?: number;
  isPinned?: boolean;
  isLocked?: boolean;
  author: {
    _id: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  replies?: Reply[];
  createdAt: string;
}

export interface Reply {
  _id: string;
  content: string;
  author: {
    _id: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface TopicsResponse {
  topics: Topic[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface TopicQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sort?: string;
}

export interface CreateTopicRequest {
  title: string;
  content: string;
  category?: string;
  tags: string[];
}

/**
 * Get all forum topics
 */
export const getTopics = async (params?: TopicQueryParams): Promise<{ success: boolean; data?: TopicsResponse; error?: string }> => {
  try {
    const response = await api.get<TopicsResponse>('/forum', { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Get single topic by ID
 */
export const getTopic = async (topicId: string): Promise<{ success: boolean; topic?: Topic; error?: string }> => {
  try {
    const response = await api.get<Topic>(`/forum/${topicId}`);
    return {
      success: true,
      topic: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Create a new topic
 */
export const createTopic = async (data: CreateTopicRequest): Promise<{ success: boolean; topic?: Topic; error?: string }> => {
  try {
    const response = await api.post<Topic>('/forum', data);
    return {
      success: true,
      topic: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Update a topic
 */
export const updateTopic = async (topicId: string, data: CreateTopicRequest): Promise<{ success: boolean; topic?: Topic; error?: string }> => {
  try {
    const response = await api.put<Topic>(`/forum/${topicId}`, data);
    return {
      success: true,
      topic: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Delete a topic
 */
export const deleteTopic = async (topicId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/forum/${topicId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Add reply to a topic
 */
export const addReply = async (topicId: string, content: string): Promise<{ success: boolean; topic?: Topic; error?: string }> => {
  try {
    const response = await api.post<Topic>(`/forum/${topicId}/replies`, { content });
    return {
      success: true,
      topic: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Delete a reply
 */
export const deleteReply = async (topicId: string, replyId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/forum/${topicId}/replies/${replyId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ==================== EVENT API ====================

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  type: string;
  image?: string;
  registrationLink?: string;
  maxParticipants?: number;
  participants: string[] | Array<{ _id: string; username?: string; name?: string; avatar?: string }>;
  organizer: {
    _id: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  isPublished: boolean;
  createdAt: string;
}

export interface EventsResponse {
  events: Event[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export interface EventQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  upcoming?: boolean;
}

/**
 * Get all events
 */
export const getEvents = async (params?: EventQueryParams): Promise<{ success: boolean; data?: EventsResponse; error?: string }> => {
  try {
    const response = await api.get<EventsResponse>('/events', { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Get single event by ID
 */
export const getEvent = async (eventId: string): Promise<{ success: boolean; event?: Event; error?: string }> => {
  try {
    const response = await api.get<Event>(`/events/${eventId}`);
    return {
      success: true,
      event: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Create a new event (admin/moderator only)
 */
export const createEvent = async (data: FormData): Promise<{ success: boolean; event?: Event; error?: string }> => {
  try {
    // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
    const response = await api.post<Event>('/events', data);
    return {
      success: true,
      event: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Register for an event
 */
export const registerForEvent = async (eventId: string): Promise<{ success: boolean; message?: string; participantCount?: number; error?: string }> => {
  try {
    const response = await api.post<{ message: string; participantCount: number }>(`/events/${eventId}/register`);
    return {
      success: true,
      message: response.data.message,
      participantCount: response.data.participantCount,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Unregister from an event
 */
export const unregisterFromEvent = async (eventId: string): Promise<{ success: boolean; message?: string; participantCount?: number; error?: string }> => {
  try {
    const response = await api.delete<{ message: string; participantCount: number }>(`/events/${eventId}/register`);
    return {
      success: true,
      message: response.data.message,
      participantCount: response.data.participantCount,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Delete an event (admin only)
 */
export const deleteEvent = async (eventId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/events/${eventId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ==================== ADMIN API ====================

export interface UsersResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  total: number;
}

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (params?: { page?: number; limit?: number; search?: string }): Promise<{ success: boolean; data?: UsersResponse; error?: string }> => {
  try {
    const response = await api.get<UsersResponse>('/users', { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Create user as admin (admin only)
 */
export const createUserAsAdmin = async (data: { username: string; email: string; password: string; role?: string }): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await api.post<User>('/auth/admin/create-user', data);
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (userId: string, role: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const response = await api.put<User>(`/users/${userId}/role`, { role });
    return {
      success: true,
      user: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

// ==================== TEAM API ====================

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  photo?: string;
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    email?: string;
  };
  order?: number;
  isActive?: boolean;
  createdAt?: string;
}

/**
 * Get all team members
 */
export const getTeamMembers = async (): Promise<{ success: boolean; members?: TeamMember[]; error?: string }> => {
  try {
    const response = await api.get<TeamMember[]>('/team');
    return {
      success: true,
      members: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Get all team members (admin only - includes inactive)
 */
export const getAllTeamMembers = async (): Promise<{ success: boolean; members?: TeamMember[]; error?: string }> => {
  try {
    const response = await api.get<TeamMember[]>('/team/all');
    return {
      success: true,
      members: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Create team member (admin only)
 */
export const createTeamMember = async (data: FormData): Promise<{ success: boolean; member?: TeamMember; error?: string }> => {
  try {
    const response = await api.post<TeamMember>('/team', data);
    return {
      success: true,
      member: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Update team member (admin only)
 */
export const updateTeamMember = async (memberId: string, data: FormData): Promise<{ success: boolean; member?: TeamMember; error?: string }> => {
  try {
    const response = await api.put<TeamMember>(`/team/${memberId}`, data);
    return {
      success: true,
      member: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

/**
 * Delete team member (admin only)
 */
export const deleteTeamMember = async (memberId: string): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await api.delete<{ message: string }>(`/team/${memberId}`);
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: getErrorMessage(error),
    };
  }
};

export default api;

