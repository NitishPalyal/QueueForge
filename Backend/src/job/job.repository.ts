// ─── REPOSITORY = All DB queries for Users live here ──────────────────────────
// Think of it as the ONLY place that knows about Prisma/the database.
// Services call repositories. Repositories call Prisma.

import { prisma } from "../config/config.database.ts";
import { Prisma } from "../../generated/prisma/client.ts";
import { Status } from "../../generated/prisma/client.ts";
import type { JobCreateInput } from "../../generated/prisma/models.ts";
// Prisma namespace gives you auto-generated input types like UserCreateInput

export async function findAll(limit: number, skip: number) {
  const [jobs, totalJobs] = await Promise.all([
    prisma.job.findMany({
      skip,
      take: limit,
      select: {
        id: true,
        type: true,
        queue_name: true,
        status: true,
        priority: true,
        attempts: true,
        createdAt: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.job.count(),
  ]);

  return { jobs, totalJobs };
}

export async function findById(id: string) {
  return await prisma.job.findUnique({
    where: { id },
  });
}
export async function findByBatch(batchId: string) {
  return await prisma.job.findMany({
    where: { batchId },
  });
}

export async function findByQueueName(queue_name: string) {
  return await prisma.job.findMany({
    where: { queue_name },
    orderBy: { createdAt: "desc" },
  });
}

export async function findByStatus(status: Status) {
  return await prisma.job.findMany({
    where: { status },
    orderBy: { createdAt: "desc" },
  });
}

export async function findByQueueNameAndStatus(
  queue_name: string,
  status: Status,
) {
  return await prisma.job.findMany({
    where: { queue_name, status },
    orderBy: { createdAt: "desc" },
  });
}

export async function create(data: JobCreateInput) {
  return await prisma.job.create({
    data,
  });
}

export async function deleteJob(id: string) {
  await prisma.job.delete({
    where: { id },
  });
}

export async function updateJobPayload({
  id,
  payload,
}: {
  id: string;
  payload: Prisma.InputJsonObject;
}) {
  await prisma.job.update({
    where: { id },
    data: {
      payload,
    },
  });
}

export async function updateJobAttempt(id: string) {
  await prisma.job.update({
    where: { id },
    data: {
      attempts: { increment: 1 },
    },
  });
}

export async function setBatchIdAndStepOrder(
  jobId: string,
  batchId: string,
  stepOrder: number,
) {
  await prisma.job.update({
    where: { id: jobId },
    data: { batchId, stepOrder },
  });
}

export async function setStatusPending(id: string) {
  await prisma.job.update({
    where: { id },
    data: {
      status: Status.pending,
    },
  });
}

export async function setStatusActive(id: string) {
  await prisma.job.update({
    where: { id },
    data: {
      status: Status.active,
      startedAt: new Date(),
    },
  });
}

export async function updateJobPriority(id: string, priority: number) {
  await prisma.job.update({
    where: { id },
    data: { priority },
  });
}

export async function setStatusDelayed(id: string, scheduledFor: Date) {
  await prisma.job.update({
    where: { id },
    data: {
      status: Status.delayed,
      scheduledFor,
    },
  });
}

export async function setStatusCompleted(id: string) {
  await prisma.job.update({
    where: { id },
    data: {
      status: Status.completed,
      completedAt: new Date(),
    },
  });
}

export async function setStatusFailed(id: string, error: string) {
  await prisma.job.update({
    where: { id },
    data: {
      status: Status.failed,
      error,
      completedAt: new Date(),
    },
  });
}
