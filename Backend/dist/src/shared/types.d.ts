export interface APIResponse {
    success: boolean;
    message: string;
    data?: object;
    error?: object;
}
export declare enum EventStatus {
    "waiting" = 0,
    "active" = 1,
    "completed" = 2,
    "failed" = 3
}
export type JobEvent = {
    jobId: string;
    queue: string;
    type: string;
    status: EventStatus;
    timestamp: number;
};
//# sourceMappingURL=types.d.ts.map