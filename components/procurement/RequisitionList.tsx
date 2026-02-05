'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchRequisitions } from '@/actions/procurement';
import Link from 'next/link';

export default function RequisitionList() {
  const { data, isLoading } = useQuery({ queryKey: ['requisitions'], queryFn: fetchRequisitions });
  const requisitions = data?.data || [];

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Requisitions</h2>
        <Link href="/procurement/requisitions/new"><button className="btn">New Requisition</button></Link>
      </div>

      <div className="space-y-2">
        {requisitions.length === 0 && <div className="p-4 border rounded">No requisitions yet.</div>}
        {requisitions.map((r: any) => (
          <div key={r.id} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-semibold">{r.reference}</div>
              <div className="text-sm text-gray-600">{r.requesterName || r.requester || '—'} • {new Date(r.createdAt).toLocaleString()}</div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`px-2 py-1 rounded text-sm ${r.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : r.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{r.status}</div>
              <Link href={`/procurement/requisitions/${r.id}`}><button className="btn">Open</button></Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
