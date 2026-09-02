import { useMutation, useQuery } from "@tanstack/react-query";
import {
  jobsApi,
  type CreateAiJobPayload,
  type CreateEmailJobPayload,
  type CreateImageJobParams,
} from "../api/jobsApi";
import { queryClient } from "../../../shared/lib/queryClient";
import { toast } from "sonner";
import type {
  JobStatus,
  JobSummary,
  QueueName,
} from "../../../shared/types/api";

type ErrorLike = {
  response?: {
    data?: {
      message?: string;
      error?: string | { message?: string };
    };
  };
  message?: string;
};

const extractErrorMessage = (err: unknown, fallback: string): string => {
  const typedError = err as ErrorLike | undefined;
  if (typeof typedError?.response?.data?.message === "string") {
    return typedError.response.data.message;
  }
  if (typeof typedError?.response?.data?.error === "string") {
    return typedError.response.data.error;
  }
  if (
    typedError?.response?.data &&
    typeof typedError.response.data.error === "object" &&
    typedError.response.data.error &&
    typeof typedError.response.data.error.message === "string"
  ) {
    return typedError.response.data.error.message;
  }
  if (typeof typedError?.message === "string") return typedError.message;
  return fallback;
};

const getJobIdFromResponse = (response: unknown): string => {
  if (response && typeof response === "object" && "data" in response) {
    const data = (response as { data?: { jobId?: string } }).data;
    if (typeof data?.jobId === "string") return data.jobId;
  }
  return "created";
};

export const useJobsList = (
  page: number,
  limit: number,
  statusFilter: JobStatus | "all",
  queueFilter: QueueName | "all",
) => {
  return useQuery({
    queryKey: ["jobs", "list", page, limit, statusFilter, queueFilter],
    queryFn: async () => {
      // Handle filtered vs paginated responses
      if (statusFilter === "all" && queueFilter === "all") {
        return await jobsApi.getAllJobs(page, limit);
      }

      let resData: { totalJobs: number; jobs: JobSummary[] } = {
        totalJobs: 0,
        jobs: [],
      };
      if (
        statusFilter !== "all" &&
        queueFilter !== "all" &&
        statusFilter !== "active" &&
        statusFilter !== "delayed"
      ) {
        resData = await jobsApi.getJobsByQueueAndStatus(
          queueFilter,
          statusFilter,
        );
      } else if (queueFilter !== "all") {
        resData = await jobsApi.getJobsByQueue(queueFilter);
      } else if (
        statusFilter !== "all" &&
        statusFilter !== "active" &&
        statusFilter !== "delayed"
      ) {
        resData = await jobsApi.getJobsByStatus(statusFilter);
      } else {
        // Fallback for active/delayed filters
        const allData = await jobsApi.getAllJobs(1, 200);
        let filtered = allData.jobs;
        if (statusFilter !== "all")
          filtered = filtered.filter((j) => j.status === statusFilter);
        if (queueFilter !== "all")
          filtered = filtered.filter(
            (j) => (j.queue_name || j.queueName) === queueFilter,
          );
        return {
          limit,
          page: 1,
          totalJobs: filtered.length,
          hasNextPage: false,
          hasPreviousPage: false,
          jobs: filtered,
        };
      }

      // Client-side pagination over unpaginated filter endpoint
      const allJobs = resData.jobs || [];
      const startIndex = (page - 1) * limit;
      const paginatedJobs = allJobs.slice(startIndex, startIndex + limit);

      return {
        limit,
        page,
        totalJobs: allJobs.length,
        hasNextPage: startIndex + limit < allJobs.length,
        hasPreviousPage: page > 1,
        jobs: paginatedJobs,
      };
    },
  });
};

export const useJobDetail = (id: string | null) => {
  return useQuery({
    queryKey: ["job", "detail", id],
    queryFn: () => (id ? jobsApi.getJobById(id) : Promise.reject("No ID")),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes, keeping Backblaze 10-min URL freshness in mind
  });
};

export const useCreateEmailJob = () => {
  return useMutation({
    mutationFn: (payload: CreateEmailJobPayload) =>
      jobsApi.createEmailJob(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Email Job Queued", {
        description: `Job ID: ${getJobIdFromResponse(data)} is now processing`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Failed to Queue Email Job", {
        description: extractErrorMessage(err, "Failed to queue email job"),
      });
    },
  });
};

export const useCreateAiJob = () => {
  return useMutation({
    mutationFn: (payload: CreateAiJobPayload) => jobsApi.createAiJob(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("AI Response Job Queued", {
        description: `Job ID: ${getJobIdFromResponse(data)} is pending execution`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Failed to Queue AI Job", {
        description: extractErrorMessage(err, "Failed to queue AI job"),
      });
    },
  });
};

export const useCreateImageJob = () => {
  return useMutation({
    mutationFn: (params: CreateImageJobParams) =>
      jobsApi.createImageJob(params),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Image Job Queued", {
        description: `Job ID: ${getJobIdFromResponse(data)} added for optimization`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Failed to Queue Image Job", {
        description: extractErrorMessage(
          err,
          "Failed to queue image processing job",
        ),
      });
    },
  });
};

export const useRetryJob = () => {
  return useMutation({
    mutationFn: ({ id, queue }: { id: string; queue: QueueName }) =>
      jobsApi.retryJob(id, queue),
    onSuccess: (retriedJob) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      if (retriedJob.id) {
        queryClient.invalidateQueries({
          queryKey: ["job", "detail", retriedJob.id],
        });
      }
      toast.success("Job Retried", {
        description: `Job ${retriedJob.id} re-queued successfully.`,
      });
    },
    onError: (err: unknown) => {
      toast.error("Failed to Retry Job", {
        description: extractErrorMessage(err, "Failed to retry job"),
      });
    },
  });
};

export const useDeleteJob = () => {
  return useMutation({
    mutationFn: ({ queue, id }: { queue: QueueName; id: string }) =>
      jobsApi.deleteJob(queue, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      toast.success("Job Deleted", {
        description: "Job record and related assets removed.",
      });
    },
    onError: (err: unknown) => {
      toast.error("Failed to Delete Job", {
        description: extractErrorMessage(err, "Failed to delete job"),
      });
    },
  });
};
