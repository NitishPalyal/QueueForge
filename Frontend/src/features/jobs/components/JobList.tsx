import React from 'react';
import dayjs from 'dayjs';
import { Eye, RefreshCw, Trash2, Inbox, Loader2 } from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';
import { Pagination } from '../../../shared/components/Pagination';
import { useJobStore } from '../state/useJobStore';
import { useJobsList, useRetryJob, useDeleteJob } from '../hooks/useJobs';
import { JobDetailModal } from './JobDetailModal';
import type { JobStatus, QueueName } from '../../../shared/types/api';
import styles from './JobList.module.css';

export const JobList: React.FC = () => {
  const {
    selectedJobId,
    isDetailOpen,
    openJobDetail,
    closeJobDetail,
    statusFilter,
    queueFilter,
    currentPage,
    limit,
    setStatusFilter,
    setQueueFilter,
    setCurrentPage,
  } = useJobStore();

  const { data, isLoading } = useJobsList(currentPage, limit, statusFilter, queueFilter);
  const retryMutation = useRetryJob();
  const deleteMutation = useDeleteJob();

  const statusTabs: (JobStatus | 'all')[] = ['all', 'pending', 'active', 'completed', 'failed', 'delayed'];
  const queueTabs: (QueueName | 'all')[] = ['all', 'mailQueue', 'aiQueue', 'imageQueue'];

  const handleRetry = async (e: React.MouseEvent, id: string, queueStr?: string) => {
    e.stopPropagation();
    const queue = (queueStr || 'mailQueue') as QueueName;
    await retryMutation.mutateAsync({ id, queue });
  };

  const handleDelete = async (e: React.MouseEvent, id: string, queueStr?: string) => {
    e.stopPropagation();
    const queue = (queueStr || 'mailQueue') as QueueName;
    await deleteMutation.mutateAsync({ queue, id });
  };

  const jobs = data?.jobs || [];

  return (
    <div className={styles.container}>
      {/* Filter Tabs Bar */}
      <div className={styles.filtersBar}>
        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Status:</span>
          {statusTabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${statusFilter === tab ? styles.tabActive : ''}`}
              onClick={() => setStatusFilter(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className={styles.filterGroup}>
          <span className={styles.filterLabel}>Queue:</span>
          {queueTabs.map((tab) => (
            <button
              key={tab}
              className={`${styles.tabButton} ${queueFilter === tab ? styles.tabActive : ''}`}
              onClick={() => setQueueFilter(tab)}
            >
              {tab === 'all' ? 'All Queues' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Container */}
      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 className="spinner" size={32} style={{ color: 'var(--primary)' }} />
            <span>Loading job queue records...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className={styles.emptyState}>
            <Inbox size={40} style={{ color: 'var(--text-muted)' }} />
            <span>No jobs match your current filters</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Job ID</th>
                <th>Queue</th>
                <th>Type</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Attempts</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const queue = job.queue_name || job.queueName || 'mailQueue';
                return (
                  <tr key={job.id} onClick={() => openJobDetail(job.id)}>
                    <td className={styles.mono}>{job.id.substring(0, 13)}...</td>
                    <td>
                      <Badge type="custom" label={queue} />
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{job.type}</td>
                    <td>
                      <Badge type="status" value={job.status} />
                    </td>
                    <td>
                      <Badge type="priority" value={job.priority} />
                    </td>
                    <td>{job.attempts}</td>
                    <td>{dayjs(job.createdAt).format('MMM D, HH:mm:ss')}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div className={styles.actionsCell} style={{ justifyContent: 'flex-end' }}>
                        <button
                          className={styles.actionIconBtn}
                          title="View Detail"
                          onClick={(e) => {
                            e.stopPropagation();
                            openJobDetail(job.id);
                          }}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          className={styles.actionIconBtn}
                          title="Re-run Job"
                          onClick={(e) => handleRetry(e, job.id, queue)}
                        >
                          <RefreshCw size={16} />
                        </button>
                        <button
                          className={styles.actionIconBtn}
                          title="Delete Job"
                          onClick={(e) => handleDelete(e, job.id, queue)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {data && data.totalJobs > 0 && (
          <Pagination
            page={currentPage}
            limit={limit}
            total={data.totalJobs}
            hasNextPage={data.hasNextPage}
            hasPreviousPage={data.hasPreviousPage}
            onPageChange={setCurrentPage}
            itemLabel="jobs"
          />
        )}
      </div>

      {/* Single Job Detail Modal */}
      <JobDetailModal jobId={selectedJobId} isOpen={isDetailOpen} onClose={closeJobDetail} />
    </div>
  );
};
