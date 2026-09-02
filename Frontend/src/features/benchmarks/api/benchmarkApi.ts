import { apiClient } from '../../../shared/lib/axios';
import type { APIResponse, BatchBenchmarkResult, JobBenchmarkResult } from '../../../shared/types/api';

export const benchmarkApi = {
  // Run single job load test benchmark
  runJobBenchmark: async (jobType: 'email' | 'ai' | 'image'): Promise<JobBenchmarkResult> => {
    const response = await apiClient.post<APIResponse<JobBenchmarkResult>>(
      `/api/benchmark/getJobBenchmark/${jobType}`
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Benchmark execution failed');
  },

  // Run batch job load test benchmark
  runBatchBenchmark: async (): Promise<BatchBenchmarkResult> => {
    const response = await apiClient.post<APIResponse<BatchBenchmarkResult>>(
      '/api/benchmark/getBatchJobBenchmark'
    );
    if (response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Batch benchmark execution failed');
  },
};
