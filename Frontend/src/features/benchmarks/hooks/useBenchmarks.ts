import { useMutation } from '@tanstack/react-query';
import { benchmarkApi } from '../api/benchmarkApi';
import { toast } from 'sonner';

export const useJobBenchmark = () => {
  return useMutation({
    mutationFn: (jobType: 'email' | 'ai' | 'image') => benchmarkApi.runJobBenchmark(jobType),
    onSuccess: (data) => {
      toast.success('Benchmark Completed', {
        description: `${data.jobType.toUpperCase()} benchmark: ${data.ratePerSec} req/sec, P99: ${data.p99Ms}ms`,
      });
    },
    onError: (err: any) => {
      toast.error('Benchmark Error', {
        description: err.response?.data?.message || err.message,
      });
    },
  });
};

export const useBatchBenchmark = () => {
  return useMutation({
    mutationFn: () => benchmarkApi.runBatchBenchmark(),
    onSuccess: (data) => {
      toast.success('Batch Benchmark Completed', {
        description: `Batch Flow benchmark: ${data.ratePerSec} req/sec, P99: ${data.p99Ms}ms`,
      });
    },
    onError: (err: any) => {
      toast.error('Batch Benchmark Error', {
        description: err.response?.data?.message || err.message,
      });
    },
  });
};
