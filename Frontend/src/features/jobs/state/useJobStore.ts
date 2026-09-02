import { create } from 'zustand';
import type { JobStatus, QueueName } from '../../../shared/types/api';

interface JobStoreState {
  selectedJobId: string | null;
  isDetailOpen: boolean;
  statusFilter: JobStatus | 'all';
  queueFilter: QueueName | 'all';
  currentPage: number;
  limit: number;

  setSelectedJobId: (id: string | null) => void;
  openJobDetail: (id: string) => void;
  closeJobDetail: () => void;
  setStatusFilter: (status: JobStatus | 'all') => void;
  setQueueFilter: (queue: QueueName | 'all') => void;
  setCurrentPage: (page: number) => void;
  resetFilters: () => void;
}

export const useJobStore = create<JobStoreState>((set) => ({
  selectedJobId: null,
  isDetailOpen: false,
  statusFilter: 'all',
  queueFilter: 'all',
  currentPage: 1,
  limit: 50,

  setSelectedJobId: (id) => set({ selectedJobId: id }),
  openJobDetail: (id) => set({ selectedJobId: id, isDetailOpen: true }),
  closeJobDetail: () => set({ selectedJobId: null, isDetailOpen: false }),
  setStatusFilter: (status) => set({ statusFilter: status, currentPage: 1 }),
  setQueueFilter: (queue) => set({ queueFilter: queue, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  resetFilters: () => set({ statusFilter: 'all', queueFilter: 'all', currentPage: 1 }),
}));
