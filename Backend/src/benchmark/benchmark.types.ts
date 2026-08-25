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
