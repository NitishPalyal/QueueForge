import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Mail, Bot, Image as ImageIcon, Workflow, ArrowRight, Eye, Inbox, Loader2 } from 'lucide-react';
import { BenchmarkStatBoxes } from '../benchmarks/components/BenchmarkStatBoxes';
import { Badge } from '../../shared/components/Badge';
import { Button } from '../../shared/components/Button';
import { useJobsList } from '../jobs/hooks/useJobs';
import { useJobStore } from '../jobs/state/useJobStore';
import { JobDetailModal } from '../jobs/components/JobDetailModal';
import styles from './Dashboard.module.css';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useJobsList(1, 10, 'all', 'all');
  const { selectedJobId, isDetailOpen, openJobDetail, closeJobDetail } = useJobStore();

  const recentJobs = data?.jobs || [];

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>System Overview</h1>
          <p className={styles.subtitle}>
            Real-time status monitoring for distributed BullMQ background job queues
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Workflow size={18} />}
          onClick={() => navigate('/create-job')}
        >
          Create New Job
        </Button>
      </div>

      {/* 4 Benchmark / Metric Summary Boxes */}
      <BenchmarkStatBoxes />

      {/* Quick Action Shortcuts */}
      <div>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Queue Quick Launch</h3>
        </div>
        <div className={styles.quickActions}>
          <Link to="/create-job" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <Mail size={22} />
            </div>
            <div className={styles.actionText}>
              <span className={styles.actionTitle}>Email Job</span>
              <span className={styles.actionDesc}>2-stage AI email drafting & dispatch</span>
            </div>
          </Link>

          <Link to="/create-job" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <Bot size={22} />
            </div>
            <div className={styles.actionText}>
              <span className={styles.actionTitle}>AI Response</span>
              <span className={styles.actionDesc}>LLM background text generation</span>
            </div>
          </Link>

          <Link to="/create-job" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <ImageIcon size={22} />
            </div>
            <div className={styles.actionText}>
              <span className={styles.actionTitle}>Image Processing</span>
              <span className={styles.actionDesc}>WebP re-encoding & resizing</span>
            </div>
          </Link>

          <Link to="/create-batch" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <Workflow size={22} />
            </div>
            <div className={styles.actionText}>
              <span className={styles.actionTitle}>Batch Flow Chain</span>
              <span className={styles.actionDesc}>Sequential BullMQ FlowProducer pipeline</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Jobs Table (Live Socket updates) */}
      <div>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Recent Queue Activity</h3>
          <Link
            to="/jobs"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--primary)',
              fontSize: '0.85rem',
              fontWeight: 500,
              textDecoration: 'none',
            }}
          >
            View All Jobs <ArrowRight size={14} />
          </Link>
        </div>

        <div className={styles.tableWrapper}>
          {isLoading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Loader2 className="spinner" size={28} style={{ color: 'var(--primary)' }} />
              <div style={{ marginTop: '0.5rem' }}>Loading recent queue activity...</div>
            </div>
          ) : recentJobs.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <Inbox size={36} style={{ color: 'var(--text-muted)' }} />
              <div style={{ marginTop: '0.5rem' }}>No recent jobs found</div>
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
                  <th>Created At</th>
                  <th style={{ textAlign: 'right' }}>View</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.map((job) => {
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
                      <td>{dayjs(job.createdAt).format('MMM D, HH:mm:ss')}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            openJobDetail(job.id);
                          }}
                          title="View Detail"
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <JobDetailModal jobId={selectedJobId} isOpen={isDetailOpen} onClose={closeJobDetail} />
    </div>
  );
};
