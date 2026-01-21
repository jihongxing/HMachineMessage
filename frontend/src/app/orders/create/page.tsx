'use client';

import { Suspense } from 'react';
import CreateOrderContent from './CreateOrderContent';

export default function CreateOrderPage() {
  return (
    <Suspense fallback={<div className="container py-12 text-center">加载中...</div>}>
      <CreateOrderContent />
    </Suspense>
  );
}
