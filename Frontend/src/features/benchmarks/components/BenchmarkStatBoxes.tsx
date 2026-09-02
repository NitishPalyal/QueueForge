import React from 'react';
import { Zap, Clock, CheckCircle2, AlertTriangle, Layers } from 'lucide-react';
import type { JobBenchmarkResult, BatchBenchmarkResult } from '../../../shared/types/api';
import styles from './BenchmarkStatBoxes.module.css';

interface BenchmarkStatBoxesProps {
  result?: JobBenchmarkResult | BatchBenchmarkResult | null;
}

export const BenchmarkStatBoxes: React.FC<BenchmarkStatBoxesProps> = ({ result }) => {
  const ratePerSec = result?.ratePerSec ?? '—';
  const p99Ms = result?.p99Ms !== undefined && result?.p99Ms !== null ? `${result.p99Ms} ms` : '—';
  const dbMatch = result ? (result.matches ? 'Reconciled' : 'Mismatch') : '—';
  const ratio = result ? `${result.accepted} / ${result.rejected}` : '—';

  return (
    <div className={styles.grid}>
      {/* Box 1: Throughput */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statTitle}>Throughput Rate</span>
          <Zap size={18} style={{ color: 'var(--primary)' }} />
        </div>
        <div className={styles.statValue}>{ratePerSec}</div>
        <div className={styles.statSubtext}>Accepted requests per second</div>
      </div>

      {/* Box 2: P99 Latency */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statTitle}>P99 Latency</span>
          <Clock size={18} style={{ color: 'var(--secondary)' }} />
        </div>
        <div className={styles.statValue}>{p99Ms}</div>
        <div className={styles.statSubtext}>99th percentile response time</div>
      </div>

      {/* Box 3: DB Match Reconciliation */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statTitle}>DB Reconciliation</span>
          {result?.matches ? (
            <CheckCircle2 size={18} style={{ color: 'var(--status-completed-text)' }} />
          ) : (
            <AlertTriangle size={18} style={{ color: 'var(--status-pending-text)' }} />
          )}
        </div>
        <div className={styles.statValue}>
          <span className={result?.matches ? styles.passText : result ? styles.failText : ''}>
            {dbMatch}
          </span>
        </div>
        <div className={styles.statSubtext}>Matches persisted DB job records</div>
      </div>

      {/* Box 4: Accepted / Rejected Ratio */}
      <div className={styles.statCard}>
        <div className={styles.statHeader}>
          <span className={styles.statTitle}>Accepted / Rejected</span>
          <Layers size={18} style={{ color: 'var(--accent-purple)' }} />
        </div>
        <div className={styles.statValue}>{ratio}</div>
        <div className={styles.statSubtext}>
          Sample size: {result?.sampleSize ?? result?.requestsSent ?? 0} requests
        </div>
      </div>
    </div>
  );
};
