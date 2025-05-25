
import { API_CONFIG } from '@/lib/constants';
import { authService } from './auth';
import {
  WorkflowResponse,
  WorkflowCreateRequest,
  WorkflowStepResponse,
  WorkflowStepCreateRequest,
  JobResponse,
  JobCreateRequest,
  JobStepResponse,
  ModelManagementResponse,
  ModelCreateRequest,
  JobStatus,
  StepType
} from '@/types/workflow';

class WorkflowService {
  private getAuthHeaders() {
    const token = localStorage.getItem('sbxai_access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  private getFormDataHeaders() {
    const token = localStorage.getItem('sbxai_access_token');
    return {
      'Authorization': `Bearer ${token}`
    };
  }

  // Workflow Management
  async getWorkflows(): Promise<WorkflowResponse[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOWS}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflows');
    }
    
    return await response.json();
  }

  async getWorkflow(workflowId: string): Promise<WorkflowResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_BY_ID(workflowId)}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflow');
    }
    
    return await response.json();
  }

  async createWorkflow(data: WorkflowCreateRequest): Promise<WorkflowResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOWS}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create workflow');
    }
    
    return await response.json();
  }

  async updateWorkflow(workflowId: string, data: WorkflowCreateRequest): Promise<WorkflowResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_BY_ID(workflowId)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update workflow');
    }
    
    return await response.json();
  }

  async deleteWorkflow(workflowId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_BY_ID(workflowId)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete workflow');
    }
    
    return await response.json();
  }

  // Workflow Steps Management
  async getWorkflowSteps(workflowId: string): Promise<WorkflowStepResponse[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_STEPS(workflowId)}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch workflow steps');
    }
    
    return await response.json();
  }

  async createWorkflowStep(workflowId: string, data: WorkflowStepCreateRequest): Promise<WorkflowStepResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_STEPS(workflowId)}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create workflow step');
    }
    
    return await response.json();
  }

  async updateWorkflowStep(workflowId: string, stepId: string, data: WorkflowStepCreateRequest): Promise<WorkflowStepResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_STEP_BY_ID(workflowId, stepId)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update workflow step');
    }
    
    return await response.json();
  }

  async deleteWorkflowStep(workflowId: string, stepId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_STEP_BY_ID(workflowId, stepId)}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete workflow step');
    }
    
    return await response.json();
  }

  // Job Management
  async getJobs(status?: JobStatus, workflowId?: string, limit?: number): Promise<JobResponse[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (workflowId) params.append('workflow_id', workflowId);
    if (limit) params.append('limit', limit.toString());
    
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOBS}${params.toString() ? '?' + params.toString() : ''}`;
    
    const response = await fetch(url, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }
    
    return await response.json();
  }

  async getJob(jobId: string): Promise<JobResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOB_BY_ID(jobId)}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }
    
    return await response.json();
  }

  async createJob(data: JobCreateRequest): Promise<JobResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOBS}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create job');
    }
    
    return await response.json();
  }

  async getJobSteps(jobId: string): Promise<JobStepResponse[]> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOB_STEPS(jobId)}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch job steps');
    }
    
    return await response.json();
  }

  async executeJobWithFile(workflowId: string, file: File): Promise<{ message: string; job: JobResponse; file_path: string; original_filename: string }> {
    const formData = new FormData();
    formData.append('workflow_id', workflowId);
    formData.append('file', file);

    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.JOB_EXECUTE}`, {
      method: 'POST',
      headers: this.getFormDataHeaders(),
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to execute job');
    }
    
    return await response.json();
  }

  // Model Management
  async getModels(modelType?: StepType): Promise<ModelManagementResponse[]> {
    const params = modelType ? `?model_type=${modelType}` : '';
    
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_MODELS}${params}`, {
      headers: this.getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch models');
    }
    
    return await response.json();
  }

  async createModel(data: ModelCreateRequest): Promise<ModelManagementResponse> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKFLOW_MODELS}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create model');
    }
    
    return await response.json();
  }
}

export const workflowService = new WorkflowService();
