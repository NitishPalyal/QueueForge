import autocannon from "autocannon";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as benchmarkRepo from "./benchmark.repository.ts";
import type {
  BatchBenchmarkResult,
  BatchStep,
  BenchmarkJobType,
  BenchmarkResult,
} from "./benchmark.types.ts";
import configKeys from "../config/config.keys.ts";

const BASE_URL = `http://localhost:${configKeys.PORT}`;
const DRAIN_TIMEOUT_MS = 120_000;
const DRAIN_POLL_MS = 2000;

const IMAGE_FIXTURE_PATH = path.join(
  import.meta.dirname,
  "fixtures",
  "test-image.jpg",
);
const MULTIPART_BOUNDARY = "----benchmarkBoundary";

// Points at benchmark.job-routes.ts, NOT src/job/job.routes.ts - same
// controllers run either way, this path just skips jobCreationRateLimiter.
const TARGET: Record<
  "email" | "ai",
  { path: string; body: (since: Date) => Record<string, unknown> }
> = {
  email: {
    path: "/api/benchmark-job/sendMail",
    body: (since) => ({
      to: "loadtest@queueforge.test",
      prompt: "Benchmark load test prompt for throughput measurement.",
      idempotency_key: `bench-${since.getTime()}-[<id>]`,
      priority: 5,
    }),
  },
  ai: {
    path: "/api/benchmark-job/aiReponse",
    body: (since) => ({
      prompt: "Benchmark load test prompt for throughput measurement.",
      idempotency_key: `bench-${since.getTime()}-[<id>]`,
      priority: 5,
    }),
  },
};

function buildImageBody(): Buffer {
  const file = readFileSync(IMAGE_FIXTURE_PATH);
  return Buffer.concat([
    Buffer.from(
      `--${MULTIPART_BOUNDARY}\r\nContent-Disposition: form-data; name="image"; filename="test-image.jpg"\r\nContent-Type: image/jpeg\r\n\r\n`,
    ),
    file,
    Buffer.from(`\r\n--${MULTIPART_BOUNDARY}--\r\n`),
  ]);
}

async function waitForDrain(
  jobType: BenchmarkJobType,
  since: Date,
): Promise<void> {
  const deadline = Date.now() + DRAIN_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const inFlight = await benchmarkRepo.countInFlight(jobType, since);
    if (inFlight === 0) return;
    await new Promise((r) => setTimeout(r, DRAIN_POLL_MS));
  }
}

export async function runBenchmark(
  jobType: BenchmarkJobType,
  cookie: string,
  connections = 10,
  durationSec = 20,
): Promise<BenchmarkResult> {
  const since = new Date();

  const result =
    jobType === "image"
      ? await autocannon({
          url: `${BASE_URL}/api/benchmark-job/imageProcessing`,
          method: "POST",
          connections,
          duration: durationSec,
          idReplacement: true,
          headers: {
            "content-type": `multipart/form-data; boundary=${MULTIPART_BOUNDARY}`,
            idempotency_key: `bench-${since.getTime()}-[<id>]`,
            priority: "5",
            cookie,
          },
          body: buildImageBody(),
        })
      : await autocannon({
          url: `${BASE_URL}${TARGET[jobType].path}`,
          method: "POST",
          connections,
          duration: durationSec,
          idReplacement: true,
          headers: { "content-type": "application/json", cookie },
          body: JSON.stringify(TARGET[jobType].body(since)),
        });

  await waitForDrain(jobType, since);

  const db = await benchmarkRepo.getResults(jobType, since);

  return {
    jobType,
    requestsSent: result.requests.sent,
    accepted: result["2xx"],
    rejected: result["4xx"] + result["5xx"],
    ratePerSec: result.requests.average,
    dbTotal: db.dbTotal,
    matches: db.dbTotal === result["2xx"],
    p50Ms: db.p50Ms,
    p95Ms: db.p95Ms,
    p99Ms: db.p99Ms,
    sampleSize: db.sampleSize,
  };
}

//  BATCH BENCHMARK //
const PROMPT = "Benchmark load test prompt for throughput measurement.";

const BENCHMARK_STEPS: BatchStep[] = [
  { type: "ai", data: { prompt: PROMPT } },
  { type: "mail", data: { to: "loadtest@queueforge.test", prompt: PROMPT } },
  { type: "image", data: { uploadedImageKey: "" } },
];

async function resolveImageStep(
  steps: BatchStep[],
  cookie: string,
): Promise<BatchStep[]> {
  const res = await fetch(`${BASE_URL}/api/benchmark-batch-job/uploadImage`, {
    method: "POST",
    headers: {
      "content-type": `multipart/form-data; boundary=${MULTIPART_BOUNDARY}`,
      cookie,
    },
    body: new Uint8Array(buildImageBody()),
  });
  const body = (await res.json()) as { data: { key: string } };

  return steps.map((step) =>
    step.type === "image"
      ? { type: "image" as const, data: { uploadedImageKey: body.data.key } }
      : step,
  );
}

async function waitForBatchDrain(since: Date): Promise<void> {
  const deadline = Date.now() + DRAIN_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const inFlight = await benchmarkRepo.getBatchInFlightCount(since);
    if (inFlight === 0) return;
    await new Promise((r) => setTimeout(r, DRAIN_POLL_MS));
  }
}

export async function runBatchBenchmark(
  cookie: string,
  connections = 10,
  durationSec = 20,
): Promise<BatchBenchmarkResult> {
  const since = new Date();
  const steps = await resolveImageStep(BENCHMARK_STEPS, cookie);

  const result = await autocannon({
    url: `${BASE_URL}/api/benchmark-batch-job/createBatchJob`,
    method: "POST",
    connections,
    duration: durationSec,
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify({ steps }),
  });

  await waitForBatchDrain(since);
  const db = await benchmarkRepo.getBatchResults(since);

  return {
    stepTypes: BENCHMARK_STEPS.map((step) => step.type),
    requestsSent: result.requests.sent,
    accepted: result["2xx"],
    rejected: result["4xx"] + result["5xx"],
    ratePerSec: result.requests.average,
    dbTotal: db.dbTotal,
    matches: db.dbTotal === result["2xx"],
    p50Ms: db.p50Ms,
    p95Ms: db.p95Ms,
    p99Ms: db.p99Ms,
    sampleSize: db.sampleSize,
  };
}
