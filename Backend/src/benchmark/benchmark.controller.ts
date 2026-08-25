import type { Request, Response } from "express";
import { runBenchmark } from "./benchmark.service.ts";
import { logger } from "../shared/logger.ts";
import type { APIResponse } from "../shared/types.ts";

export async function getBenchmarkController(
  req: Request<{ jobType: string }, {}, {}, {}>,
  res: Response<APIResponse>,
): Promise<Response> {
  try {
    const { jobType } = req.params;

    if (jobType !== "email" && jobType !== "ai" && jobType !== "image") {
      return res.status(400).json({
        success: false,
        message: "jobType must be 'email', 'ai', or 'image'.",
      });
    }

    // jobType is validated here

    // No `if (!cookie)` guard here on purpose - userAuthValidator already ran
    // on this route and rejects with 401 before this function is ever reached,
    // so req.headers.cookie is guaranteed to exist by this point.
    const cookie = req.headers.cookie!;

    const result = await runBenchmark(jobType, cookie);
    return res.status(200).json({
      success: true,
      message: `${jobType} benchmark fetched successfully.`,
      data: result,
    });
  } catch (error) {
    logger.error("Benchmark failed", "benchmark.controller", error);
    return res
      .status(500)
      .json({ success: false, message: "Benchmark failed." });
  }
}
