import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Play, Info, Loader2, BarChart2, Zap } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { BenchmarkStatBoxes } from './BenchmarkStatBoxes';
import { useJobBenchmark, useBatchBenchmark } from '../hooks/useBenchmarks';
import type { BatchBenchmarkResult, JobBenchmarkResult } from '../../../shared/types/api';
import styles from './AnalyticsPage.module.css';

export const AnalyticsPage: React.FC = () => {
  const [activeResult, setActiveResult] = useState<JobBenchmarkResult | BatchBenchmarkResult | null>(null);
  const [latencyData, setLatencyData] = useState<any[]>([
    { name: 'Email Queue', p50: 120, p95: 280, p99: 450 },
    { name: 'AI LLM Queue', p50: 350, p95: 890, p99: 1420 },
    { name: 'Image Processing', p50: 210, p95: 540, p99: 880 },
    { name: 'Batch Flow Chain', p50: 480, p95: 1100, p99: 1850 },
  ]);

  const jobBenchmarkMutation = useJobBenchmark();
  const batchBenchmarkMutation = useBatchBenchmark();

  const isRunning = jobBenchmarkMutation.isPending || batchBenchmarkMutation.isPending;

  const runSingleBenchmark = async (type: 'email' | 'ai' | 'image') => {
    try {
      const res = await jobBenchmarkMutation.mutateAsync(type);
      setActiveResult(res);
      if (res.p50Ms !== null) {
        setLatencyData((prev) =>
          prev.map((item) =>
            item.name.toLowerCase().includes(type)
              ? { ...item, p50: res.p50Ms, p95: res.p95Ms, p99: res.p99Ms }
              : item
          )
        );
      }
    } catch {}
  };

  const runBatchTest = async () => {
    try {
      const res = await batchBenchmarkMutation.mutateAsync();
      setActiveResult(res);
      if (res.p50Ms !== null) {
        setLatencyData((prev) =>
          prev.map((item) =>
            item.name.includes('Batch')
              ? { ...item, p50: res.p50Ms, p95: res.p95Ms, p99: res.p99Ms }
              : item
          )
        );
      }
    } catch {}
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>System Benchmarks & Latency Analytics</h2>
        <p className={styles.subtitle}>
          Execute live load-testing simulations against QueueForge job endpoints to measure latency percentiles and throughput.
        </p>
      </div>

      {/* Warning / Informational Banner */}
      <div className={styles.noticeBanner}>
        <Info size={20} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        <span>
          <strong>Note:</strong> Benchmark simulations run real jobs synchronously against background workers. Tests can take several seconds to execute and reconcile.
        </span>
      </div>

      {/* Controls Grid */}
      <div className={styles.controlsGrid}>
        <div className={styles.benchmarkCard}>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Email Job Benchmark
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tests 2-stage AI drafting + SMTP worker pipeline throughput.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            isLoading={jobBenchmarkMutation.isPending && jobBenchmarkMutation.variables === 'email'}
            disabled={isRunning}
            leftIcon={<Play size={14} />}
            onClick={() => runSingleBenchmark('email')}
          >
            Run Email Benchmark
          </Button>
        </div>

        <div className={styles.benchmarkCard}>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              AI Response Benchmark
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tests LLM generation queue concurrency and completion times.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            isLoading={jobBenchmarkMutation.isPending && jobBenchmarkMutation.variables === 'ai'}
            disabled={isRunning}
            leftIcon={<Play size={14} />}
            onClick={() => runSingleBenchmark('ai')}
          >
            Run AI Benchmark
          </Button>
        </div>

        <div className={styles.benchmarkCard}>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Image Processing Benchmark
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tests WebP re-encoding and Backblaze B2 storage latency.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            isLoading={jobBenchmarkMutation.isPending && jobBenchmarkMutation.variables === 'image'}
            disabled={isRunning}
            leftIcon={<Play size={14} />}
            onClick={() => runSingleBenchmark('image')}
          >
            Run Image Benchmark
          </Button>
        </div>

        <div className={styles.benchmarkCard}>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              Batch Flow Benchmark
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Tests BullMQ FlowProducer multi-step job creation rate.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            isLoading={batchBenchmarkMutation.isPending}
            disabled={isRunning}
            leftIcon={<Zap size={14} />}
            onClick={runBatchTest}
          >
            Run Batch Benchmark
          </Button>
        </div>
      </div>

      {/* Live Benchmark Execution Summary Cards */}
      {activeResult && <BenchmarkStatBoxes result={activeResult} />}

      {/* Recharts Latency Bar Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={20} style={{ color: 'var(--primary)' }} />
            <h3 className={styles.chartTitle}>Latency Percentile Distribution (ms)</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Comparing P50, P95, and P99 metrics
          </span>
        </div>

        {isRunning ? (
          <div className={styles.loadingOverlay}>
            <Loader2 className="spinner" size={32} style={{ color: 'var(--primary)' }} />
            <span>Executing synchronous load test simulation...</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Submitting test payloads & waiting for database reconciliation...
            </span>
          </div>
        ) : (
          <div style={{ width: '100%', height: 340 }}>
            <ResponsiveContainer>
              <BarChart data={latencyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-card)',
                    borderColor: 'var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                  }}
                />
                <Legend />
                <Bar dataKey="p50" name="P50 Latency (ms)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p95" name="P95 Latency (ms)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="p99" name="P99 Latency (ms)" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
