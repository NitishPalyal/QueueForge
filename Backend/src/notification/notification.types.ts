import type { EventStatus } from "../shared/types.ts";

/**
 * Payload published to the job-event stream.
 *
 * Fields:
 * - jobId: identifier of the queue job
 * - status: current lifecycle state of the job
 * - message: human-readable status text for clients
 * - queue: queue name the job belongs to
 * - timestamp: unix timestamp when the event was triggered
 * - type: domain event type used by frontend consumers
 */
export interface TriggerEventPayload {
  jobId: string;
  status: EventStatus;
  message: string;
  queue: string;
  timestamp: number;
  type: string;
}
