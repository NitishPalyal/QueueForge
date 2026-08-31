import type { Step } from "../batchJob/batchJob.zodSchema.ts";

export type BenchmarkJobType = "email" | "ai" | "image";

export interface BenchmarkResult {
  jobType: BenchmarkJobType;
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

// Reuses your real batch schema's type directly - one source of truth,
// can't drift out of sync with the actual endpoint.
export type BatchStep = Step;

export interface BatchBenchmarkResult {
  stepTypes: BatchStep["type"][];
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
