'use client';

import React from 'react';
import RequisitionDetail from '@/components/procurement/RequisitionDetail';

export default function RequisitionPage({ params }: { params: { id: string } }) {
  return (
    <div className="p-6">
      <RequisitionDetail id={params.id} />
    </div>
  );
}
