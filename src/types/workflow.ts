
export interface WorkflowResponse {
  id: number;
  name: string;
  description?: string;
  user_id: string;
  created_at: string;
}

export interface WorkflowCreateRequest {
  name: string;
  description?: string;
}

export interface WorkflowStepResponse {
  id: number;
  workflow_id: number;
  step_order: number;
  step_type: string;
  model_name: string;
  config_json?: Record<string, any>;
  created_at: string;
}

export interface WorkflowStepCreateRequest {
  step_order: number;
  step_type: string;
  model_name: string;
  config_json?: Record<string, any>;
}

export interface JobResponse {
  id: number;
  workflow_id?: number;
  input_image_path: string;
  status: string;
  error_message?: string;
  created_at: string;
}

export interface JobCreateRequest {
  workflow_id: number;
  input_image_path: string;
}

export interface JobStepResponse {
  id: number;
  job_id: number;
  workflow_step_id?: number;
  step_order: number;
  status: string;
  input_data?: Record<string, any>;
  output_data?: Record<string, any>;
  started_at?: string;
  ended_at?: string;
}

export interface ModelManagementResponse {
  id: number;
  name: string;
  path: string;
  version?: string;
  type: string;
  created_at: string;
}

export interface ModelCreateRequest {
  name: string;
  path: string;
  version?: string;
  type: string;
}

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';
export type StepType = 'detect' | 'crop' | 'ocr' | 'other';
