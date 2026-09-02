import React from 'react';
import dayjs from 'dayjs';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { useJobDetail, useRetryJob, useDeleteJob } from '../hooks/useJobs';
import type { QueueName } from '../../../shared/types/api';
import styles from './JobDetailModal.module.css';

interface JobDetailModalProps {
  jobId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const toText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
};

export const JobDetailModal: React.FC<JobDetailModalProps> = ({ jobId, isOpen, onClose }) => {
  const { data, isLoading, isError, error } = useJobDetail(jobId);
  const retryMutation = useRetryJob();
  const deleteMutation = useDeleteJob();

  if (!isOpen || !jobId) return null;

  const job = data?.job;
  const uploadedImageUrl = data?.uploadedImageUrl;
  const processedImageUrl = data?.processedImageUrl;

  const handleRetry = async () => {
    if (!job) return;
    const queue = (job.queue_name || 'mailQueue') as QueueName;
    await retryMutation.mutateAsync({ id: job.id, queue });
  };

  const handleDelete = async () => {
    if (!job) return;
    const queue = (job.queue_name || 'mailQueue') as QueueName;
    await deleteMutation.mutateAsync({ queue, id: job.id });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        job ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span>Job Details</span>
            <Badge type="status" value={job.status} />
            <Badge type="priority" value={job.priority} />
          </div>
        ) : (
          'Job Details'
        )
      }
      footer={
        job && (
          <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between' }}>
            <Button
              variant="danger"
              size="sm"
              isLoading={deleteMutation.isPending}
              leftIcon={<Trash2 size={16} />}
              onClick={handleDelete}
            >
              Delete Job
            </Button>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="sm"
                isLoading={retryMutation.isPending}
                leftIcon={<RefreshCw size={16} />}
                onClick={handleRetry}
              >
                Re-run Job
              </Button>
              <Button variant="outline" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )
      }
    >
      {isLoading ? (
        <div className={styles.loadingCenter}>
          <Loader2 className="spinner" size={28} />
          <span>Fetching full job details...</span>
        </div>
      ) : isError || !job ? (
        <div className={styles.errorBox}>
          Failed to load job details: {(error as any)?.message || 'Job record not found'}
        </div>
      ) : (
        <div className={styles.container}>
          {/* Metadata Grid */}
          <div className={styles.metaGrid}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Job ID</span>
              <span className={`${styles.metaValue} ${styles.mono}`}>{job.id}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Queue</span>
              <span className={styles.metaValue}>{job.queue_name}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Type</span>
              <span className={styles.metaValue}>{job.type}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Attempts</span>
              <span className={styles.metaValue}>
                {job.attempts} / {job.max_attempts}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Created</span>
              <span className={styles.metaValue}>
                {dayjs(job.createdAt).format('MMM D, YYYY HH:mm:ss')}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Completed</span>
              <span className={styles.metaValue}>
                {job.completedAt ? dayjs(job.completedAt).format('MMM D, YYYY HH:mm:ss') : '—'}
              </span>
            </div>
          </div>

          {/* Failure Error Display */}
          {job.error && (
            <div>
              <h4 className={styles.sectionTitle}>Execution Error</h4>
              <div className={styles.errorBox}>{job.error}</div>
            </div>
          )}

          {/* Payload Content Section based on Job Type */}
          <div>
            <h4 className={styles.sectionTitle}>Job Data & Result</h4>
            <div className={styles.payloadBox}>
              {/* Mail Job */}
              {job.type === 'mail' && (
                <div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <strong>Recipient: </strong> <span className={styles.mono}>{toText(job.payload?.to)}</span>
                  </div>
                  <div className={styles.promptBox}>
                    <strong>Prompt: </strong> {toText(job.payload?.prompt)}
                  </div>

                  {toText(job.payload?.subject) && (
                    <div className={styles.emailSubject}>
                      Subject: {toText(job.payload?.subject)}
                    </div>
                  )}

                  {toText(job.payload?.html) ? (
                    <div>
                      <div className={styles.metaLabel} style={{ marginBottom: '0.5rem' }}>
                        Rendered Email HTML Preview:
                      </div>
                      <iframe
                        title="Email HTML Preview"
                        className={styles.emailIframe}
                        srcDoc={toText(job.payload?.html)}
                      />
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Email HTML content will be rendered upon completion.
                    </div>
                  )}
                </div>
              )}

              {/* AI Job */}
              {job.type === 'ai' && (
                <div>
                  <div className={styles.promptBox}>
                    <strong>Prompt: </strong> {toText(job.payload?.prompt)}
                  </div>
                  {toText(job.payload?.response) ? (
                    <div className={styles.aiResponseBox}>{toText(job.payload?.response)}</div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      AI response generation in progress...
                    </div>
                  )}
                </div>
              )}

              {/* Image Job */}
              {(job.type === 'image' || job.queue_name === 'imageQueue') && (
                <div className={styles.imageGrid}>
                  {uploadedImageUrl && (
                    <div className={styles.imageCard}>
                      <div className={styles.imageCardHeader}>Uploaded Image Source</div>
                      <img
                        src={uploadedImageUrl}
                        alt="Uploaded Original"
                        className={styles.imagePreview}
                      />
                    </div>
                  )}

                  {processedImageUrl ? (
                    <div className={styles.imageCard}>
                      <div className={styles.imageCardHeader}>Processed WebP Output (1920x1920)</div>
                      <img
                        src={processedImageUrl}
                        alt="Processed WebP"
                        className={styles.imagePreview}
                      />
                    </div>
                  ) : (
                    <div className={styles.imageCard}>
                      <div className={styles.imageCardHeader}>Processed Output</div>
                      <div
                        style={{
                          height: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--text-muted)',
                          fontSize: '0.85rem',
                        }}
                      >
                        Optimization pending...
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
