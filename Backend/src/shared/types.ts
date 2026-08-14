// API RESPONSE  //
export interface APIResponse {
  success: boolean;
  message: string;
  data?: object;
  error?: object;
}

// EVENT STATUS //
export enum EventStatus {
  "waiting",
  "active",
  "completed",
  "failed",
}

// EVENT PAYLOAD //
export type JobEvent = {
  jobId: string;
  queue: string;
  type: string;
  status: EventStatus;
  timestamp: number;
};
