import type { Step } from "./batchJob.zodSchema.ts";

export interface JobRow {
  id: string;
  type: string;
  status: string;
  batchId: string | null;
  stepOrder: number | null;
}

export interface BatchStepMeta {
  dbJobId: string;
  batchId: string;
  isLastStep: boolean;
}

export const QUEUE_BY_TYPE: Record<Step["type"], string> = {
  image: "image",
  mail: "ai",
  ai: "ai",
};

export interface buildFlowTreeServiceParam {
  steps: Step[];
  jobs: JobRow[];
  batchId: string;
}

export interface toFlowJobParam {
  step: Step;
  job: JobRow;
  isLastStep: boolean;
}

export interface createBatchParam {
  steps: Step[];
}

export interface finishStepParam {
  dbJobId: string;
  batchId: string | undefined;
  isLastStep: boolean;
}

export interface createBatchControllerBody {
  steps: Step[];
}

export interface getAllBatchesControllerQuerys {
  page?: string | undefined;
  limit?: string | undefined;
}

export interface getAllBatchesServiceParams {
  page: number;
  limit: number;
}
