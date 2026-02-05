'use client';

import React, { useState } from 'react';
import { fetchRequisitionById, approveRequisition, rejectRequisition, createPOFromRequisition } from '@/actions/procurement';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

export default function RequisitionDetail({ id }: { id: string }) {
  const { data, isLoading } = useQuery({ queryKey: ['requisition', id], queryFn: () => fetchRequisitionById(id) });
  const requisition = data?.data;
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (!requisition) return <div>Not found</div>;

  const handleApprove = async () => {
    setLoading(true);
    const res = await approveRequisition(id, 'Approved via UI');
    setLoading(false);
    if (res.success) {
      alert('Approved');
      router.refresh();
    } else alert(res.message || 'Failed');
  };

  const handleReject = async () => {
    setLoading(true);
    const res = await rejectRequisition(id, 'Rejected via UI');
    setLoading(false);
    if (res.success) {
      alert('Rejected');
      router.refresh();
    } else alert(res.message || 'Failed');
  };

  const handleCreatePO = async () => {
    setLoading(true);
    const res: any = await createPOFromRequisition(id);
    setLoading(false);
    if (res.success) {
      alert('PO created');
      router.push('/procurement/purchase-orders');
    } else {
      alert((res as any).message || 'Failed to create PO');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-semibold">{requisition.reference}</h3>
          <div className="text-sm text-gray-600">{requisition.requesterName} • {new Date(requisition.createdAt).toLocaleString()}</div>
        </div>
        <div className="flex gap-2">
          {requisition.status === 'pending' && <button className="btn" onClick={handleApprove} disabled={loading}>Approve</button>}
          {requisition.status === 'pending' && <button className="btn btn-ghost" onClick={handleReject} disabled={loading}>Reject</button>}
          {requisition.status === 'approved' && <button className="btn" onClick={handleCreatePO} disabled={loading}>Create PO</button>}
        </div>
      </div>

      <div className="border rounded p-3">
        <div className="font-medium">Notes</div>
        <div className="text-sm text-gray-700">{requisition.notes || '—'}</div>
      </div>

      <div className="border rounded p-3">
        <div className="font-medium">Line Items</div>
        <div className="space-y-2 mt-2">
          {requisition.lines.map((l: any, i: number) => (
            <div key={i} className="flex justify-between">
              <div>{l.skuCode} — {l.brand} {l.model}</div>
              <div>{l.qty} × {l.unitCost}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
