import { apiClient } from '../../../shared/lib/axios';
import type {
  APIResponse,
  BatchDetailData,
  PaginatedBatchesData,
} from '../../../shared/types/api';

export type BatchStep =
  | { type: 'image'; data: { uploadedImageKey: string } }
  | { type: 'mail'; data: { to: string; prompt: string } }
  | { type: 'ai'; data: { prompt: string } };

export interface CreateBatchPayload {
  steps: BatchStep[];
}

export const batchesApi = {
  // Upload image step prior to batch submission
  uploadBatchImage: async (file: File): Promise<{ key: string; url: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    // Note: Do NOT manually set Content-Type so browser sets boundary correctly
    const response = await apiClient.post<APIResponse<{ key: string; url: string }>>(
      '/api/batchJob/uploadImage/',
      formData
    );

    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Image upload failed');
  },

  // Delete previously uploaded image step
  deleteBatchImage: async (uploadedImageKey: string): Promise<void> => {
    await apiClient.post<APIResponse>('/api/batchJob/deleteImage/', { uploadedImageKey });
  },

  // Create Flow Batch (2 to 3 steps)
  createBatchJob: async (payload: CreateBatchPayload): Promise<{ batchId: string }> => {
    const response = await apiClient.post<APIResponse<{ batchId: string }>>(
      '/api/batchJob/createBatchJob/',
      payload
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to create batch job');
  },

  // Get Paginated Batches List
  getAllBatches: async (page = 1, limit = 50): Promise<PaginatedBatchesData> => {
    const response = await apiClient.get<APIResponse<PaginatedBatchesData>>(
      '/api/batchJob/getAllBatches',
      { params: { page, limit } }
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch batches');
  },

  // Get Child Jobs for a Batch
  getBatchJobs: async (id: string): Promise<BatchDetailData> => {
    const response = await apiClient.get<APIResponse<BatchDetailData>>(
      `/api/batchJob/getBatchJobs/${id}`
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch batch jobs');
  },

  // Delete Batch
  deleteBatch: async (id: string): Promise<void> => {
    await apiClient.delete<APIResponse>(`/api/batchJob/deleteBatch/${id}`);
  },
};
