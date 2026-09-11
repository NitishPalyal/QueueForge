import { io, Socket } from "socket.io-client";
import { queryClient } from "./queryClient";
import type {
  JobStatus,
  PaginatedBatchesData,
  PaginatedJobsData,
  SocketJobUpdateEvent,
} from "../types/api";
import { toast } from "sonner";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

let socket: Socket | null = null;
let lastToastTime = 0;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      console.log("[QueueForge Socket] Connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("[QueueForge Socket] Disconnected");
    });

    // Real-Time Job Update Event Handler
    socket.on("job-update", (event: SocketJobUpdateEvent) => {
      const statusByEvent: Record<number, JobStatus> = {
        0: "pending",
        1: "active",
        2: "completed",
        3: "failed",
      };
      const nextStatus = statusByEvent[event.status];

      if (event.jobId && nextStatus) {
        queryClient.setQueriesData<PaginatedJobsData>(
          { queryKey: ["jobs", "list"] },
          (current) => {
            if (!current) return current;
            return {
              ...current,
              jobs: current.jobs.map((job) =>
                job.id === event.jobId ? { ...job, status: nextStatus } : job,
              ),
            };
          },
        );
      }

      if (event.batchId && nextStatus && event.status !== 2) {
        queryClient.setQueriesData<PaginatedBatchesData>(
          { queryKey: ["batches", "list"] },
          (current) => {
            if (!current) return current;
            return {
              ...current,
              batches: current.batches.map((batch) =>
                batch.id === event.batchId
                  ? { ...batch, status: nextStatus }
                  : batch,
              ),
            };
          },
        );
      }

      // Invalidate relevant TanStack Query caches to refetch fresh server data
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["batches"] });
      if (event.batchId && event.status === 2) {
        void queryClient.refetchQueries({ queryKey: ["batches"] });
      }
      if (event.jobId) {
        queryClient.invalidateQueries({
          queryKey: ["job", "detail", event.jobId],
        });
      }

      // Throttle toasts so rapid events don't overwhelm the user UI
      const now = Date.now();
      if (now - lastToastTime > 2000 && event.message) {
        lastToastTime = now;
        toast.info(`Job Update`, {
          description: event.message,
          duration: 3000,
        });
      }
    });
  }

  return socket;
};
