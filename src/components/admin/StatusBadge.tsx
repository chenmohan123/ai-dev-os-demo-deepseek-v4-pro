import React from 'react';
import { Badge } from '@/components/ui/Badge';

export function StatusBadge({ status }: { status: number }) {
  return (
    <Badge variant={status === 1 ? 'success' : 'warning'}>
      {status === 1 ? '已发布' : '草稿'}
    </Badge>
  );
}
