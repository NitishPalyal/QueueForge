import React from 'react';
import { ArrowRight, Loader2, Trash2 } from 'lucide-react';
import { Modal } from '../../../shared/components/Modal';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { useBatchDetail, useDeleteBatch } from '../hooks/useBatches';
import styles from './BatchDetailModal.module.css';

interface BatchDetailModalProps {
  batchId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BatchDetailModal: React.FC<BatchDetailModalProps> = ({ batchId, isOpen, onClose }) => {
  const { data, isLoading, isError } = useBatchDetail(batchId);
  const deleteMutation = useDeleteBatch();

  if (!isOpen || !batchId) return null;

  const jobs = data?.batchjobs || [];

  // Derive aggregate batch status from child jobs to handle backend batch status mismatch
  let derivedStatus: 'pending' | 'active' | 'completed' | 'failed' = 'pending';
  if (jobs.length > 0) {
    if (jobs.some((j) => j.status === 'failed')) {
      derivedStatus = 'failed';
    } else if (jobs.every((j) => j.status === 'completed')) {
      derivedStatus = 'completed';
    } else if (jobs.some((j) => j.status === 'active')) {
      derivedStatus = 'active';
    }
  }

  const handleDelete = async () => {
    if (!batchId) return;
    await deleteMutation.mutateAsync(batchId);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span>Batch Flow Progression</span>
          <Badge type="status" value={derivedStatus} />
        </div>
      }
      footer={
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', justifyContent: 'space-between' }}>
          <Button
            variant="danger"
            size="sm"
            isLoading={deleteMutation.isPending}
            leftIcon={<Trash2 size={16} />}
            onClick={handleDelete}
          >
            Delete Batch
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className={styles.loadingCenter}>
          <Loader2 className="spinner" size={28} />
          <span>Fetching batch flow steps...</span>
        </div>
      ) : isError || jobs.length === 0 ? (
        <div style={{ color: 'var(--text-secondary)', padding: '2rem', textAlign: 'center' }}>
          No step details available for this batch.
        </div>
      ) : (
        <div className={styles.container}>
          {/* Flow Step Sequence Indicator */}
          <div className={styles.flowHeader}>
            {jobs.map((job, idx) => (
              <React.Fragment key={job.id}>
                <div className={styles.flowStepPill}>
                  <span>Step {idx + 1}:</span>
                  <span style={{ textTransform: 'capitalize' }}>{job.type}</span>
                </div>
                {idx < jobs.length - 1 && <ArrowRight size={18} className={styles.flowArrow} />}
              </React.Fragment>
            ))}
          </div>

          {/* Individual Step Cards */}
          <div className={styles.stepsList}>
            {jobs.map((job, idx) => (
              <div key={job.id} className={styles.stepCard}>
                <div className={styles.stepCardHeader}>
                  <div className={styles.stepTitle}>
                    <span className={styles.stepNumber}>{idx + 1}</span>
                    <span style={{ textTransform: 'capitalize' }}>{job.type} Service Step</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({job.queue_name})
                    </span>
                  </div>
                  <Badge type="status" value={job.status} />
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Job ID:</strong> <span style={{ fontFamily: 'var(--font-mono)' }}>{job.id}</span>
                </div>

                {job.error && (
                  <div
                    style={{
                      backgroundColor: 'rgba(244, 63, 94, 0.1)',
                      color: 'var(--status-failed-text)',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                    }}
                  >
                    Error: {job.error}
                  </div>
                )}

                {/* Render Step Output if Completed */}
                {job.type === 'mail' && job.payload?.subject && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                    <strong>Drafted Subject:</strong> {job.payload.subject}
                  </div>
                )}

                {job.type === 'ai' && job.payload?.response && (
                  <div
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-primary)',
                      backgroundColor: 'var(--bg-elevated)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                    }}
                  >
                    {job.payload.response}
                  </div>
                )}

                {(job as any).processedImageUrl && (
                  <div>
                    <img
                      src={(job as any).processedImageUrl}
                      alt="Processed Step Preview"
                      style={{ maxHeight: '160px', borderRadius: '6px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
