import { prisma } from "../config/config.database.ts";
import { Prisma } from "../../generated/prisma/client.ts";
import { Status } from "../../generated/prisma/client.ts";
import type { BatchCreateInput } from "../../generated/prisma/models.ts";

export async function findAll(limit: number, skip: number) {
  const [batches, totalBatches] = await Promise.all([
    prisma.batch.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.batch.count(),
  ]);

  return { batches, totalBatches };
}

export async function findById(id: string) {
  return await prisma.batch.findUnique({
    where: { id },
  });
}

export async function create(data: BatchCreateInput) {
  return await prisma.batch.create({
    data,
  });
}

export async function deleteBatch(id: string) {
  await prisma.batch.delete({
    where: { id },
  });
}
// export async function updateJobPayload({
//   id,
//   payload,
// }: {
//   id: string;
//   payload: Prisma.InputJsonObject;
// }) {
//   await prisma.job.update({
//     where: { id },
//     data: {
//       payload,
//     },
//   });
// }
export async function setStatusActive(id: string) {
  await prisma.batch.update({
    where: { id },
    data: {
      status: Status.active,
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
  await prisma.batch.update({
    where: { id },
    data: {
      status: Status.failed,
    },
  });
}
