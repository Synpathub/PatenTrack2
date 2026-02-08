export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  details?: Record<string, string[]>;
  traceId: string;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'unhealthy';
  service: string;
  version: string;
  uptime: number;
  timestamp: string;
}

export interface ReadyResponse extends HealthResponse {
  components: Record<string, {
    status: 'ok' | 'unhealthy';
    latency?: number;
    details?: unknown;
  }>;
}
