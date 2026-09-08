import { logger } from "../shared/logger.js";
import { FolderName, isMimeType } from "../queues/image/image.types.js";
import { BatchRequestSchema } from "./batchJob.zodSchema.js";
import { deleteFromStorageService, getImageUrlFromStorageService, uploadToStorageService, } from "../queues/image/image.service.js";
import { createBatchService, deleteBatchService, getAllBatchesService, getBatchJobsService, getBatchService, } from "./batchJob.service.js";
export async function uploadImageController(req, res) {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({
                success: false,
                message: "Image file is required.",
            });
        }
        if (!isMimeType(file.mimetype)) {
            return res.status(401).json({
                success: false,
                message: "Unsupported image type.",
            });
        }
        const uploadedImageKey = await uploadToStorageService({
            buffer: file.buffer,
            mimeType: file.mimetype,
            folderName: FolderName.uploaded,
        });
        const uploadedImageUrl = await getImageUrlFromStorageService(uploadedImageKey);
        res.status(202).json({
            success: true,
            message: "Image uploaded successfully.",
            data: { key: uploadedImageKey, url: uploadedImageUrl },
        });
    }
    catch (error) {
        logger.error("Error in uploadImageController", "batchJob.controller", error);
        return res.status(500).json({
            success: false,
            message: "Failed to upload image.",
        });
    }
}
export async function deleteImageController(req, res) {
    try {
        const { uploadedImageKey } = req.body;
        if (!uploadedImageKey) {
            return res.status(404).json({
                success: false,
                message: "uploadedImageKey not found.",
            });
        }
        await deleteFromStorageService(uploadedImageKey);
        res.status(202).json({
            success: true,
            message: "Image deleted from storage successfully.",
        });
    }
    catch (error) {
        logger.error("Error in deleteImageController", "batchJob.controller", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete image from storage.",
        });
    }
}
export async function createBatchJobController(req, res) {
    try {
        // const { steps } = req.body;
        const parsed = BatchRequestSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({
                message: "Invalid request",
                success: false,
                error: parsed.error.flatten(),
            });
        }
        const batch = await createBatchService({ steps: parsed.data.steps });
        return res.status(201).json({
            success: true,
            message: "Batch job created successfully.",
            data: { batchId: batch.id },
        });
    }
    catch (error) {
        logger.error("Error in createBatchJobController", "batchJob.controller", error);
        return res.status(500).json({
            success: false,
            message: "Failed to create batch job.",
        });
    }
}
export async function getAllBatchesController(req, res) {
    try {
        const page = Number(req.query.page ?? 1);
        const limit = Number(req.query.limit ?? 50);
        const { batches, totalBatches, hasNextPage, hasPreviousPage } = await getAllBatchesService({ page, limit });
        if (!batches || batches.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No batches found.",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Batches retrieved successfully.",
            data: {
                batches,
                totalBatches,
                hasNextPage,
                hasPreviousPage,
                page,
                limit,
            },
        });
    }
    catch (error) {
        logger.error("Error in getAllBatchesController", "batchJob.controller", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve batches.",
        });
    }
}
export async function getBatchJobsByIdController(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Batch ID is required.",
            });
        }
        const batchjobs = await getBatchJobsService(id);
        if (!batchjobs || batchjobs.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Batch not found.",
            });
        }
        return res.status(200).json({
            success: true,
            message: "Batch jobs retrieved successfully.",
            data: { batchjobs },
        });
    }
    catch (error) {
        logger.error("Error in getBatchJobsController", "batchJob.controller", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve batch jobs.",
        });
    }
}
export async function deleteBatchByIdController(req, res) {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Batch ID is required.",
            });
        }
        const isBatchExist = await getBatchService(id);
        if (!isBatchExist) {
            return res.status(404).json({
                success: true,
                message: "Batch job not found.",
            });
        }
        await deleteBatchService(id);
        return res.status(200).json({
            success: true,
            message: "Batch job deleted successfully.",
        });
    }
    catch (error) {
        logger.error("Error in deleteBatchByIdController", "batchJob.controller", error);
        return res.status(500).json({
            success: false,
            message: "Failed to delete batch job.",
            error: { error },
        });
    }
}
//# sourceMappingURL=batchJob.controller.js.map