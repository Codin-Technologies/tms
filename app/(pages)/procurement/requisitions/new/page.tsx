'use client';

import React from 'react';
import RequisitionForm from '@/components/procurement/RequisitionForm';
import { useRouter } from 'next/navigation';

export default function NewRequisitionPage() {
  const router = useRouter();
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">New Requisition</h2>
      <RequisitionForm onSuccess={() => router.push('/procurement')} onCancel={() => router.push('/procurement')} />
    </div>
  );
}
