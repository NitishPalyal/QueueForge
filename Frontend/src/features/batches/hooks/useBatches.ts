import { useMutation, useQuery } from '@tanstack/react-query';
import { batchesApi, type CreateBatchPayload } from '../api/batchesApi';
import { queryClient } from '../../../shared/lib/queryClient';
import { toast } from 'sonner';

export const useBatchesList = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['batches', 'list', page, limit],
    queryFn: () => batchesApi.getAllBatches(page, limit),
  });
};

export const useBatchDetail = (id: string | null) => {
  return useQuery({
    queryKey: ['batch', 'detail', id],
    queryFn: () => (id ? batchesApi.getBatchJobs(id) : Promise.reject('No Batch ID')),
    enabled: !!id,
  });
};

export const useCreateBatchJob = () => {
  return useMutation({
    mutationFn: (payload: CreateBatchPayload) => batchesApi.createBatchJob(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Batch Flow Queued', {
        description: `Batch ID: ${data.batchId} created successfully.`,
      });
    },
    onError: (err: any) => {
      toast.error('Failed to Create Batch Flow', {
        description: err.response?.data?.message || err.message,
      });
    },
  });
};

export const useDeleteBatch = () => {
  return useMutation({
    mutationFn: (id: string) => batchesApi.deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Batch Deleted', { description: 'Batch flow and child jobs removed.' });
    },
    onError: (err: any) => {
      toast.error('Failed to Delete Batch', {
        description: err.response?.data?.message || err.message,
      });
    },
  });
};
