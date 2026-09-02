import React from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Eye, Plus, Trash2, Workflow, Loader2 } from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';
import { Button } from '../../../shared/components/Button';
import { Pagination } from '../../../shared/components/Pagination';
import { useBatchStore } from '../state/useBatchStore';
import { useBatchesList, useDeleteBatch } from '../hooks/useBatches';
import { BatchDetailModal } from './BatchDetailModal';
import styles from './BatchList.module.css';

export const BatchList: React.FC = () => {
  const { selectedBatchId, isDetailOpen, openBatchDetail, closeBatchDetail, currentPage, limit, setCurrentPage } =
    useBatchStore();
  const navigate = useNavigate();

  const { data, isLoading } = useBatchesList(currentPage, limit);
  const deleteMutation = useDeleteBatch();

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteMutation.mutateAsync(id);
  };

  const batches = data?.batches || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Chained Batch Flows</h2>
          <p className={styles.subtitle}>
            Multi-stage sequential workflows created with BullMQ FlowProducer pipelines
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus size={18} />}
          onClick={() => navigate('/create-batch')}
        >
          Create Batch Flow
        </Button>
      </div>

      <div className={styles.tableWrapper}>
        {isLoading ? (
          <div className={styles.emptyState}>
            <Loader2 className="spinner" size={32} style={{ color: 'var(--primary)' }} />
            <span>Fetching batch flow records...</span>
          </div>
        ) : batches.length === 0 ? (
          <div className={styles.emptyState}>
            <Workflow size={40} style={{ color: 'var(--text-muted)' }} />
            <span>No batch flows have been submitted yet</span>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Flow Pipeline Type</th>
                <th>Total Steps</th>
                <th>Created At</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch) => (
                <tr key={batch.id} onClick={() => openBatchDetail(batch.id)}>
                  <td className={styles.mono}>{batch.id.substring(0, 13)}...</td>
                  <td>
                    <Badge type="custom" label={batch.type} />
                  </td>
                  <td>{batch.totalSteps} steps</td>
                  <td>{dayjs(batch.createdAt).format('MMM D, YYYY HH:mm:ss')}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button
                        className={styles.actionIconBtn}
                        title="View Flow Detail"
                        onClick={(e) => {
                          e.stopPropagation();
                          openBatchDetail(batch.id);
                        }}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className={styles.actionIconBtn}
                        title="Delete Batch"
                        onClick={(e) => handleDelete(e, batch.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {data && data.totalBatches > 0 && (
          <Pagination
            page={currentPage}
            limit={limit}
            total={data.totalBatches}
            hasNextPage={data.hasNextPage}
            hasPreviousPage={data.hasPreviousPage}
            onPageChange={setCurrentPage}
            itemLabel="batches"
          />
        )}
      </div>

      <BatchDetailModal batchId={selectedBatchId} isOpen={isDetailOpen} onClose={closeBatchDetail} />
    </div>
  );
};
