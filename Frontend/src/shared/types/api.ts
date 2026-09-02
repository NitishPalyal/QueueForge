// Standard API Response Envelope
export interface APIResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  fullname: string;
}

export interface AuthResponseData {
  user: User;
}

// Job Status & Queue Types
export type JobStatus =
  | "pending"
  | "active"
  | "failed"
  | "completed"
  | "delayed";
export type QueueName = "mailQueue" | "aiQueue" | "imageQueue";
export type JobType = "mail" | "ai" | "image";

// Job Summary returned by /getAllJobs and list views
export interface JobSummary {
  id: string;
  type: string;
  queue_name?: string;
  queueName?: string; // Account for Prisma field naming variation
  status: JobStatus;
  priority: number;
  attempts: number;
  createdAt: string;
}

// Full Job Record returned by /getJob/:id
export interface FullJobRecord {
  id: string;
  type: string;
  queue_name: string;
  payload: Record<
    string,
    | string
    | number
    | boolean
    | null
    | undefined
    | Record<string, unknown>
    | unknown[]
  >;
  status: JobStatus;
  priority: number;
  attempts: number;
  max_attempts: number;
  idempotency_key: string;
  error: string | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  scheduledFor: string | null;
  stepOrder: number | null;
  batchId: string | null;
}

// Response from GET /api/job/getJob/:id
export interface JobDetailResponse {
  job: FullJobRecord;
  uploadedImageUrl?: string;
  processedImageUrl?: string;
}

// Response from GET /api/job/getAllJobs
export interface PaginatedJobsData {
  limit: number;
  page: number;
  totalJobs: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  jobs: JobSummary[];
}

// Batch Record
export interface BatchRecord {
  id: string;
  type: string;
  status: JobStatus;
  totalSteps: number;
  payload: unknown;
  createdAt: string;
  completedAt: string | null;
}

export interface PaginatedBatchesData {
  limit: number;
  page: number;
  totalBatches: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  batches: BatchRecord[];
}

export interface BatchDetailData {
  batchjobs: FullJobRecord[];
}

// Benchmark Types
export interface JobBenchmarkResult {
  jobType: "email" | "ai" | "image";
  requestsSent: number;
  accepted: number;
  rejected: number;
  ratePerSec: number;
  dbTotal: number;
  matches: boolean;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  sampleSize: number;
}

export interface BatchBenchmarkResult {
  stepTypes: ("image" | "mail" | "ai")[];
  requestsSent: number;
  accepted: number;
  rejected: number;
  ratePerSec: number;
  dbTotal: number;
  matches: boolean;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  sampleSize: number;
}

// Real-Time Socket Event Payload
export interface SocketJobUpdateEvent {
  jobId: string;
  status: number; // 0=waiting, 1=active, 2=completed, 3=failed
  message: string;
  queue: QueueName;
  type: string;
  timestamp: number;
}
