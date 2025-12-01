// Common types used across the application

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: Date;
  uptime?: number;
}

export interface WelcomeResponse {
  message: string;
  version: string;
  status: string;
}