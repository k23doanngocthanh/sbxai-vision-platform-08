
export const API_CONFIG = {
  BASE_URL: 'https://sbxai.devhub.io.vn',
  ENDPOINTS: {
    // Auth endpoints
    REGISTER: '/api/v1/yolo/rest/users/register',
    LOGIN: '/api/v1/yolo/rest/users/login',
    USER_ME: '/api/v1/yolo/rest/users/me',
    
    // Project endpoints
    PROJECTS: '/api/v1/yolo/rest/projects',
    PROJECT_IMAGES: (projectId: string) => `/api/v1/yolo/rest/projects/${projectId}/images`,
    PROJECT_LABELS: (projectId: string) => `/api/v1/yolo/rest/projects/${projectId}/labels`,
    
    // Image endpoints
    IMAGE_SESSIONS: (imageId: string) => `/api/v1/yolo/rest/images/${imageId}/sessions`,
    SESSIONS: (sessionId: string) => `/api/v1/yolo/rest/sessions/${sessionId}`,
    SESSION_ITEMS: (sessionId: string) => `/api/v1/yolo/rest/sessions/${sessionId}/items`,
    
    // AI Model endpoints (public)
    MODELS: '/api/v1/yolo/models',
    PREDICT: (modelId: string) => `/api/v1/yolo/predict/${modelId}`,
    OCR: (modelId: string) => `/api/v1/yolo/ocr/${modelId}`,
    
    // Dashboard
    DASHBOARD_STATS: '/api/v1/yolo/rest/dashboard/stats',
    
    // API Keys
    API_KEYS: '/api/v1/yolo/rest/api-keys',
  }
};

export const APP_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  PROJECT_DETAIL: '/projects/:id',
  UPLOAD_IMAGES: '/projects/:id/upload',
  MANAGE_LABELS: '/projects/:id/labels',
  GALLERY: '/projects/:id/gallery',
  MODELS: '/models',
  SETTINGS: '/settings'
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sbxai_access_token',
  USER_DATA: 'sbxai_user_data'
};
