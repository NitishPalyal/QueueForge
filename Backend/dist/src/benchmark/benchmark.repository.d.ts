import type { BenchmarkJobType } from "./benchmark.types.ts";
export declare function countInFlight(jobType: BenchmarkJobType, since: Date): Promise<number>;
export declare function getResults(jobType: BenchmarkJobType, since: Date): Promise<{
    dbTotal: number;
    p50Ms: number | null;
    p95Ms: number | null;
    p99Ms: number | null;
    sampleSize: number;
}>;
export declare function getBatchInFlightCount(since: Date): Promise<number>;
export declare function getBatchResults(since: Date): Promise<{
    dbTotal: number;
    p50Ms: number | null;
    p95Ms: number | null;
    p99Ms: number | null;
    sampleSize: number;
}>;
//# sourceMappingURL=benchmark.repository.d.ts.map