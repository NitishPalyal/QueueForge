import { apiClient } from '../../../shared/lib/axios';
import type {
  APIResponse,
  FullJobRecord,
  JobDetailResponse,
  JobStatus,
  PaginatedJobsData,
  QueueName,
} from '../../../shared/types/api';

export interface CreateEmailJobPayload {
  to: string;
  prompt: string;
  idempotency_key: string;
  priority: number;
}

export interface CreateAiJobPayload {
  prompt: string;
  idempotency_key: string;
  priority: number;
}

export interface CreateImageJobParams {
  imageFile: File;
  idempotency_key: string;
  priority: number;
}

export const jobsApi = {
  // Create Email Job (2-stage pipeline)
  createEmailJob: async (payload: CreateEmailJobPayload) => {
    const response = await apiClient.post<APIResponse>('/api/job/sendMail', payload);
    return response.data;
  },

  // Create AI Job (exact route spelling: /aiReponse)
  createAiJob: async (payload: CreateAiJobPayload) => {
    const response = await apiClient.post<APIResponse>('/api/job/aiReponse', payload);
    return response.data;
  },

  // Create Image Job (multipart form data with image file, headers for idempotency_key & priority)
  createImageJob: async ({ imageFile, idempotency_key, priority }: CreateImageJobParams) => {
    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name);
    formData.append('idempotency_key', idempotency_key);
    formData.append('priority', priority.toString());

    // Send both in headers (as required by backend route) and form body for maximum compatibility
    const response = await apiClient.post<APIResponse>('/api/job/imageProcessing', formData, {
      headers: {
        idempotency_key: idempotency_key,
        'idempotency-key': idempotency_key,
        priority: priority.toString(),
      },
    });
    return response.data;
  },

  // Get Paginated Jobs List
  getAllJobs: async (page = 1, limit = 50): Promise<PaginatedJobsData> => {
    const response = await apiClient.get<APIResponse<PaginatedJobsData>>('/api/job/getAllJobs', {
      params: { page, limit },
    });
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch jobs');
  },

  // Get Full Single Job Detail
  getJobById: async (id: string): Promise<JobDetailResponse> => {
    const response = await apiClient.get<APIResponse<JobDetailResponse>>(`/api/job/getJob/${id}`);
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch job detail');
  },

  // Delete Job
  deleteJob: async (queue: QueueName, id: string): Promise<void> => {
    await apiClient.delete<APIResponse>(`/api/job/deleteJob/${queue}/${id}`);
  },

  // Retry Job (HTTP GET)
  retryJob: async (id: string, queue: QueueName): Promise<FullJobRecord> => {
    const response = await apiClient.get<APIResponse<{ job: FullJobRecord }>>(
      `/api/job/retryJob/${id}/${queue}`
    );
    if (response.data.data?.job) {
      return response.data.data.job;
    }
    throw new Error(response.data.message || 'Failed to retry job');
  },

  // Get Status Filtered Jobs (unpaginated)
  getJobsByStatus: async (status: JobStatus): Promise<{ totalJobs: number; jobs: any[] }> => {
    const response = await apiClient.get<APIResponse<{ totalJobs: number; jobs: any[] }>>(
      `/api/job/getAll/${status}/Statusjobs`
    );
    return response.data.data || { totalJobs: 0, jobs: [] };
  },

  // Get Queue Filtered Jobs (unpaginated)
  getJobsByQueue: async (queue: QueueName): Promise<{ totalJobs: number; jobs: any[] }> => {
    const response = await apiClient.get<APIResponse<{ totalJobs: number; jobs: any[] }>>(
      `/api/job/getAll/${queue}/Jobs`
    );
    return response.data.data || { totalJobs: 0, jobs: [] };
  },

  // Combined Queue + Status Filtered Jobs (unpaginated)
  getJobsByQueueAndStatus: async (queue: QueueName, status: JobStatus): Promise<{ totalJobs: number; jobs: any[] }> => {
    const response = await apiClient.get<APIResponse<{ totalJobs: number; jobs: any[] }>>(
      `/api/job/getAll/${queue}/${status}/jobs`
    );
    return response.data.data || { totalJobs: 0, jobs: [] };
  },
};
