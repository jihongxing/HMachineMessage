'use client';

import { Suspense } from 'react';
import EquipmentListContent from './EquipmentListContent';

export default function EquipmentListPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-center">加载中...</div>}>
      <EquipmentListContent />
    </Suspense>
  );
}


