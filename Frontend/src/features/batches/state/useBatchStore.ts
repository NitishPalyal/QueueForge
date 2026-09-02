import { create } from 'zustand';

interface BatchStoreState {
  selectedBatchId: string | null;
  isDetailOpen: boolean;
  currentPage: number;
  limit: number;

  setSelectedBatchId: (id: string | null) => void;
  openBatchDetail: (id: string) => void;
  closeBatchDetail: () => void;
  setCurrentPage: (page: number) => void;
}

export const useBatchStore = create<BatchStoreState>((set) => ({
  selectedBatchId: null,
  isDetailOpen: false,
  currentPage: 1,
  limit: 50,

  setSelectedBatchId: (id) => set({ selectedBatchId: id }),
  openBatchDetail: (id) => set({ selectedBatchId: id, isDetailOpen: true }),
  closeBatchDetail: () => set({ selectedBatchId: null, isDetailOpen: false }),
  setCurrentPage: (page) => set({ currentPage: page }),
}));
