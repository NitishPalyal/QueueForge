import type { Request, Response } from "express";
import { addJobInAiQueueService } from "../queues/ai/ai.service.ts";
import type { APIResponse } from "../shared/types.ts";
import type { Status } from "../../generated/prisma/enums.ts";
import { logger } from "../shared/logger.ts";
import { FolderName, isMimeType } from "../queues/image/image.types.ts";
import { ImageJobPayloadSchema } from "../shared/zod.schema.ts";
import {
  QUEUES,
  type CreateAiResponseJobControllerBody,
  type CreateEmailJobControllerBody,
} from "./job.types.ts";
import {
  addJobInImageQueueService,
  uploadToStorageService,
} from "../queues/image/image.service.ts";
import {
  createAiResponseJobService,
  createImageProcessingJobService,
  createMailJobService,
  deleteJobService,
  getAllJobsService,
  getAllQueueJobsService,
  getAllQueueStatusJobsService,
  getAllStatusJobsService,
  getImageJobUploadedAndProcessedImageUrlService,
  getJobService,
} from "./job.service.ts";

export async function createEmailJobController(
  req: Request<{}, {}, CreateEmailJobControllerBody>,
  res: Response<APIResponse>,
) {
  try {
    const { to, prompt, idempotency_key } = req.body;

    if (!to || !prompt || !idempotency_key) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in request body.",
      });
    }

    const job = await createMailJobService({ to, prompt, idempotency_key });

    if (!job) {
      return res.status(401).json({
        success: false,
        message: "Failed to Create Email Job.",
      });
    }

    await addJobInAiQueueService({
      isMail: true,
      jobId: job.id,
      payload: { to, prompt },
      ...(job.batchId ? { batchId: job.batchId } : {}),
      isLastStep: false,
    });

    res.status(202).json({
      success: true,
      message: "Email Job created and added to Queue successfully.",
      data: { jodId: job.id, jobStatus: job.status, createdAt: job.createdAt },
    });
  } catch (error) {
    logger.error("Error in createEmailJobController", "job.controller", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create email job.",
    });
  }
}

export async function createAiResponseJobController(
  req: Request<{}, {}, CreateAiResponseJobControllerBody>,
  res: Response<APIResponse>,
) {
  try {
    const { prompt, idempotency_key } = req.body;
    if (!prompt || !idempotency_key) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields in request body.",
      });
    }

    const job = await createAiResponseJobService({ prompt, idempotency_key });

    if (!job) {
      return res.status(500).json({
        success: false,
        message: "Failed to Create Ai Response Job.",
      });
    }

    await addJobInAiQueueService({
      isMail: false,
      jobId: job.id,
      payload: { prompt },
      ...(job.batchId ? { batchId: job.batchId } : {}),
      isLastStep: false,
    });

    res.status(202).json({
      success: true,
      message: "Ai Job created and added to Queue successfully.",
      data: { jodId: job.id, jobStatus: job.status, createdAt: job.createdAt },
    });
  } catch (error) {
    logger.error(
      "Error in createAiResponseJobController",
      "job.controller",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to create Ai Response job.",
    });
  }
}

export async function createImageProcessingJobController(
  req: Request<{}, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const idempotency_key = req.get("idempotency_key");

    if (!idempotency_key) {
      return res.status(400).json({
        success: false,
        message: "Idempotency_key is required",
      });
    }

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

    const job = await createImageProcessingJobService({
      uploadedImageKey,
      idempotency_key,
    });

    if (!job) {
      return res.status(401).json({
        success: false,
        message: "Failed to Create Image Processing Job.",
      });
    }

    await addJobInImageQueueService({
      jobId: job.id,
      uploadedImageKey,
      ...(job.batchId ? { batchId: job.batchId } : {}),
      isLastStep: false,
    });

    res.status(202).json({
      success: true,
      message: "Image Processing Job created and added to Queue successfully.",
      data: { jodId: job.id, jobStatus: job.status, createdAt: job.createdAt },
    });
  } catch (error) {
    logger.error(
      "Error in createImageProcessingJobController",
      "job.controller",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to create Image Processing job.",
    });
  }
}

export async function getAllJobsController(
  req: Request<{}, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const jobs = await getAllJobsService();

    if (!jobs) {
      return res.status(404).json({
        success: false,
        message: "No Jobs Found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "All Jobs Fecthed Successfully.",
      data: { totalJobs: jobs.length, jobs },
    });
  } catch (error) {
    logger.error("Error in getAllJobsController", "job.controller", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch all jobs.",
    });
  }
}

export async function getJobByIdController(
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job id is required.",
      });
    }

    const job = await getJobService(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `No Job with id:- "${id}" found.`,
      });
    }
    if (job.type === "image") {
      const payload = ImageJobPayloadSchema.parse(job.payload);

      const { uploadedImageUrl, processedImageUrl } =
        await getImageJobUploadedAndProcessedImageUrlService({
          uploadedImageKey: payload.uploadedImageKey,
          processedImageKey: payload.processedImageKey ?? "",
        });

      if (!processedImageUrl) {
        return res.status(200).json({
          success: true,
          message: `Job : "${id}" Fecthed Successfully.`,
          data: { job, uploadedImageUrl },
        });
      }

      return res.status(200).json({
        success: true,
        message: `Job : "${id}" Fecthed Successfully.`,
        data: { job, uploadedImageUrl, processedImageUrl },
      });
    } else {
      return res.status(200).json({
        success: true,
        message: `Job : "${id}" Fecthed Successfully.`,
        data: { job },
      });
    }
  } catch (error) {
    logger.error("Error in getJobController", "job.controller", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job.",
    });
  }
}

export async function deleteJobByQueueAndIdController(
  req: Request<{ queue: string; id: string }, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const { id, queue } = req.params;

    if (!id || !queue) {
      return res.status(400).json({
        success: false,
        message: "Job id and queue name are required.",
      });
    }

    const queueName = QUEUES[queue];

    if (!queueName) {
      return res.status(400).json({
        success: false,
        message: `Invalid queue name: ${queue}`,
      });
    }

    const job = await getJobService(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `No Job with id:- "${id}" found.`,
      });
    }

    if (job.type === "image") {
      await deleteJobService({
        isImage: true,
        jobId: job.id,
        queueName: queue,
        payload: job.payload,
      });
      return res.status(200).json({
        success: true,
        message: `Job with id: "${id}" deleted Successfully.`,
      });
    } else {
      await deleteJobService({
        isImage: false,
        jobId: job.id,
        queueName: queue,
      });
      return res.status(200).json({
        success: true,
        message: `Job with id: "${id}" deleted Successfully.`,
      });
    }
  } catch (error) {
    logger.error(
      "Error in deleteJobByQueueAndIdController",
      "job.controller",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to delete job.",
    });
  }
}

export async function getJobStatusByIdController(
  req: Request<{ id: string }, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Job id is required.",
      });
    }
    const job = await getJobService(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: `No Job with id:- "${id}" found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Job : "${id}" status Fecthed Successfully.`,
      data: { status: job.status },
    });
  } catch (error) {
    logger.error(
      "Error in getJobStatusByIdController",
      "job.controller",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch job status.",
    });
  }
}

export async function getAllJobsByStatusController(
  req: Request<{ status: Status }, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const status = req.params.status;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Job status is required.",
      });
    }
    const jobs = await getAllStatusJobsService(status);

    if (!jobs) {
      return res.status(404).json({
        success: false,
        message: `No jobs with status ${status} found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `All ${status} Jobs fecthed Successfully.`,
      data: { totalJobs: jobs.length, jobs },
    });
  } catch (error) {
    logger.error(
      "Error in getAllJobsByStatusController",
      "job.controller",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs by status.",
    });
  }
}

export async function getAllJobsByQueueController(
  req: Request<{ queue: string }, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const queue = req.params.queue;
    if (!queue) {
      return res.status(400).json({
        success: false,
        message: "Queue name is required.",
      });
    }
    const jobs = await getAllQueueJobsService(queue);

    if (!jobs) {
      return res.status(404).json({
        success: false,
        message: `${queue} have no jobs.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `All ${queue} jobs Fecthed Successfully.`,
      data: { totalJobs: jobs.length, jobs },
    });
  } catch (error) {
    logger.error(
      "Error in getAllJobsByQueueController",
      "job.controller",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs by queue.",
    });
  }
}

export async function getAllJobsByQueueAndStatusController(
  req: Request<{ queue: string; status: Status }, {}, {}, {}>,
  res: Response<APIResponse>,
) {
  try {
    const queue = req.params.queue;
    const status = req.params.status;
    if (!queue || !status) {
      return res.status(400).json({
        success: false,
        message: "Queue name and status are required.",
      });
    }
    const jobs = await getAllQueueStatusJobsService(queue, status);

    if (!jobs) {
      return res.status(404).json({
        success: false,
        message: `No jobs in ${queue} with status ${status} found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `All ${queue} jobs with ${status} status fecthed Successfully.`,
      data: { totalJobs: jobs.length, jobs },
    });
  } catch (error) {
    logger.error(
      "Error in getAllJobsByQueueAndStatusController",
      "job.controller",
      error,
    );
    return res.status(500).json({
      success: false,
      message: "Failed to fetch jobs by queue and status.",
    });
  }
}
