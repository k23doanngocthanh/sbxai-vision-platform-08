
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000',
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
    
    // Documentation
    OPENAPI_SPEC: '/openapi.json',
    
    // Workflow Management
    WORKFLOWS: '/api/v1/workflows',
    WORKFLOW_BY_ID: (workflowId: string) => `/api/v1/workflows/${workflowId}`,
    WORKFLOW_STEPS: (workflowId: string) => `/api/v1/workflows/${workflowId}/steps`,
    WORKFLOW_STEP_BY_ID: (workflowId: string, stepId: string) => `/api/v1/workflows/${workflowId}/steps/${stepId}`,
    
    // Job Management
    JOBS: '/api/v1/jobs',
    JOB_BY_ID: (jobId: string) => `/api/v1/jobs/${jobId}`,
    JOB_STEPS: (jobId: string) => `/api/v1/jobs/${jobId}/steps`,
    JOB_STEP_STATUS: (jobId: string, stepId: string) => `/api/v1/jobs/${jobId}/steps/${stepId}/status`,
    JOB_EXECUTE: '/api/v1/jobs/execute',
    
    // Model Management
    WORKFLOW_MODELS: '/api/v1/models',
    
    // Worker
    WORKER_NEXT_STEP: '/api/v1/workers/next-step',
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
  ANNOTATION_TOOL: '/projects/:id/annotate',
  AI_PREDICTION: '/ai-prediction',
  MODELS: '/models',
  WORKFLOWS: '/workflows',
  WORKFLOW_DETAIL: '/workflows/:id',
  WORKFLOW_CREATE: '/workflows/create',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:id',
  SETTINGS: '/settings',
  API_DOCS: '/api-docs'
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sbxai_access_token',
  USER_DATA: 'sbxai_user_data'
};
