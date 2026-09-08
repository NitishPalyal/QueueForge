// ─── REPOSITORY = All DB queries for Users live here ──────────────────────────
// Think of it as the ONLY place that knows about Prisma/the database.
// Services call repositories. Repositories call Prisma.
import { prisma } from "../config/config.database.js";
import { Prisma } from "../../generated/prisma/client.js";
import { Status } from "../../generated/prisma/client.js";
// Prisma namespace gives you auto-generated input types like UserCreateInput
export async function findAll(limit, skip) {
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
export async function findById(id) {
    return await prisma.job.findUnique({
        where: { id },
    });
}
export async function findByBatch(batchId) {
    return await prisma.job.findMany({
        where: { batchId },
    });
}
export async function findByQueueName(queue_name) {
    return await prisma.job.findMany({
        where: { queue_name },
        orderBy: { createdAt: "desc" },
    });
}
export async function findByStatus(status) {
    return await prisma.job.findMany({
        where: { status },
        orderBy: { createdAt: "desc" },
    });
}
export async function findByQueueNameAndStatus(queue_name, status) {
    return await prisma.job.findMany({
        where: { queue_name, status },
        orderBy: { createdAt: "desc" },
    });
}
export async function create(data) {
    return await prisma.job.create({
        data,
    });
}
export async function deleteJob(id) {
    await prisma.job.delete({
        where: { id },
    });
}
export async function updateJobPayload({ id, payload, }) {
    await prisma.job.update({
        where: { id },
        data: {
            payload,
        },
    });
}
export async function updateJobAttempt(id) {
    await prisma.job.update({
        where: { id },
        data: {
            attempts: { increment: 1 },
        },
    });
}
export async function setBatchIdAndStepOrder(jobId, batchId, stepOrder) {
    await prisma.job.update({
        where: { id: jobId },
        data: { batchId, stepOrder },
    });
}
export async function setStatusPending(id) {
    await prisma.job.update({
        where: { id },
        data: {
            status: Status.pending,
        },
    });
}
export async function setStatusActive(id) {
    await prisma.job.update({
        where: { id },
        data: {
            status: Status.active,
            startedAt: new Date(),
        },
    });
}
export async function updateJobPriority(id, priority) {
    await prisma.job.update({
        where: { id },
        data: { priority },
    });
}
export async function setStatusDelayed(id, scheduledFor) {
    await prisma.job.update({
        where: { id },
        data: {
            status: Status.delayed,
            scheduledFor,
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
export async function setStatusFailed(id, error) {
    await prisma.job.update({
        where: { id },
        data: {
            status: Status.failed,
            error,
            completedAt: new Date(),
        },
    });
}
//# sourceMappingURL=job.repository.js.map