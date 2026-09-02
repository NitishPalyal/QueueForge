import React from 'react';
import styles from './Badge.module.css';
import type { JobStatus } from '../types/api';

interface StatusBadgeProps {
  type: 'status';
  value: JobStatus | string;
}

interface PriorityBadgeProps {
  type: 'priority';
  value: number; // 1 = Urgent, 5 = High, 10 = Normal
}

interface CustomBadgeProps {
  type: 'custom';
  label: string;
  variant?: 'neutral' | 'primary';
}

type BadgeProps = StatusBadgeProps | PriorityBadgeProps | CustomBadgeProps;

export const Badge: React.FC<BadgeProps> = (props) => {
  if (props.type === 'status') {
    const statusKey = `status_${props.value.toLowerCase()}`;
    const styleClass = styles[statusKey] || styles.neutral;

    return (
      <span className={`${styles.badge} ${styleClass}`}>
        <span className={styles.dot} />
        {props.value}
      </span>
    );
  }

  if (props.type === 'priority') {
    let priorityLabel = 'Normal';
    let styleClass = styles.priority_normal;

    if (props.value === 1) {
      priorityLabel = 'Urgent';
      styleClass = styles.priority_urgent;
    } else if (props.value === 5) {
      priorityLabel = 'High';
      styleClass = styles.priority_important;
    } else {
      priorityLabel = 'Normal';
      styleClass = styles.priority_normal;
    }

    return <span className={`${styles.badge} ${styleClass}`}>{priorityLabel}</span>;
  }

  return (
    <span className={`${styles.badge} ${styles.neutral}`}>
      {props.label}
    </span>
  );
};
