import type { BatchBenchmarkResult, BenchmarkJobType, BenchmarkResult } from "./benchmark.types.ts";
export declare function runBenchmark(jobType: BenchmarkJobType, cookie: string, connections?: number, durationSec?: number): Promise<BenchmarkResult>;
export declare function runBatchBenchmark(cookie: string, connections?: number, durationSec?: number): Promise<BatchBenchmarkResult>;
//# sourceMappingURL=benchmark.service.d.ts.map