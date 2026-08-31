import { prisma } from "../config/config.database.ts";
import type { BenchmarkJobType } from "./benchmark.types.ts";

const QUEUE_NAME: Record<BenchmarkJobType, string> = {
  email: "mailQueue",
  ai: "aiQueue",
  image: "imageQueue",
};

export async function countInFlight(
  jobType: BenchmarkJobType,
  since: Date,
): Promise<number> {
  const rows = await prisma.$queryRaw<{ inFlight: number }[]>`
    SELECT COUNT(*)::int AS "inFlight"
    FROM jobs
    WHERE created_at >= ${since}
      AND queue_name = ${QUEUE_NAME[jobType]}
      AND status IN ('pending', 'active')
  `;
  return rows[0]?.inFlight ?? 0;
}

export async function getResults(
  jobType: BenchmarkJobType,
  since: Date,
): Promise<{
  dbTotal: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  sampleSize: number;
}> {
  const queueName = QUEUE_NAME[jobType];

  const statusRows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int AS count
    FROM jobs
    WHERE created_at >= ${since} AND queue_name = ${queueName}
  `;

  const latencyRows = await prisma.$queryRaw<
    {
      p50_ms: number | null;
      p95_ms: number | null;
      p99_ms: number | null;
      sample_size: number;
    }[]
  >`
    SELECT
      percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) AS p50_ms,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) AS p95_ms,
      percentile_cont(0.99) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) AS p99_ms,
      COUNT(*)::int AS sample_size
    FROM jobs
    WHERE created_at >= ${since} AND queue_name = ${queueName} AND status = 'completed'
  `;

  const latency = latencyRows[0];

  return {
    dbTotal: statusRows[0]?.count ?? 0,
    p50Ms: latency?.p50_ms ?? null,
    p95Ms: latency?.p95_ms ?? null,
    p99Ms: latency?.p99_ms ?? null,
    sampleSize: latency?.sample_size ?? 0,
  };
}

export async function getBatchInFlightCount(since: Date): Promise<number> {
  const rows = await prisma.$queryRaw<{ inFlight: number }[]>`
    SELECT COUNT(*)::int AS "inFlight"
    FROM batches
    WHERE created_at >= ${since} AND status IN ('pending', 'active')
  `;
  return rows[0]?.inFlight ?? 0;
}

export async function getBatchResults(since: Date): Promise<{
  dbTotal: number;
  p50Ms: number | null;
  p95Ms: number | null;
  p99Ms: number | null;
  sampleSize: number;
}> {
  const statusRows = await prisma.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*)::int AS count FROM batches WHERE created_at >= ${since}
  `;

  const latencyRows = await prisma.$queryRaw<
    {
      p50_ms: number | null;
      p95_ms: number | null;
      p99_ms: number | null;
      sample_size: number;
    }[]
  >`
    SELECT
      percentile_cont(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) AS p50_ms,
      percentile_cont(0.95) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) AS p95_ms,
      percentile_cont(0.99) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000) AS p99_ms,
      COUNT(*)::int AS sample_size
    FROM batches
    WHERE created_at >= ${since} AND status = 'completed'
  `;

  const latency = latencyRows[0];
  return {
    dbTotal: statusRows[0]?.count ?? 0,
    p50Ms: latency?.p50_ms ?? null,
    p95Ms: latency?.p95_ms ?? null,
    p99Ms: latency?.p99_ms ?? null,
    sampleSize: latency?.sample_size ?? 0,
  };
}
