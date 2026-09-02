import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';
import styles from './Pagination.module.css';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (newPage: number) => void;
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  limit,
  total,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  itemLabel = 'items',
}) => {
  const startItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className={styles.paginationContainer}>
      <div className={styles.info}>
        Showing <strong>{startItem}</strong> to <strong>{endItem}</strong> of <strong>{total}</strong> {itemLabel}
      </div>

      <div className={styles.controls}>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage || page <= 1}
          onClick={() => onPageChange(page - 1)}
          leftIcon={<ChevronLeft size={16} />}
        >
          Previous
        </Button>

        <span className={styles.pageIndicator}>
          Page {page} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          onClick={() => onPageChange(page + 1)}
          rightIcon={<ChevronRight size={16} />}
        >
          Next
        </Button>
      </div>
    </div>
  );
};
