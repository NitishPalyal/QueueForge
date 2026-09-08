import { prisma } from "../config/config.database.js";
import { Prisma } from "../../generated/prisma/client.js";
import { Status } from "../../generated/prisma/client.js";
export async function findAll(limit, skip) {
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
export async function findById(id) {
    return await prisma.batch.findUnique({
        where: { id },
    });
}
export async function create(data) {
    return await prisma.batch.create({
        data,
    });
}
export async function deleteBatch(id) {
    await prisma.batch.delete({
        where: { id },
    });
}
export async function setStatusActive(id) {
    await prisma.batch.update({
        where: { id },
        data: {
            status: Status.active,
        },
    });
}
export async function setStatusCompleted(id) {
    await prisma.job.update({
        where: { id },
        data: {
            status: Status.completed,
            completedAt: new Date(),
        },
    });
}
export async function setStatusFailed(id) {
    await prisma.batch.update({
        where: { id },
        data: {
            status: Status.failed,
        },
    });
}
//# sourceMappingURL=batchJob.repository.js.map